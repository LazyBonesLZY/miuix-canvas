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
    <div className="flex flex-col gap-4 overflow-auto px-3 pb-6 pt-2">
      {CATEGORIES.map((cat) => {
        const kinds = (Object.keys(KIND_SPEC) as Kind[]).filter((k) => KIND_SPEC[k].category === cat);
        return (
          <section key={cat}>
            <div className="mb-2 px-1 text-[11px] font-medium tracking-wide text-[var(--muted)] uppercase">
              {categoryLabel(cat, lang)}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {kinds.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  draggable
                  onDragStart={() => onDragStart(kind)}
                  onClick={() => onAdd(kind)}
                  className="press flex items-center gap-2 rounded-[12px] bg-[var(--tile)] px-2 py-2 text-left hover:bg-[var(--tile-hover)]"
                  title={KIND_TEXT[lang][kind]}
                >
                  <span className="ms text-[18px] text-[var(--accent)]">{KIND_SPEC[kind].icon}</span>
                  <span className="min-w-0 truncate text-[12px] leading-tight text-[var(--ink)]">{KIND_TEXT[lang][kind].split(" ")[0]}</span>
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
