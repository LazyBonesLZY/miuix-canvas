"use client";

import { useMemo, useState } from "react";
import { PartName } from "@/components/PartName";
import { KIND_TEXT, categoryLabel, kindShort, t, type Lang } from "@/lib/i18n";
import { CATEGORIES, KIND_SPEC, composableOf } from "@/lib/tokens";
import type { Kind } from "@/lib/types";

function kindMatches(kind: Kind, needle: string, lang: Lang) {
  if (KIND_TEXT[lang][kind].toLowerCase().includes(needle)) return true;
  if (kind.toLowerCase().includes(needle)) return true;
  const spec = KIND_SPEC[kind];
  if (spec.composable.toLowerCase().includes(needle)) return true;
  return (spec.variants ?? [undefined]).some((variant) => composableOf({ kind, variant }).toLowerCase().includes(needle));
}

export function PartsPalette({
  lang,
  onAdd,
  onDragStart,
}: {
  lang: Lang;
  onAdd: (kind: Kind) => void;
  onDragStart: (kind: Kind) => void;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const groups = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const kinds = (Object.keys(KIND_SPEC) as Kind[]).filter((kind) => {
        if (KIND_SPEC[kind].category !== cat) return false;
        if (!needle) return true;
        return kindMatches(kind, needle, lang);
      });
      return { cat, kinds };
    }).filter((group) => group.kinds.length);
  }, [lang, needle]);

  return (
    <div className="flex flex-col gap-4 px-3 pb-8 pt-2">
      <label className="sticky top-0 z-10 -mx-1 bg-[var(--surface)] px-1 pb-1">
        <input
          className="miuix-field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchParts", lang)}
          type="search"
        />
      </label>
      {groups.map(({ cat, kinds }) => (
        <section key={cat}>
          <div className="mb-2 px-2 text-[13px] font-medium text-[var(--muted-strong)]">
            {categoryLabel(cat, lang)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {kinds.map((kind) => {
              const short = kindShort(kind, lang);
              const full = KIND_TEXT[lang][kind];
              return (
                <button
                  key={kind}
                  type="button"
                  draggable
                  onDragStart={() => onDragStart(kind)}
                  onClick={() => onAdd(kind)}
                  className="press flex min-w-0 items-center gap-2 rounded-[16px] bg-[var(--chrome)] px-2 py-2 text-left shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:bg-[var(--tile-hover)]"
                  title={full}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[var(--accent-soft)]">
                    <span className="ms text-[18px] text-[var(--accent)]">{KIND_SPEC[kind].icon}</span>
                  </span>
                  <PartName>{short}</PartName>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      {!groups.length && <p className="px-1 text-[13px] text-[var(--muted)]">{t("noParts", lang)}</p>}
      <p className="px-1 text-[11px] leading-relaxed text-[var(--muted)]">{t("empty", lang)}</p>
    </div>
  );
}
