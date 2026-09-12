"use client";

import { toPng } from "html-to-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Inspector } from "@/components/Inspector";
import { LayersPanel } from "@/components/Layers";
import { MiuixNode, StatusBar } from "@/components/MiuixNode";
import { PartsPalette } from "@/components/PartsPalette";
import { Preview } from "@/components/Preview";
import { PromptPanel } from "@/components/PromptPanel";
import { ThemePanel } from "@/components/ThemePanel";
import { Logo, Toolbar } from "@/components/Toolbar";
import { schemeFromSeed } from "@/lib/color";
import { cloneDoc, defaultDoc, emptyScreen, loadDoc, nextScreenOrigin, saveDoc, screenOf, UI_KEY } from "@/lib/doc";
import { detectLang, setGlobalLang, t, type Lang } from "@/lib/i18n";
import { readProject, saveProject } from "@/lib/project";
import { hasShareHash, readShareHash, shareUrl } from "@/lib/share";
import { tidyScreen } from "@/lib/tidy";
import { KIND_SPEC, defaultPosition, makeItem } from "@/lib/tokens";
import type { Doc, FramePreset, Kind, Platform, Screen, Selection } from "@/lib/types";
import { BEZEL, FRAME_LABEL_H, GESTURE_H, HISTORY_MAX, clamp, frameSize, onGrid, uid } from "@/lib/types";

const GITHUB = "https://github.com/LazyBonesLZY/miuix-canvas";
const MIN_Z = 0.25;
const MAX_Z = 2.4;

type View = { x: number; y: number; z: number };
type LeftTab = "parts" | "layers";
type RightTab = "inspect" | "theme" | "prompt";
type DragKind = Kind | null;

function useHistory(initial: Doc) {
  const [doc, setDocState] = useState(initial);
  const [marks, setMarks] = useState({ undo: 0, redo: 0 });
  const past = useRef<Doc[]>([]);
  const future = useRef<Doc[]>([]);

  useEffect(() => {
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

  return { doc, setDoc, undo, redo, canUndo: marks.undo > 0, canRedo: marks.redo > 0 };
}

export function Editor({ initialLang, onReady }: { initialLang: Lang; onReady: () => void }) {
  const boot = useMemo(() => {
    if (hasShareHash()) return readShareHash() ?? defaultDoc(initialLang);
    return loadDoc() ?? defaultDoc(initialLang);
  }, [initialLang]);

  const { doc, setDoc, undo, redo, canUndo, canRedo } = useHistory(boot);
  const [lang, setLang] = useState<Lang>(initialLang);
  const [tool, setTool] = useState<"select" | "hand">("select");
  const [view, setView] = useState<View>({ x: 80, y: 64, z: 0.72 });
  const [selection, setSelection] = useState<Selection>(boot.screens[0] ? { kind: "screen", screenId: boot.screens[0].id } : null);
  const [left, setLeft] = useState<LeftTab>("parts");
  const [right, setRight] = useState<RightTab>("inspect");
  const [preview, setPreview] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const dragKind = useRef<DragKind>(null);
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
  } | null>(null);

  useEffect(() => {
    onReady();
  }, [onReady]);

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

  const updateScreen = (screenId: string, fn: (s: Screen) => Screen) => {
    setDoc((d) => ({ ...d, screens: d.screens.map((s) => (s.id === screenId ? fn(s) : s)) }));
  };

  const addItem = (kind: Kind, screenId = selectedScreenId, at?: { x: number; y: number }) => {
    if (!screenId) return;
    const created = uid();
    setDoc((d) => {
      const screen = screenOf(d, screenId);
      if (!screen) return d;
      if (screen.items.some((it) => it.id === created)) return d;
      const made = makeItem(kind, screen.preset, lang, at?.x ?? 0, at?.y ?? 0);
      made.id = created;
      if (!at) {
        const p = defaultPosition(kind, screen.preset, screen.items);
        made.x = p.x;
        made.y = p.y;
      }
      const size = frameSize(screen.preset);
      if (KIND_SPEC[kind].edge === "top" || KIND_SPEC[kind].edge === "bottom") made.w = size.w;
      return { ...d, screens: d.screens.map((s) => (s.id === screenId ? { ...s, items: [...s.items, made] } : s)) };
    });
    setSelection({ kind: "item", screenId, itemId: created });
    setRight("inspect");
  };

  const addPart = (kind: Kind) => addItem(kind);

  const addScreen = (preset: FramePreset) => {
    const origin = nextScreenOrigin(doc);
    const screen = { ...emptyScreen(preset, doc.screens.length, lang), ...origin, preset };
    screen.id = uid();
    setDoc((d) => ({ ...d, screens: [...d.screens, screen] }));
    setSelection({ kind: "screen", screenId: screen.id });
  };

  const deleteSelection = () => {
    if (!selection) return;
    if (selection.kind === "item") {
      updateScreen(selection.screenId, (s) => ({ ...s, items: s.items.filter((i) => i.id !== selection.itemId) }));
      setSelection({ kind: "screen", screenId: selection.screenId });
      return;
    }
    setDoc((d) => ({ ...d, screens: d.screens.filter((s) => s.id !== selection.screenId) }));
    setSelection(doc.screens.find((s) => s.id !== selection.screenId) ? { kind: "screen", screenId: doc.screens.find((s) => s.id !== selection.screenId)!.id } : null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (e.key === "Escape") setPreview(false);
      if (e.key === " " && !meta) {
        e.preventDefault();
        setTool("hand");
      }
      if (e.key === "v" || e.key === "V") setTool("select");
      if (e.key === "h" || e.key === "H") setTool("hand");
      if (e.key === "p" || e.key === "P") setPreview(true);
      if (meta && e.key === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        deleteSelection();
      }
      if (e.key === "+" || e.key === "=") setView((v) => ({ ...v, z: clamp(v.z * 1.1, MIN_Z, MAX_Z) }));
      if (e.key === "-" || e.key === "_") setView((v) => ({ ...v, z: clamp(v.z / 1.1, MIN_Z, MAX_Z) }));
      if (e.key === "0") setView({ x: 80, y: 64, z: 0.72 });
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === " ") setTool("select");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  });

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
    if (tool === "select" && !e.altKey) {
      setDoc((d) => d);
    }
    if (tool === "hand" || e.altKey) {
      drag.current = { type: "pan", sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
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
      setSelection({ kind: "item", screenId: hit.id, itemId: item.id });
      drag.current = { type: "item", sx: e.clientX, sy: e.clientY, ox: item.x, oy: item.y, screenId: hit.id, itemId: item.id };
    } else {
      setSelection({ kind: "screen", screenId: hit.id });
      drag.current = { type: "screen", sx: e.clientX, sy: e.clientY, ox: hit.x, oy: hit.y, screenId: hit.id };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.sx) / (d.type === "pan" ? 1 : view.z);
    const dy = (e.clientY - d.sy) / (d.type === "pan" ? 1 : view.z);
    if (d.type === "pan") {
      setView((v) => ({ ...v, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }));
      return;
    }
    if (d.type === "screen" && d.screenId) {
      setDoc((cur) => ({
        ...cur,
        screens: cur.screens.map((s) => (s.id === d.screenId ? { ...s, x: onGrid(d.ox + dx), y: onGrid(d.oy + dy) } : s)),
      }), false);
      return;
    }
    if (d.type === "item" && d.screenId && d.itemId) {
      setDoc((cur) => ({
        ...cur,
        screens: cur.screens.map((s) =>
          s.id === d.screenId
            ? { ...s, items: s.items.map((it) => (it.id === d.itemId ? { ...it, x: onGrid(d.ox + dx), y: onGrid(d.oy + dy) } : it)) }
            : s,
        ),
      }), false);
    }
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const next = clamp(view.z * (e.deltaY > 0 ? 0.92 : 1.08), MIN_Z, MAX_Z);
      setView((v) => ({ ...v, z: next }));
      return;
    }
    setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
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
    const data = await toPng(node, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a");
    a.href = data;
    a.download = `${doc.title || "miuix"}-${screenOf(doc, id)?.name || "screen"}.png`;
    a.click();
  };

  const copyShare = async () => {
    const url = shareUrl(doc);
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1400);
  };

  return (
    <div className="app-root flex flex-col" data-theme={doc.theme.mode}>
      <Toolbar
        lang={lang}
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
        onShare={() => setShareOpen(true)}
        onPng={exportPng}
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
          }
        }}
      />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[260px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--chrome)]">
          <div className="flex gap-1 p-2">
            {(["parts", "layers"] as LeftTab[]).map((tab) => (
              <button key={tab} type="button" onClick={() => setLeft(tab)} className={`press flex-1 rounded-[10px] py-1.5 text-[12px] ${left === tab ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                {t(tab, lang)}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {left === "parts" ? (
              <PartsPalette lang={lang} onAdd={addPart} onDragStart={(k) => { dragKind.current = k; }} />
            ) : (
              <LayersPanel doc={doc} lang={lang} selection={selection} onSelect={setSelection} />
            )}
          </div>
        </aside>
        <div
          ref={canvasRef}
          className={`relative min-w-0 flex-1 overflow-hidden ${tool === "hand" ? "cursor-grab" : "cursor-default"}`}
          style={{ background: "var(--canvas)" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div style={{ position: "absolute", left: view.x, top: view.y, transform: `scale(${view.z})`, transformOrigin: "0 0" }}>
            {doc.screens.map((screen) => {
              const { w, h, r } = frameSize(screen.preset);
              const selected = selection?.screenId === screen.id;
              return (
                <div key={screen.id} style={{ position: "absolute", left: screen.x, top: screen.y, width: w + BEZEL * 2 }}>
                  <div className={`mb-1 flex items-center justify-between px-1 text-[12px] ${selected ? "text-[var(--accent)]" : "text-[var(--muted)]"}`} style={{ height: FRAME_LABEL_H - 8 }}>
                    <span className="font-medium">{screen.name}</span>
                    <button
                      type="button"
                      className="press rounded-full bg-[var(--tile)] px-2 py-0.5 text-[11px] text-[var(--ink)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateScreen(screen.id, (s) => {
                          const preset = s.preset === "phone" ? "desktop" : "phone";
                          const size = frameSize(preset);
                          return {
                            ...s,
                            preset,
                            items: s.items.map((it) => {
                              if (KIND_SPEC[it.kind].edge === "top" || KIND_SPEC[it.kind].edge === "bottom") return { ...it, w: size.w, y: it.kind === "navigationBar" ? size.h - it.h : it.y };
                              return it;
                            }),
                          };
                        });
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
                    <StatusBar palette={palette} dark={doc.theme.mode === "dark"} />
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
                          <MiuixNode item={it} palette={palette} />
                          {it.to && (
                            <span className="ms" style={{ position: "absolute", right: 2, top: 2, fontSize: 12, color: palette.primary, pointerEvents: "none" }}>south_east</span>
                          )}
                        </div>
                      );
                    })}
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: GESTURE_H, display: "grid", placeItems: "center", pointerEvents: "none" }}>
                      <div style={{ width: 96, height: 4, borderRadius: 4, background: doc.theme.mode === "dark" ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <aside className="flex w-[300px] shrink-0 flex-col border-l border-[var(--line)] bg-[var(--chrome)]">
          <div className="flex gap-1 p-2">
            {(["inspect", "theme", "prompt"] as RightTab[]).map((tab) => (
              <button key={tab} type="button" onClick={() => setRight(tab)} className={`press flex-1 rounded-[10px] py-1.5 text-[12px] ${right === tab ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                {t(tab, lang)}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {right === "inspect" && (
              <Inspector
                doc={doc}
                lang={lang}
                selection={selection}
                onChangeTitle={(title) => setDoc((d) => ({ ...d, title }))}
                onChangeScreen={(id, patch) => updateScreen(id, (s) => ({ ...s, ...patch }))}
                onChangeItem={(sid, iid, patch) => updateScreen(sid, (s) => ({ ...s, items: s.items.map((it) => (it.id === iid ? { ...it, ...patch } : it)) }))}
              />
            )}
            {right === "theme" && (
              <ThemePanel
                doc={doc}
                lang={lang}
                onTheme={(patch) => setDoc((d) => ({ ...d, theme: { ...d.theme, ...patch } }))}
                onPlatform={(platform: Platform) => setDoc((d) => ({ ...d, platform }))}
              />
            )}
            {right === "prompt" && <PromptPanel doc={doc} lang={lang} />}
          </div>
        </aside>
      </div>
      {preview && <Preview doc={doc} lang={lang} startId={selectedScreenId} onClose={() => setPreview(false)} />}
      {shareOpen && (
        <div className="preview-root" onClick={() => setShareOpen(false)}>
          <div className="w-[min(440px,92vw)] rounded-[18px] bg-[var(--chrome)] p-5 text-[var(--ink)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 text-[16px] font-semibold">{t("share", lang)}</div>
            <p className="mb-3 text-[12px] text-[var(--muted)]">{t("shareHint", lang)}</p>
            <div className="mb-3 break-all rounded-[12px] bg-[var(--tile)] p-3 text-[11px]">{typeof location !== "undefined" ? shareUrl(doc) : ""}</div>
            <button type="button" className="press w-full rounded-[12px] bg-[var(--accent)] py-2.5 text-[13px] text-white" onClick={copyShare}>
              {shareCopied ? t("linkCopied", lang) : t("copy", lang)}
            </button>
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
    if (ui?.lang === "zh" || ui?.lang === "en") return ui.lang;
  } catch {
    /* ignore */
  }
  return detectLang();
}
