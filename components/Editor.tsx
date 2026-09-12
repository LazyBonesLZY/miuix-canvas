"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Inspector } from "@/components/Inspector";
import { LayersPanel } from "@/components/Layers";
import { OfficialMiuixFrame } from "@/components/OfficialMiuixFrame";
import { PartsPalette } from "@/components/PartsPalette";
import { Preview } from "@/components/Preview";
import { PromptPanel } from "@/components/PromptPanel";
import { ThemePanel } from "@/components/ThemePanel";
import { ConfirmDialog, Logo, Toolbar } from "@/components/Toolbar";
import { schemeFromSeed } from "@/lib/color";
import { cloneDoc, defaultDoc, emptyScreen, loadDoc, nextScreenOrigin, saveDoc, screenOf, UI_KEY } from "@/lib/doc";
import { detectLang, isLang, setGlobalLang, SHORTCUTS, t, type Lang } from "@/lib/i18n";
import { centerItem, centerViewOnScreen, convertPreset, duplicateItem, fitView, flowLinks, moveLayer, pinItem, snapMove, zoomAt } from "@/lib/layout";
import { readProject, saveProject } from "@/lib/project";
import { consumeShareHash, hasShareHash, readShareHash, shareUrl } from "@/lib/share";
import { tidyScreen } from "@/lib/tidy";
import { isLiveKind, isValueDragKind, livePatch } from "@/lib/interact";
import { KIND_SPEC, defaultPosition, makeItem } from "@/lib/tokens";
import type { Doc, FramePreset, Guide, Kind, Platform, Screen, Selection } from "@/lib/types";
import { BEZEL, FRAME_LABEL_H, HISTORY_MAX, clamp, frameSize, isTypingTarget, onGrid, uid } from "@/lib/types";
import { useLayoutMode, type LayoutMode } from "@/lib/viewport";

const GITHUB = "https://github.com/LazyBonesLZY/miuix-canvas";
const MIN_Z = 0.25;
const MAX_Z = 2.4;

type View = { x: number; y: number; z: number };
type LeftTab = "parts" | "layers";
type RightTab = "inspect" | "theme" | "prompt";
type Sheet = LeftTab | RightTab | null;

const RAIL: { tab: NonNullable<Sheet>; icon: string }[] = [
  { tab: "parts", icon: "widgets" },
  { tab: "layers", icon: "layers" },
  { tab: "inspect", icon: "tune" },
  { tab: "theme", icon: "palette" },
  { tab: "prompt", icon: "notes" },
];

function ToolRail({
  lang,
  sheet,
  onPick,
}: {
  lang: Lang;
  sheet: Sheet;
  onPick: (tab: NonNullable<Sheet>) => void;
}) {
  return (
    <nav className="tablet-rail">
      {RAIL.map(({ tab, icon }) => (
        <button
          key={tab}
          type="button"
          data-on={sheet === tab ? "1" : undefined}
          title={t(tab, lang)}
          onClick={() => onPick(tab)}
        >
          <span className="ms">{icon}</span>
          <span>{t(tab, lang)}</span>
        </button>
      ))}
    </nav>
  );
}

function useHistory(initial: Doc) {
  const [doc, setDocState] = useState(initial);
  const [marks, setMarks] = useState({ undo: 0, redo: 0 });
  const past = useRef<Doc[]>([]);
  const future = useRef<Doc[]>([]);
  const now = useRef(initial);
  now.current = doc;

  const skipSave = useRef(true);
  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    saveDoc(doc);
  }, [doc]);

  const bump = () => setMarks({ undo: past.current.length, redo: future.current.length });

  const setDoc = useCallback((next: Doc | ((prev: Doc) => Doc), record = true) => {
    setDocState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      if (record) {
        past.current = [...past.current, cloneDoc(prev)].slice(-HISTORY_MAX);
        future.current = [];
      }
      return value;
    });
    queueMicrotask(bump);
  }, []);

  const beginHistory = useCallback(() => {
    past.current = [...past.current, cloneDoc(now.current)].slice(-HISTORY_MAX);
    future.current = [];
    bump();
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    setDocState((cur) => {
      future.current.push(cloneDoc(cur));
      return prev;
    });
    queueMicrotask(bump);
  }, []);

  const redo = useCallback(() => {
    const nxt = future.current.pop();
    if (!nxt) return;
    setDocState((cur) => {
      past.current.push(cloneDoc(cur));
      return nxt;
    });
    queueMicrotask(bump);
  }, []);

  return { doc, setDoc, beginHistory, undo, redo, canUndo: marks.undo > 0, canRedo: marks.redo > 0 };
}

export function Editor({ initialLang, onReady }: { initialLang: Lang; onReady: () => void }) {
  const boot = useMemo(() => loadDoc() ?? defaultDoc(initialLang), [initialLang]);
  const { doc, setDoc, beginHistory, undo, redo, canUndo, canRedo } = useHistory(boot);
  const [lang, setLang] = useState<Lang>(initialLang);
  const [tool, setTool] = useState<"select" | "hand">("select");
  const [view, setView] = useState<View>({ x: 80, y: 64, z: 0.72 });
  const [selection, setSelection] = useState<Selection>(boot.screens[0] ? { kind: "screen", screenId: boot.screens[0].id } : null);
  const [left, setLeft] = useState<LeftTab>("parts");
  const [right, setRight] = useState<RightTab>("inspect");
  const [sheet, setSheet] = useState<Sheet>(null);
  const layout = useLayoutMode();
  const fitPad = layout === "phone" ? 20 : layout === "tablet" ? 36 : 56;
  const [preview, setPreview] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [guide, setGuide] = useState<Guide | null>(null);
  const didFit = useRef(false);
  const [shareReady, setShareReady] = useState(() => !hasShareHash());
  const dragKind = useRef<Kind | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const screenRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{
    type: "pan" | "item" | "screen";
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    screenId?: string;
    itemId?: string;
    recorded?: boolean;
    moved?: boolean;
    liveValue?: boolean;
    alreadySelected?: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (hasShareHash()) {
        const shared = await readShareHash();
        consumeShareHash();
        if (!cancelled && shared) {
          setDoc(shared, false);
          setSelection(shared.screens[0] ? { kind: "screen", screenId: shared.screens[0].id } : null);
          didFit.current = false;
        } else if (!cancelled && !shared) {
          setNotice(t("shareFailed", lang));
        }
      }
      if (!cancelled) {
        setShareReady(true);
        onReady();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang, onReady, setDoc]);

  useEffect(() => {
    setGlobalLang(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(UI_KEY, JSON.stringify({ lang }));
    } catch {
      /* ignore */
    }
  }, [lang]);

  const palette = useMemo(() => schemeFromSeed(doc.theme.seed, doc.theme.mode === "dark"), [doc.theme]);
  const selectedScreenId = selection?.screenId ?? doc.screens[0]?.id;

  const updateScreen = (screenId: string, fn: (s: Screen) => Screen, record = true) => {
    setDoc((d) => ({ ...d, screens: d.screens.map((s) => (s.id === screenId ? fn(s) : s)) }), record);
  };

  const canvasSize = () => canvasRef.current?.getBoundingClientRect();

  const fitCanvas = useCallback(() => {
    const rect = canvasSize();
    if (!rect || rect.width < 40 || rect.height < 40) return;
    setView(fitView(doc.screens, rect.width, rect.height, MIN_Z, MAX_Z, fitPad));
  }, [doc.screens, fitPad]);

  const centerSelection = useCallback((axis: "x" | "y" | "both" = "both") => {
    if (selection?.kind === "item") {
      const screen = screenOf(doc, selection.screenId);
      const it = screen?.items.find((i) => i.id === selection.itemId);
      if (!screen || !it) return;
      const next = centerItem(it, screen, axis);
      updateScreen(selection.screenId, (s) => ({
        ...s,
        items: s.items.map((row) => (row.id === it.id ? { ...row, ...next } : row)),
      }));
      return;
    }
    const screen = screenOf(doc, selection?.screenId ?? selectedScreenId);
    const rect = canvasSize();
    if (!screen || !rect) return;
    setView((v) => centerViewOnScreen(screen, rect.width, rect.height, v.z));
  }, [doc, selection, selectedScreenId, setDoc]);

  const pinSelection = useCallback((edge: "left" | "right" | "top" | "bottom") => {
    if (selection?.kind !== "item") return;
    const screen = screenOf(doc, selection.screenId);
    const it = screen?.items.find((i) => i.id === selection.itemId);
    if (!screen || !it) return;
    const next = pinItem(it, screen, edge);
    updateScreen(selection.screenId, (s) => ({
      ...s,
      items: s.items.map((row) => (row.id === it.id ? { ...row, ...next } : row)),
    }));
  }, [doc, selection, setDoc]);

  const addItem = (kind: Kind, screenId = selectedScreenId, at?: { x: number; y: number }) => {
    const created = uid();
    let target = screenId;
    setDoc((d) => {
      let screens = d.screens;
      if (!target) {
        const origin = nextScreenOrigin(d);
        const fresh = { ...emptyScreen("phone", screens.length, lang), ...origin, id: uid() };
        screens = [...screens, fresh];
        target = fresh.id;
      }
      const screen = screenOf({ ...d, screens }, target);
      if (!screen || screen.items.some((it) => it.id === created)) return d;
      const made = makeItem(kind, screen.preset, lang, at?.x ?? 0, at?.y ?? 0);
      made.id = created;
      if (!at) {
        const p = defaultPosition(kind, screen.preset, screen.items);
        made.x = p.x;
        made.y = p.y;
      }
      const size = frameSize(screen.preset);
      if (KIND_SPEC[kind].edge === "top" || KIND_SPEC[kind].edge === "bottom") made.w = size.w;
      return { ...d, screens: screens.map((s) => (s.id === target ? { ...s, items: [...s.items, made] } : s)) };
    });
    if (!target) return;
    setSelection({ kind: "item", screenId: target, itemId: created });
    setRight("inspect");
    if (layout === "phone") setSheet(null);
  };

  const addScreen = (preset: FramePreset) => {
    const origin = nextScreenOrigin(doc);
    const screen = { ...emptyScreen(preset, doc.screens.length, lang), ...origin, preset, id: uid() };
    setDoc((d) => ({ ...d, screens: [...d.screens, screen] }));
    setSelection({ kind: "screen", screenId: screen.id });
  };

  const deleteSelection = useCallback(() => {
    if (!selection) return;
    if (selection.kind === "item") {
      updateScreen(selection.screenId, (s) => ({ ...s, items: s.items.filter((i) => i.id !== selection.itemId) }));
      setSelection({ kind: "screen", screenId: selection.screenId });
      return;
    }
    setDoc((d) => ({ ...d, screens: d.screens.filter((s) => s.id !== selection.screenId) }));
    const rest = doc.screens.filter((s) => s.id !== selection.screenId);
    setSelection(rest[0] ? { kind: "screen", screenId: rest[0].id } : null);
  }, [selection, doc.screens, setDoc]);

  useEffect(() => {
    if (!shareReady) return;
    const el = canvasRef.current;
    if (!el) return;
    const run = () => {
      if (didFit.current) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 40 || rect.height < 40) return;
      setView(fitView(doc.screens, rect.width, rect.height, MIN_Z, MAX_Z, fitPad));
      didFit.current = true;
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    return () => ro.disconnect();
  }, [doc.screens, fitPad, shareReady]);

  const lastLayout = useRef<LayoutMode | null>(null);
  useEffect(() => {
    if (layout === "desktop") setSheet(null);
    if (lastLayout.current === null) {
      lastLayout.current = layout;
      return;
    }
    if (lastLayout.current === layout) return;
    lastLayout.current = layout;
    const id = requestAnimationFrame(() => {
      const el = canvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 40 || rect.height < 40) return;
      setView(fitView(doc.screens, rect.width, rect.height, MIN_Z, MAX_Z, fitPad));
    });
    return () => cancelAnimationFrame(id);
  }, [doc.screens, fitPad, layout]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const meta = e.metaKey || e.ctrlKey;
      const overlay = preview || helpOpen || shareOpen || resetOpen || (layout === "phone" && !!sheet);
      if (e.key === "Escape") {
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        if (shareOpen) {
          setShareOpen(false);
          return;
        }
        if (resetOpen) {
          setResetOpen(false);
          return;
        }
        if (sheet) {
          setSheet(null);
          return;
        }
        if (preview) {
          setPreview(false);
          return;
        }
      }
      if (overlay) return;
      if (e.key === " " && !meta) {
        e.preventDefault();
        setTool("hand");
      }
      if (e.key === "v" || e.key === "V") setTool("select");
      if ((e.key === "h" || e.key === "H") && !meta) setTool("hand");
      if (e.key === "p" || e.key === "P") setPreview(true);
      if ((e.key === "f" || e.key === "F" || e.key === "0") && !meta) {
        e.preventDefault();
        fitCanvas();
      }
      if (e.key === "1" && !meta) {
        const rect = canvasSize();
        if (rect) setView((v) => zoomAt(v, 1, rect.width / 2, rect.height / 2));
      }
      if ((e.key === "c" || e.key === "C") && !meta) {
        e.preventDefault();
        centerSelection(e.altKey ? "y" : e.shiftKey ? "x" : "both");
      }
      if ((e.key === "[" || e.key === "]") && !meta) {
        e.preventDefault();
        pinSelection(e.shiftKey ? (e.key === "[" ? "top" : "bottom") : e.key === "[" ? "left" : "right");
      }
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setHelpOpen((open) => !open);
      }
      if (meta && (e.key === "z" || e.key === "Z" || e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        if (e.key === "y" || e.key === "Y" || e.shiftKey) redo();
        else undo();
      }
      if (meta && (e.key === "d" || e.key === "D") && selection?.kind === "item") {
        e.preventDefault();
        const screen = screenOf(doc, selection.screenId);
        const it = screen?.items.find((i) => i.id === selection.itemId);
        if (it) {
          const copy = duplicateItem(it);
          updateScreen(selection.screenId, (s) => ({ ...s, items: [...s.items, copy] }));
          setSelection({ kind: "item", screenId: selection.screenId, itemId: copy.id });
        }
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selection) {
        e.preventDefault();
        deleteSelection();
      }
      if (selection?.kind === "item" && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 8 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        updateScreen(selection.screenId, (s) => ({
          ...s,
          items: s.items.map((it) => (it.id === selection.itemId ? { ...it, x: it.x + dx, y: it.y + dy } : it)),
        }));
      }
      if (e.key === "+" || e.key === "=") setView((v) => ({ ...v, z: clamp(v.z * 1.1, MIN_Z, MAX_Z) }));
      if (e.key === "-" || e.key === "_") setView((v) => ({ ...v, z: clamp(v.z / 1.1, MIN_Z, MAX_Z) }));
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === " " && !isTypingTarget(e.target)) setTool("select");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [centerSelection, deleteSelection, doc, fitCanvas, helpOpen, layout, pinSelection, preview, redo, resetOpen, selection, shareOpen, sheet, undo]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const z = (v: View) => clamp(v.z * (e.deltaY > 0 ? 0.92 : 1.08), MIN_Z, MAX_Z);
        setView((v) => zoomAt(v, z(v), e.clientX - rect.left, e.clientY - rect.top));
        return;
      }
      setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const screenAt = (clientX: number, clientY: number) => {
    const el = canvasRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left - view.x) / view.z;
    const y = (clientY - rect.top - view.y) / view.z;
    for (const screen of [...doc.screens].reverse()) {
      const { w, h } = frameSize(screen.preset);
      if (x >= screen.x && x <= screen.x + w + BEZEL * 2 && y >= screen.y && y <= screen.y + h + BEZEL * 2 + FRAME_LABEL_H) return screen;
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    if (tool === "hand" || e.altKey) {
      drag.current = { type: "pan", sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
      return;
    }
    const hit = screenAt(e.clientX, e.clientY);
    if (!hit) {
      setSelection(null);
      drag.current = { type: "pan", sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
      return;
    }
    const el = canvasRef.current!;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - view.x) / view.z - hit.x - BEZEL;
    const y = (e.clientY - rect.top - view.y) / view.z - hit.y - FRAME_LABEL_H - BEZEL;
    if (y < 0) {
      setSelection({ kind: "screen", screenId: hit.id });
      drag.current = { type: "screen", sx: e.clientX, sy: e.clientY, ox: hit.x, oy: hit.y, screenId: hit.id };
      return;
    }
    const item = [...hit.items].reverse().find((it) => x >= it.x && x <= it.x + it.w && y >= it.y && y <= it.y + it.h);
    if (item) {
      const alreadySelected = selection?.kind === "item" && selection.itemId === item.id;
      setSelection({ kind: "item", screenId: hit.id, itemId: item.id });
      drag.current = {
        type: "item",
        sx: e.clientX,
        sy: e.clientY,
        ox: item.x,
        oy: item.y,
        screenId: hit.id,
        itemId: item.id,
        alreadySelected,
      };
    } else {
      setSelection({ kind: "screen", screenId: hit.id });
      drag.current = { type: "screen", sx: e.clientX, sy: e.clientY, ox: hit.x, oy: hit.y, screenId: hit.id };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (d.type === "pan") {
      setView((v) => ({ ...v, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }));
      return;
    }
    const dx = (e.clientX - d.sx) / view.z;
    const dy = (e.clientY - d.sy) / view.z;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
    if (d.type === "item" && d.alreadySelected && d.screenId && d.itemId && !d.liveValue) {
      const current = screenOf(doc, d.screenId)?.items.find((it) => it.id === d.itemId);
      if (current && isValueDragKind(current.kind)) d.liveValue = true;
    }
    if (d.type === "item" && d.liveValue && d.screenId && d.itemId) {
      const el = canvasRef.current;
      if (!el) return;
      if (!d.recorded) {
        beginHistory();
        d.recorded = true;
      }
      d.moved = true;
      const rect = el.getBoundingClientRect();
      setDoc((cur) => {
        const screen = screenOf(cur, d.screenId);
        const it = screen?.items.find((item) => item.id === d.itemId);
        if (!screen || !it) return cur;
        const x = (e.clientX - rect.left - view.x) / view.z - screen.x - BEZEL;
        const y = (e.clientY - rect.top - view.y) / view.z - screen.y - FRAME_LABEL_H - BEZEL;
        const patch = livePatch(it, (x - it.x) / it.w, (y - it.y) / it.h);
        if (!patch) return cur;
        return {
          ...cur,
          screens: cur.screens.map((s) =>
            s.id === d.screenId ? { ...s, items: s.items.map((item) => (item.id === d.itemId ? { ...item, ...patch } : item)) } : s,
          ),
        };
      }, false);
      return;
    }
    d.moved = true;
    if (!d.recorded) {
      beginHistory();
      d.recorded = true;
    }
    if (d.type === "screen" && d.screenId) {
      setDoc((cur) => ({
        ...cur,
        screens: cur.screens.map((s) => (s.id === d.screenId ? { ...s, x: onGrid(d.ox + dx), y: onGrid(d.oy + dy) } : s)),
      }), false);
      return;
    }
    if (d.type === "item" && d.screenId && d.itemId) {
      let guideNext: Guide | null = null;
      setDoc((cur) => {
        const screen = screenOf(cur, d.screenId);
        const moving = screen?.items.find((it) => it.id === d.itemId);
        if (!screen || !moving) return cur;
        const snapped = snapMove(moving, screen.items.filter((it) => it.id !== moving.id), d.ox + dx, d.oy + dy);
        guideNext = snapped.guide;
        return {
          ...cur,
          screens: cur.screens.map((s) =>
            s.id === d.screenId
              ? { ...s, items: s.items.map((it) => (it.id === d.itemId ? { ...it, x: snapped.x, y: snapped.y } : it)) }
              : s,
          ),
        };
      }, false);
      setGuide(guideNext);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    setGuide(null);
    if (!d || d.type !== "item" || d.moved || d.liveValue || !d.alreadySelected || !d.screenId || !d.itemId) return;
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDoc((cur) => {
      const screen = screenOf(cur, d.screenId);
      const it = screen?.items.find((item) => item.id === d.itemId);
      if (!screen || !it || !isLiveKind(it.kind)) return cur;
      const x = (e.clientX - rect.left - view.x) / view.z - screen.x - BEZEL;
      const y = (e.clientY - rect.top - view.y) / view.z - screen.y - FRAME_LABEL_H - BEZEL;
      const patch = livePatch(it, (x - it.x) / it.w, (y - it.y) / it.h);
      if (!patch) return cur;
      return {
        ...cur,
        screens: cur.screens.map((s) =>
          s.id === d.screenId ? { ...s, items: s.items.map((item) => (item.id === d.itemId ? { ...item, ...patch } : item)) } : s,
        ),
      };
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const kind = dragKind.current;
    if (!kind) return;
    const hit = screenAt(e.clientX, e.clientY);
    if (!hit) return;
    const el = canvasRef.current!;
    const rect = el.getBoundingClientRect();
    const x = onGrid((e.clientX - rect.left - view.x) / view.z - hit.x - BEZEL);
    const y = onGrid((e.clientY - rect.top - view.y) / view.z - hit.y - FRAME_LABEL_H - BEZEL);
    addItem(kind, hit.id, { x, y });
    dragKind.current = null;
  };

  const exportPng = async () => {
    const id = selectedScreenId;
    if (!id) return;
    const node = screenRefs.current[id];
    if (!node) return;
    const canvas = node.querySelector("iframe")?.contentDocument?.querySelector("canvas");
    if (!canvas) {
      setNotice(t("loadFailed", lang));
      return;
    }
    const data = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = data;
    a.download = `${doc.title || "miuix"}-${screenOf(doc, id)?.name || "screen"}.png`;
    a.click();
  };

  const openShare = async () => {
    setShareText(await shareUrl(doc));
    setShareOpen(true);
  };

  const pickSheet = (tab: NonNullable<Sheet>) => {
    if (tab === "parts" || tab === "layers") setLeft(tab);
    else setRight(tab);
    setSheet((cur) => (cur === tab ? null : tab));
  };

  const side = (kind: "left" | "right", children: React.ReactNode, extra = "") => (
    <aside className={`flex h-full min-h-0 shrink-0 flex-col border-[var(--line)] bg-[var(--surface)] ${kind === "left" ? "w-[288px] border-r" : "w-[300px] border-l"} ${extra}`}>
      {children}
    </aside>
  );

  const leftBody = (
    <div className="flex h-full min-h-0 flex-col">
      {layout === "desktop" && (
        <div className="p-2">
          <div className="miuix-tabbar">
            {(["parts", "layers"] as LeftTab[]).map((tab) => (
              <button key={tab} type="button" data-on={left === tab ? "1" : undefined} onClick={() => setLeft(tab)}>
                {t(tab, lang)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="panel-scroll min-h-0 flex-1">
        {left === "parts" ? (
          <PartsPalette lang={lang} onAdd={(k) => { addItem(k); }} onDragStart={(k) => { dragKind.current = k; }} />
        ) : (
          <LayersPanel
            doc={doc}
            lang={lang}
            selection={selection}
            onSelect={setSelection}
            onMove={(sid, iid, dir) => updateScreen(sid, (s) => ({ ...s, items: moveLayer(s.items, iid, dir) }))}
          />
        )}
      </div>
    </div>
  );

  const rightBody = (
    <div className="flex h-full min-h-0 flex-col">
      {layout === "desktop" && (
        <div className="p-2">
          <div className="miuix-tabbar">
            {(["inspect", "theme", "prompt"] as RightTab[]).map((tab) => (
              <button key={tab} type="button" data-on={right === tab ? "1" : undefined} onClick={() => setRight(tab)}>
                {t(tab, lang)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="panel-scroll min-h-0 flex-1">
        {right === "inspect" && (
          <Inspector
            doc={doc}
            lang={lang}
            selection={selection}
            onBeginHistory={beginHistory}
            onChangeTitle={(title, record = true) => setDoc((d) => ({ ...d, title }), record)}
            onChangeScreen={(id, patch, record = true) => updateScreen(id, (s) => ({ ...s, ...patch }), record)}
            onChangeItem={(sid, iid, patch, record = true) => updateScreen(sid, (s) => ({ ...s, items: s.items.map((it) => (it.id === iid ? { ...it, ...patch } : it)) }), record)}
          />
        )}
        {right === "theme" && (
          <ThemePanel
            doc={doc}
            lang={lang}
            onBeginHistory={beginHistory}
            onTheme={(patch, record = true) => setDoc((d) => ({ ...d, theme: { ...d.theme, ...patch } }), record)}
            onPlatform={(platform: Platform) => setDoc((d) => ({ ...d, platform }))}
          />
        )}
        {right === "prompt" && <PromptPanel doc={doc} lang={lang} />}
      </div>
    </div>
  );

  return (
    <div className="app-root flex flex-col" data-theme={doc.theme.mode} data-lang={lang} data-layout={layout}>
      {notice && (
        <button type="button" className="fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-2xl bg-[var(--chrome)] px-4 py-2 text-sm shadow-[0_8px_24px_rgba(0,0,0,0.16)]" onClick={() => setNotice("")}>
          {notice}
        </button>
      )}
      <Toolbar
        lang={lang}
        layout={layout}
        tool={tool}
        canUndo={canUndo}
        canRedo={canRedo}
        onTool={setTool}
        onUndo={undo}
        onRedo={redo}
        onTidy={() => selectedScreenId && updateScreen(selectedScreenId, tidyScreen)}
        onAddPhone={() => addScreen("phone")}
        onAddDesktop={() => addScreen("desktop")}
        onPreview={() => setPreview(true)}
        onSave={() => saveProject(doc)}
        onLoad={() => fileRef.current?.click()}
        onShare={openShare}
        onPng={exportPng}
        onFit={fitCanvas}
        onCenter={() => centerSelection("both")}
        onHelp={() => setHelpOpen(true)}
        onReset={() => setResetOpen(true)}
        onLang={setLang}
        github={GITHUB}
      />
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const next = await readProject(file);
          if (next) {
            setDoc(next);
            setSelection(next.screens[0] ? { kind: "screen", screenId: next.screens[0].id } : null);
            didFit.current = false;
          } else {
            setNotice(t("loadFailed", lang));
          }
        }}
      />
      <div className="flex min-h-0 flex-1">
        {layout === "desktop" && side("left", leftBody)}
        {layout === "tablet" && (
          <>
            <ToolRail lang={lang} sheet={sheet} onPick={pickSheet} />
            {sheet && (
              <aside className="tablet-panel">
                <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
                  <span className="text-[15px] font-medium">{t(sheet, lang)}</span>
                  <button type="button" className="press text-[13px] text-[var(--accent)]" onClick={() => setSheet(null)}>
                    {t("hidePanel", lang)}
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  {sheet === "parts" || sheet === "layers" ? leftBody : rightBody}
                </div>
              </aside>
            )}
          </>
        )}
        <div
          ref={canvasRef}
          className={`canvas-stage relative min-w-0 flex-1 overflow-hidden ${tool === "hand" ? "cursor-grab" : "cursor-default"}`}
          style={{ background: "var(--canvas)" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            const hit = screenAt(e.clientX, e.clientY);
            const rect = canvasSize();
            if (!hit) {
              fitCanvas();
              return;
            }
            if (rect) setView(centerViewOnScreen(hit, rect.width, rect.height, view.z));
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          {!doc.screens.length && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center px-8 text-center text-[15px] text-[var(--muted-strong)]">
              {t("emptyCanvas", lang)}
            </div>
          )}
          <div className="miuix-zoom absolute bottom-3 left-3 z-10">
            <button type="button" className="press miuix-icon-btn h-8 min-w-8" title={t("zoomOut", lang)} onClick={() => {
              const rect = canvasSize();
              if (rect) setView((v) => zoomAt(v, clamp(v.z / 1.1, MIN_Z, MAX_Z), rect.width / 2, rect.height / 2));
            }}>
              <span className="ms text-[18px]">remove</span>
            </button>
            <button type="button" className="press miuix-chip" title={t("fit", lang)} onClick={fitCanvas}>
              {Math.round(view.z * 100)}%
            </button>
            <button type="button" className="press miuix-icon-btn h-8 min-w-8" title={t("zoomIn", lang)} onClick={() => {
              const rect = canvasSize();
              if (rect) setView((v) => zoomAt(v, clamp(v.z * 1.1, MIN_Z, MAX_Z), rect.width / 2, rect.height / 2));
            }}>
              <span className="ms text-[18px]">add</span>
            </button>
          </div>
          <div style={{ position: "absolute", left: view.x, top: view.y, transform: `scale(${view.z})`, transformOrigin: "0 0" }}>
            <svg style={{ position: "absolute", left: -2000, top: -2000, width: 8000, height: 4000, overflow: "visible", pointerEvents: "none" }}>
              {doc.screens.flatMap((screen) =>
                flowLinks(screen).map((link, i) => {
                  const dest = doc.screens.find((s) => s.id === link.to);
                  if (!dest) return null;
                  const a = frameSize(screen.preset);
                  const b = frameSize(dest.preset);
                  const x1 = 2000 + screen.x + a.w / 2;
                  const y1 = 2000 + screen.y + FRAME_LABEL_H + a.h / 2;
                  const x2 = 2000 + dest.x + b.w / 2;
                  const y2 = 2000 + dest.y + FRAME_LABEL_H + b.h / 2;
                  return <line key={`${screen.id}-${link.to}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={palette.primary} strokeWidth="2" strokeDasharray="6 6" opacity="0.55" />;
                }),
              )}
            </svg>
            {doc.screens.map((screen) => {
              const { w, h, r } = frameSize(screen.preset);
              const selected = selection?.screenId === screen.id;
              return (
                <div key={screen.id} style={{ position: "absolute", left: screen.x, top: screen.y, width: w + BEZEL * 2 }}>
                  <div className={`mb-1 flex items-center justify-between px-1 text-[12px] ${selected ? "text-[var(--accent)]" : "text-[var(--muted)]"}`} style={{ height: FRAME_LABEL_H - 8 }}>
                    <span className="min-w-0 truncate font-medium" title={screen.name}>{screen.name}</span>
                    <button
                      type="button"
                      className="press miuix-chip"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateScreen(screen.id, (s) => convertPreset(s, s.preset === "phone" ? "desktop" : "phone"));
                      }}
                    >
                      {screen.preset === "phone" ? t("phone", lang) : t("desktop", lang)}
                    </button>
                  </div>
                  <div
                    ref={(el) => { screenRefs.current[screen.id] = el; }}
                    style={{
                      width: w,
                      height: h,
                      marginLeft: BEZEL,
                      borderRadius: r,
                      background: palette.surface,
                      boxShadow: selected ? `0 0 0 2px ${palette.primary}` : "0 12px 40px rgba(0,0,0,0.12)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <OfficialMiuixFrame screen={screen} theme={doc.theme} lang={lang} />
                    {guide && selected && (
                      <>
                        {guide.gx !== undefined && <div style={{ position: "absolute", left: guide.gx, top: 0, bottom: 0, width: 1, background: palette.primary, opacity: 0.7, pointerEvents: "none" }} />}
                        {guide.gy !== undefined && <div style={{ position: "absolute", top: guide.gy, left: 0, right: 0, height: 1, background: palette.primary, opacity: 0.7, pointerEvents: "none" }} />}
                      </>
                    )}
                    {screen.items.map((it) => {
                      const on = selection?.kind === "item" && selection.itemId === it.id;
                      return (
                        <div
                          key={it.id}
                          style={{
                            position: "absolute",
                            left: it.x,
                            top: it.y,
                            width: it.w,
                            height: it.h,
                            outline: on ? `2px solid ${palette.primary}` : undefined,
                            outlineOffset: 1,
                            borderRadius: 4,
                          }}
                        >
                          {it.to && (
                            <span className="ms" style={{ position: "absolute", right: 2, top: 2, fontSize: 12, color: palette.primary, pointerEvents: "none" }}>south_east</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {layout === "desktop" && side("right", rightBody)}
      </div>
      {layout === "phone" && (
        <nav className="mobile-bar">
          {RAIL.map(({ tab, icon }) => {
            const on = sheet === tab;
            return (
              <button
                key={tab}
                type="button"
                className={`press flex min-h-12 flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] ${on ? "text-[var(--accent)]" : "text-[var(--muted-strong)]"}`}
                onClick={() => pickSheet(tab)}
              >
                <span className="ms text-[20px]">{icon}</span>
                {t(tab, lang)}
              </button>
            );
          })}
        </nav>
      )}
      {layout === "phone" && sheet && (
        <div className="preview-root mobile-sheet" onClick={() => setSheet(null)}>
          <div className="mobile-sheet-card" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-[15px] font-medium">{t(sheet, lang)}</span>
              <button type="button" className="press text-[13px] text-[var(--accent)]" onClick={() => setSheet(null)}>{t("close", lang)}</button>
            </div>
            <div className="flex h-[min(70dvh,640px)] min-h-0 flex-col overflow-hidden">
              {sheet === "parts" || sheet === "layers" ? leftBody : rightBody}
            </div>
          </div>
        </div>
      )}
      {resetOpen && (
        <ConfirmDialog
          title={t("reset", lang)}
          body={t("resetHint", lang)}
          cancel={t("cancel", lang)}
          confirm={t("resetConfirm", lang)}
          onCancel={() => setResetOpen(false)}
          onConfirm={() => {
            const next = defaultDoc(lang);
            setDoc(next);
            setSelection(next.screens[0] ? { kind: "screen", screenId: next.screens[0].id } : null);
            setTool("select");
            setSheet(null);
            didFit.current = false;
            setResetOpen(false);
          }}
        />
      )}
      {helpOpen && (
        <div className="preview-root" onClick={() => setHelpOpen(false)}>
          <div className="miuix-dialog w-[min(440px,92vw)]" onClick={(e) => e.stopPropagation()}>
            <div className="miuix-dialog-title">{t("shortcutsTitle", lang)}</div>
            <div className="mt-3 flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
              {SHORTCUTS[lang].map((row) => (
                <div key={row.keys} className="flex items-start justify-between gap-4 text-[14px]">
                  <kbd className="shrink-0 rounded-[12px] bg-[var(--tile)] px-2 py-1 font-mono text-[12px]">{row.keys}</kbd>
                  <span className="flex-1 text-[var(--muted-strong)]">{row.action}</span>
                </div>
              ))}
            </div>
            <div className="miuix-dialog-actions">
              <button type="button" className="press miuix-text-btn" data-accent="1" onClick={() => setHelpOpen(false)}>
                {t("close", lang)}
              </button>
            </div>
          </div>
        </div>
      )}
      {preview && <Preview doc={doc} lang={lang} startId={selectedScreenId} onClose={() => setPreview(false)} />}
      {shareOpen && (
        <div className="preview-root" onClick={() => setShareOpen(false)}>
          <div className="miuix-dialog w-[min(440px,92vw)]" onClick={(e) => e.stopPropagation()}>
            <div className="miuix-dialog-title">{t("share", lang)}</div>
            <p className="miuix-dialog-body">{t("shareHint", lang)}</p>
            <div className="mt-3 break-all rounded-[16px] bg-[var(--tile)] p-3 text-[12px]">{shareText}</div>
            <div className="miuix-dialog-actions">
              <button type="button" className="press miuix-text-btn" onClick={() => setShareOpen(false)}>{t("close", lang)}</button>
              <button
                type="button"
                className="press miuix-text-btn"
                data-accent="1"
                onClick={async () => {
                  await navigator.clipboard.writeText(shareText);
                  setShareCopied(true);
                  setTimeout(() => setShareCopied(false), 1400);
                }}
              >
                {shareCopied ? t("linkCopied", lang) : t("copy", lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BootMark({ done }: { done: boolean }) {
  return (
    <div className="miuix-boot" data-done={done ? "" : undefined} aria-hidden={done}>
      <Logo size={44} />
    </div>
  );
}

export function readInitialLang(): Lang {
  try {
    const ui = JSON.parse(localStorage.getItem(UI_KEY) ?? "null");
    if (isLang(ui?.lang)) return ui.lang;
  } catch {
    /* ignore */
  }
  return detectLang();
}
