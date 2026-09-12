"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OfficialMiuixFrame } from "@/components/OfficialMiuixFrame";
import { schemeFromSeed } from "@/lib/color";
import { t, type Lang } from "@/lib/i18n";
import { previewScale } from "@/lib/layout";
import type { RendererEvent } from "@/lib/renderer";
import type { Doc, Item, Transition } from "@/lib/types";
import { BACK_TARGET, frameSize } from "@/lib/types";

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
  const [local, setLocal] = useState<Record<string, Partial<Item>>>({});
  const [box, setBox] = useState(() => ({
    vw: typeof window !== "undefined" ? window.innerWidth : 412,
    vh: typeof window !== "undefined" ? window.innerHeight : 800,
  }));
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

  const go = useCallback((to: string | undefined, _transition?: Transition) => {
    if (!to) return;
    if (to === BACK_TARGET) setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    else if (doc.screens.some((s) => s.id === to)) setStack((s) => [...s, to]);
  }, [doc.screens]);

  const renderedScreens = useMemo(() => doc.screens.map((entry) => ({
    ...entry,
    items: entry.items.map((it) => ({ ...it, ...local[it.id] })),
  })), [doc.screens, local]);
  const renderedScreen = renderedScreens.find((entry) => entry.id === screen?.id) ?? null;

  const onRendererEvent = useCallback((event: RendererEvent) => {
    if (event.type === "patch" && event.itemId) {
      const patch: Partial<Item> = {};
      if (typeof event.checked === "boolean") patch.checked = event.checked;
      if (typeof event.value === "number") patch.value = event.value;
      if (typeof event.from === "number") patch.from = event.from;
      if (typeof event.selected === "number") patch.selected = event.selected;
      if (typeof event.label === "string") patch.label = event.label;
      if (typeof event.supporting === "string") patch.supporting = event.supporting;
      if (typeof event.color === "string") patch.color = event.color;
      if (typeof event.variant === "string") patch.variant = event.variant;
      if (typeof event.refreshing === "boolean") patch.refreshing = event.refreshing;
      setLocal((prev) => ({ ...prev, [event.itemId!]: { ...prev[event.itemId!], ...patch } }));
      const source = renderedScreen?.items.find((item) => item.id === event.itemId);
      if (event.checked === true && source && (source.kind === "radio" || source.kind === "radioPref")) {
        setLocal((prev) => {
          const next = { ...prev };
          for (const peer of renderedScreen?.items ?? []) {
            if (
              peer.id !== source.id &&
              peer.kind === source.kind &&
              (source.group ? peer.group === source.group : peer.parentId === source.parentId)
            ) {
              next[peer.id] = { ...next[peer.id], checked: false };
            }
          }
          return next;
        });
      }
    }
    if (event.type === "dismiss" && event.itemId) {
      setLocal((prev) => ({ ...prev, [event.itemId!]: { ...prev[event.itemId!], show: false } }));
    }
    if (event.type === "navigate") {
      go(event.to, event.action as Transition | undefined);
    }
  }, [go, renderedScreen?.items]);

  if (!screen || !renderedScreen) return null;

  return (
    <div className="preview-root" onClick={onClose}>
      <div className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div
          className="relative shrink-0"
          style={{ width: w * scale, height: h * scale }}
        >
          <div
            className="absolute left-0 top-0 overflow-hidden"
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
          >
            <OfficialMiuixFrame screen={renderedScreen} screens={renderedScreens} theme={doc.theme} lang={lang} interactive onEvent={onRendererEvent} />
          </div>
        </div>
        <div className="flex max-w-full items-center gap-2 rounded-[16px] bg-[var(--chrome)] px-3 py-1.5 text-[13px] text-[var(--ink)]">
          <span className="hidden min-w-0 text-pretty min-[520px]:inline">{t("ready", lang)}</span>
          <button type="button" className="press miuix-text-btn" data-accent="1" onClick={onClose}>{t("close", lang)}</button>
        </div>
      </div>
    </div>
  );
}
