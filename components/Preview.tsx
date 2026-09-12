"use client";

import { useEffect, useRef, useState } from "react";
import { MiuixNode, StatusBar } from "@/components/MiuixNode";
import { schemeFromSeed } from "@/lib/color";
import { t, type Lang } from "@/lib/i18n";
import { isLiveKind, isValueDragKind, livePatch } from "@/lib/interact";
import { prefJoin, previewScale } from "@/lib/layout";
import type { Doc, Item, Transition } from "@/lib/types";
import { BACK_TARGET, GESTURE_H, frameSize } from "@/lib/types";

const ANIM: Record<Transition, string> = {
  slide: "preview-slide",
  slideLeft: "preview-slide-left",
  slideUp: "preview-slide-up",
  slideDown: "preview-slide-down",
  fade: "preview-fade",
  none: "",
};

export function Preview({
  doc,
  lang,
  startId,
  onClose,
}: {
  doc: Doc;
  lang: Lang;
  startId?: string;
  onClose: () => void;
}) {
  const [stack, setStack] = useState<string[]>([startId ?? doc.screens[0]?.id].filter(Boolean));
  const [anim, setAnim] = useState("");
  const [local, setLocal] = useState<Record<string, Partial<Item>>>({});
  const [box, setBox] = useState(() => ({
    vw: typeof window !== "undefined" ? window.innerWidth : 412,
    vh: typeof window !== "undefined" ? window.innerHeight : 800,
  }));
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const liveDrag = useRef(false);
  const currentId = stack.at(-1);
  const screen = doc.screens.find((s) => s.id === currentId) ?? doc.screens[0];
  const palette = schemeFromSeed(doc.theme.seed, doc.theme.mode === "dark");
  const { w, h, r } = frameSize(screen?.preset ?? "phone");
  const scale = previewScale(w, h, box.vw, box.vh);

  useEffect(() => {
    const measure = () => setBox({ vw: window.innerWidth, vh: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const go = (to: string | undefined, transition?: Transition) => {
    if (!to) return;
    setAnim(ANIM[transition ?? "slide"]);
    if (to === BACK_TARGET) setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    else if (doc.screens.some((s) => s.id === to)) setStack((s) => [...s, to]);
  };

  const itemOf = (it: Item): Item => ({ ...it, ...local[it.id] });

  const applyLive = (it: Item, nx: number, ny: number) => {
    const patch = livePatch(it, nx, ny);
    if (!patch) return null;
    setLocal((prev) => ({ ...prev, [it.id]: { ...prev[it.id], ...patch } }));
    return { ...it, ...local[it.id], ...patch };
  };

  if (!screen) return null;

  return (
    <div className="preview-root" onClick={onClose}>
      <div className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div
          className="relative shrink-0"
          style={{ width: w * scale, height: h * scale }}
        >
          <div
            className={`absolute left-0 top-0 overflow-hidden ${anim}`}
            style={{
              width: w,
              height: h,
              borderRadius: r,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              ["--s" as string]: String(scale),
              background: palette.surface,
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            }}
            onAnimationEnd={() => setAnim("")}
            onPointerDown={(e) => { swipe.current = { x: e.clientX, y: e.clientY }; }}
            onPointerUp={(e) => {
              const start = swipe.current;
              swipe.current = null;
              if (liveDrag.current) {
                liveDrag.current = false;
                swiped.current = false;
                return;
              }
              if (!start) return;
              const dx = e.clientX - start.x;
              const dy = e.clientY - start.y;
              if (Math.hypot(dx, dy) < 48) return;
              swiped.current = true;
              const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
              go(screen.swipe?.[dir], dir === "left" ? "slide" : dir === "right" ? "slideLeft" : dir === "up" ? "slideUp" : "slideDown");
            }}
          >
            <StatusBar palette={palette} dark={doc.theme.mode === "dark"} />
            {screen.items.map((raw) => {
              const it = itemOf(raw);
              const dest = it.to;
              const live = isLiveKind(it.kind);
              return (
                <button
                  key={it.id}
                  type="button"
                  onPointerDown={() => {
                    if (isValueDragKind(it.kind)) liveDrag.current = true;
                  }}
                  onPointerMove={(e) => {
                    if (e.buttons !== 1 || !isValueDragKind(it.kind)) return;
                    liveDrag.current = true;
                    const boxEl = e.currentTarget.getBoundingClientRect();
                    applyLive(it, (e.clientX - boxEl.left) / boxEl.width, (e.clientY - boxEl.top) / boxEl.height);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (swiped.current) {
                      swiped.current = false;
                      return;
                    }
                    const boxEl = e.currentTarget.getBoundingClientRect();
                    const next = applyLive(it, (e.clientX - boxEl.left) / boxEl.width, (e.clientY - boxEl.top) / boxEl.height);
                    const selected = next?.selected ?? it.selected ?? 0;
                    const tab = it.tabs?.[selected];
                    if (tab?.to) {
                      go(tab.to, tab.transition ?? it.transition);
                      return;
                    }
                    if (dest && !isValueDragKind(it.kind) && it.kind !== "searchBar" && it.kind !== "numberPicker" && it.kind !== "colorPalette") {
                      go(dest, it.transition);
                    }
                  }}
                  style={{
                    position: "absolute",
                    left: it.x,
                    top: it.y,
                    width: it.w,
                    height: it.h,
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    cursor: dest || live ? "pointer" : "default",
                  }}
                >
                  <MiuixNode item={it} palette={palette} interactive lang={lang} join={prefJoin(screen.items.map(itemOf), it)} />
                </button>
              );
            })}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: GESTURE_H, display: "grid", placeItems: "center", pointerEvents: "none" }}>
              <div style={{ width: 96, height: 4, borderRadius: 4, background: doc.theme.mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.28)" }} />
            </div>
          </div>
        </div>
        <div className="flex max-w-full items-center gap-2 rounded-[16px] bg-[var(--chrome)] px-3 py-1.5 text-[13px] text-[var(--ink)]">
          <span className="hidden min-[520px]:inline">{t("ready", lang)}</span>
          <button type="button" className="press miuix-text-btn" data-accent="1" onClick={onClose}>{t("close", lang)}</button>
        </div>
      </div>
    </div>
  );
}
