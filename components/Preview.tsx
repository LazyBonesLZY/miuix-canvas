"use client";

import { useRef, useState } from "react";
import { MiuixNode, StatusBar } from "@/components/MiuixNode";
import { schemeFromSeed } from "@/lib/color";
import { t, type Lang } from "@/lib/i18n";
import { prefJoin } from "@/lib/layout";
import type { Doc, Item, Transition } from "@/lib/types";
import { BACK_TARGET, GESTURE_H, frameSize } from "@/lib/types";

const ANIM: Record<Transition, string> = {
  slide: "preview-slide",
  slideLeft: "preview-slide-left",
  slideUp: "preview-slide-up",
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
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const currentId = stack.at(-1);
  const screen = doc.screens.find((s) => s.id === currentId) ?? doc.screens[0];
  const palette = schemeFromSeed(doc.theme.seed, doc.theme.mode === "dark");
  const { w, h, r } = frameSize(screen?.preset ?? "phone");
  const scale = Math.min(1, Math.min(typeof window !== "undefined" ? window.innerWidth - 48 : 412, typeof window !== "undefined" ? window.innerHeight - 120 : 800) / Math.max(w, h * 0.55));

  const go = (to: string | undefined, transition?: Transition) => {
    if (!to) return;
    setAnim(ANIM[transition ?? "slide"]);
    if (to === BACK_TARGET) setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    else if (doc.screens.some((s) => s.id === to)) setStack((s) => [...s, to]);
  };

  const itemOf = (it: Item): Item => ({ ...it, ...local[it.id] });

  if (!screen) return null;

  return (
    <div className="preview-root" onClick={onClose}>
      <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div
          className={`relative overflow-hidden ${anim}`}
          style={{
            width: w,
            height: h,
            borderRadius: r,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            background: palette.surface,
            boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          }}
          onAnimationEnd={() => setAnim("")}
          onPointerDown={(e) => { swipe.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={(e) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start) return;
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            if (Math.hypot(dx, dy) < 48) return;
            const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
            go(screen.swipe?.[dir], dir === "left" ? "slide" : dir === "right" ? "slideLeft" : "slideUp");
          }}
        >
          <StatusBar palette={palette} dark={doc.theme.mode === "dark"} />
          {screen.items.map((raw) => {
            const it = itemOf(raw);
            const dest = it.to;
            return (
              <button
                key={it.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (it.tabs?.length) {
                    const box = e.currentTarget.getBoundingClientRect();
                    const t0 = it.kind === "navigationRail"
                      ? Math.floor(((e.clientY - box.top) / box.height) * it.tabs.length)
                      : Math.floor(((e.clientX - box.left) / box.width) * it.tabs.length);
                    const tab = it.tabs[Math.max(0, Math.min(it.tabs.length - 1, t0))];
                    setLocal((prev) => ({ ...prev, [it.id]: { ...prev[it.id], selected: Math.max(0, Math.min(it.tabs!.length - 1, t0)) } }));
                    if (tab?.to) {
                      go(tab.to, tab.transition ?? it.transition);
                      return;
                    }
                  }
                  if (typeof it.checked === "boolean") {
                    setLocal((prev) => ({ ...prev, [it.id]: { ...prev[it.id], checked: !it.checked } }));
                  }
                  go(dest, it.transition);
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
                  cursor: dest || it.tabs || typeof it.checked === "boolean" ? "pointer" : "default",
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
        <div className="flex items-center gap-2 text-[12px] text-white/80">
          <span>{t("ready", lang)}</span>
          <button type="button" className="press rounded-full bg-white/15 px-3 py-1 text-white" onClick={onClose}>Esc</button>
        </div>
      </div>
    </div>
  );
}
