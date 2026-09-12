"use client";

import { PRESETS } from "@/lib/color";
import { PLATFORM_TEXT, t, type Lang } from "@/lib/i18n";
import type { Doc, Platform, ThemeMode } from "@/lib/types";

export function ThemePanel({
  doc,
  lang,
  onTheme,
  onPlatform,
}: {
  doc: Doc;
  lang: Lang;
  onTheme: (patch: Partial<Doc["theme"]>) => void;
  onPlatform: (platform: Platform) => void;
}) {
  return (
    <div className="flex flex-col gap-4 overflow-auto px-3 py-3">
      <div className="flex gap-1">
        {(["light", "dark"] as ThemeMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onTheme({ mode })}
            className={`press flex-1 rounded-[10px] py-2 text-[13px] ${doc.theme.mode === mode ? "bg-[var(--accent)] text-white" : "bg-[var(--tile)]"}`}
          >
            {t(mode, lang)}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-[11px] text-[var(--muted)]">
        {t("seed", lang)}
        <div className="flex items-center gap-2">
          <input type="color" value={doc.theme.seed} onChange={(e) => onTheme({ seed: e.target.value.toUpperCase() })} className="h-9 w-12 cursor-pointer rounded-[8px] border-0 bg-transparent" />
          <input
            value={doc.theme.seed}
            onChange={(e) => onTheme({ seed: e.target.value })}
            className="w-full rounded-[10px] bg-[var(--tile)] px-2.5 py-2 text-[13px] text-[var(--ink)] outline-none"
          />
        </div>
      </label>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            title={preset.label}
            onClick={() => onTheme({ seed: preset.seed })}
            className="h-7 w-7 rounded-full border-2"
            style={{ background: preset.seed, borderColor: doc.theme.seed.toUpperCase() === preset.seed ? "var(--ink)" : "transparent" }}
          />
        ))}
      </div>
      <label className="flex items-center justify-between text-[13px]">
        <span>{t("monet", lang)}</span>
        <input type="checkbox" checked={doc.theme.monet} onChange={(e) => onTheme({ monet: e.target.checked })} />
      </label>
      <div>
        <div className="mb-1 text-[11px] text-[var(--muted)]">{t("platform", lang)}</div>
        <div className="flex flex-col gap-1">
          {(["cmp", "android", "web"] as Platform[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPlatform(p)}
              className={`press rounded-[10px] px-3 py-2 text-left text-[13px] ${doc.platform === p ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--tile)]"}`}
            >
              {PLATFORM_TEXT[lang][p]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
