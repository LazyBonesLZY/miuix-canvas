"use client";

import { KIND_TEXT, categoryLabel, t, type Lang } from "@/lib/i18n";
import { CATEGORIES, KIND_SPEC } from "@/lib/tokens";
import type { Kind } from "@/lib/types";

export function PartsPalette({
  lang,
  onAdd,
  onDragStart,
}: {
  lang: Lang;
  onAdd: (kind: Kind) => void;
  onDragStart: (kind: Kind) => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-3 pb-6 pt-2">
      {CATEGORIES.map((cat) => {
        const kinds = (Object.keys(KIND_SPEC) as Kind[]).filter((k) => KIND_SPEC[k].category === cat);
        return (
          <section key={cat}>
            <div className="mb-2 px-2 text-[13px] font-medium text-[var(--muted-strong)]">
              {categoryLabel(cat, lang)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {kinds.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  draggable
                  onDragStart={() => onDragStart(kind)}
                  onClick={() => onAdd(kind)}
                  className="press flex items-center gap-2 rounded-[16px] bg-[var(--chrome)] px-2.5 py-2.5 text-left shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:bg-[var(--tile-hover)]"
                  title={KIND_TEXT[lang][kind]}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[var(--accent-soft)]">
                    <span className="ms text-[18px] text-[var(--accent)]">{KIND_SPEC[kind].icon}</span>
                  </span>
                  <span className="min-w-0 truncate text-[13px] leading-tight text-[var(--ink)]">{KIND_TEXT[lang][kind].split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
      <p className="px-1 text-[11px] leading-relaxed text-[var(--muted)]">{t("empty", lang)}</p>
    </div>
  );
}
