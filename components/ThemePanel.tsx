"use client";

import { MIUIX_BLUE, PRESETS } from "@/lib/color";
import { PLATFORM_TEXT, t, type Lang } from "@/lib/i18n";
import type { Doc, Platform, ThemeMode } from "@/lib/types";

export function ThemePanel({
  doc,
  lang,
  onTheme,
  onPlatform,
  onBeginHistory,
}: {
  doc: Doc;
  lang: Lang;
  onTheme: (patch: Partial<Doc["theme"]>, record?: boolean) => void;
  onPlatform: (platform: Platform) => void;
  onBeginHistory?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-3 py-3">
      <div className="miuix-tabbar">
        {(["light", "dark"] as ThemeMode[]).map((mode) => (
          <button key={mode} type="button" data-on={doc.theme.mode === mode ? "1" : undefined} onClick={() => onTheme({ mode })}>
            {t(mode, lang)}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-[13px] text-[var(--muted-strong)]">
        {t("seed", lang)}
        <div className="flex items-center gap-2">
          <input type="color" value={/^#[0-9A-F]{6}$/.test(doc.theme.seed) ? doc.theme.seed : MIUIX_BLUE} onFocus={onBeginHistory} onChange={(e) => onTheme({ seed: e.target.value.toUpperCase() }, false)} className="h-10 w-12 cursor-pointer rounded-[12px] border-0 bg-transparent" />
          <input
            value={doc.theme.seed}
            onFocus={onBeginHistory}
            onChange={(e) => onTheme({ seed: e.target.value.toUpperCase() }, false)}
            className="miuix-field"
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
      <div className="flex items-center justify-between rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-[15px]">
        <span>{t("monet", lang)}</span>
        <button type="button" role="switch" aria-checked={doc.theme.monet} className="press miuix-switch" data-on={doc.theme.monet ? "1" : undefined} onClick={() => onTheme({ monet: !doc.theme.monet })} />
      </div>
      <div>
        <div className="mb-2 px-1 text-[13px] text-[var(--muted-strong)]">{t("platform", lang)}</div>
        <div className="flex flex-col gap-2">
          {(["cmp", "android", "web"] as Platform[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPlatform(p)}
              className={`press rounded-[16px] bg-[var(--chrome)] px-4 py-3 text-left text-[15px] ${doc.platform === p ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}
            >
              {PLATFORM_TEXT[lang][p]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
