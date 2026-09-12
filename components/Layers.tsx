"use client";

import { KIND_TEXT, t, type Lang } from "@/lib/i18n";
import type { Doc, Selection } from "@/lib/types";

export function LayersPanel({
  doc,
  lang,
  selection,
  onSelect,
  onMove,
}: {
  doc: Doc;
  lang: Lang;
  selection: Selection;
  onSelect: (next: Selection) => void;
  onMove?: (screenId: string, itemId: string, dir: 1 | -1) => void;
}) {
  return (
    <div className="flex flex-col gap-3 overflow-auto px-3 pb-6 pt-2">
      {doc.screens.map((screen) => {
        const selectedScreen = selection?.kind === "screen" && selection.screenId === screen.id;
        return (
          <section key={screen.id}>
            <button
              type="button"
              onClick={() => onSelect({ kind: "screen", screenId: screen.id })}
              className={`press mb-1 w-full rounded-[10px] px-2 py-1.5 text-left text-[13px] font-medium ${selectedScreen ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--ink)]"}`}
            >
              {screen.name}
            </button>
            <div className="flex flex-col gap-0.5 pl-2">
              {screen.items.map((it, index) => {
                const on = selection?.kind === "item" && selection.itemId === it.id;
                return (
                  <div key={it.id} className={`flex items-center gap-1 rounded-[8px] ${on ? "bg-[var(--accent-soft)]" : ""}`}>
                    <button
                      type="button"
                      onClick={() => onSelect({ kind: "item", screenId: screen.id, itemId: it.id })}
                      className={`press flex min-w-0 flex-1 items-center gap-2 px-2 py-1 text-left text-[12px] ${on ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
                    >
                      <span className="ms text-[16px]">{it.icon || "crop_square"}</span>
                      <span className="min-w-0 truncate">{it.label || KIND_TEXT[lang][it.kind].split(" ")[0]}</span>
                    </button>
                    {on && onMove && (
                      <div className="flex pr-1">
                        <button type="button" title={t("layerDown", lang)} disabled={index === 0} className="press px-1 text-[10px] disabled:opacity-30" onClick={() => onMove(screen.id, it.id, -1)}>▼</button>
                        <button type="button" title={t("layerUp", lang)} disabled={index === screen.items.length - 1} className="press px-1 text-[10px] disabled:opacity-30" onClick={() => onMove(screen.id, it.id, 1)}>▲</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      {!doc.screens.length && <p className="text-[12px] text-[var(--muted)]">{t("noSelection", lang)}</p>}
    </div>
  );
}
