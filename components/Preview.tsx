"use client";

import { useState } from "react";
import { schemeFromSeed } from "@/lib/color";
import { t, type Lang } from "@/lib/i18n";
import { MiuixNode, StatusBar } from "@/components/MiuixNode";
import type { Doc, Transition } from "@/lib/types";
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
  const currentId = stack.at(-1);
  const screen = doc.screens.find((s) => s.id === currentId) ?? doc.screens[0];
  const palette = schemeFromSeed(doc.theme.seed, doc.theme.mode === "dark");
  const { w, h, r } = frameSize(screen?.preset ?? "phone");
  const scale = Math.min(1, (typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 420) : 412) / w);

  const go = (to: string | undefined, transition?: Transition) => {
    if (!to) return;
    setAnim(ANIM[transition ?? "slide"]);
    if (to === BACK_TARGET) setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    else if (doc.screens.some((s) => s.id === to)) setStack((s) => [...s, to]);
  };

  if (!screen) return null;

  return (
    <div className="preview-root" onClick={onClose}>
      <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div
          className={`relative overflow-hidden bg-[${palette.surface}] ${anim}`}
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
        >
          <StatusBar palette={palette} dark={doc.theme.mode === "dark"} />
          {screen.items.map((it) => (
            <button
              key={it.id}
              type="button"
              disabled={!it.to}
              onClick={() => go(it.to, it.transition)}
              style={{
                position: "absolute",
                left: it.x,
                top: it.y,
                width: it.w,
                height: it.h,
                padding: 0,
                border: 0,
                background: "transparent",
                cursor: it.to ? "pointer" : "default",
              }}
            >
              <MiuixNode item={it} palette={palette} interactive />
            </button>
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: GESTURE_H, display: "grid", placeItems: "center", pointerEvents: "none" }}>
            <div style={{ width: 96, height: 4, borderRadius: 4, background: doc.theme.mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.28)" }} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-white/80">
          <span>{t("ready", lang)}</span>
          <button type="button" className="press rounded-full bg-white/15 px-3 py-1 text-white" onClick={onClose}>
            Esc
          </button>
        </div>
      </div>
    </div>
  );
}
