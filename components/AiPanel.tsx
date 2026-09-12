"use client";

import { useState } from "react";
import { DEFAULT_AI, PROVIDERS, hasKey, loadAiSettings, proposeNote, saveAiSettings, type AiSettings } from "@/lib/ai";
import { t, type Lang } from "@/lib/i18n";
import type { Doc, Item, Screen } from "@/lib/types";

export function AiPanel({
  doc,
  lang,
  screen,
  item,
  onNote,
}: {
  doc: Doc;
  lang: Lang;
  screen?: Screen;
  item?: Item;
  onNote: (note: string) => void;
}) {
  const [settings, setSettings] = useState<AiSettings>(() => (typeof window === "undefined" ? DEFAULT_AI : loadAiSettings()));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const patch = (next: Partial<AiSettings>) => {
    const value = { ...settings, ...next };
    setSettings(value);
    saveAiSettings(value);
  };

  return (
    <div className="flex flex-col gap-2 rounded-[12px] bg-[var(--tile)] p-2.5">
      <div className="text-[11px] text-[var(--muted)]">{t("ai", lang)}</div>
      <select className="rounded-[8px] bg-[var(--chrome)] px-2 py-1.5 text-[12px]" value={settings.provider} onChange={(e) => {
        const spec = PROVIDERS.find((p) => p.key === e.target.value) ?? PROVIDERS[0];
        patch({ provider: spec.key, baseUrl: spec.baseUrl, model: spec.model });
      }}>
        {PROVIDERS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
      </select>
      <input className="rounded-[8px] bg-[var(--chrome)] px-2 py-1.5 text-[12px]" placeholder="model" value={settings.model} onChange={(e) => patch({ model: e.target.value })} />
      <input className="rounded-[8px] bg-[var(--chrome)] px-2 py-1.5 text-[12px]" placeholder="API key" type="password" value={settings.key} onChange={(e) => patch({ key: e.target.value })} />
      <p className="text-[11px] leading-relaxed text-[var(--muted)]">{t("aiNeedKey", lang)}</p>
      <button
        type="button"
        disabled={!hasKey(settings) || busy || !screen}
        className="press rounded-[10px] bg-[var(--accent)] py-1.5 text-[12px] text-white disabled:opacity-40"
        onClick={async () => {
          if (!screen) return;
          setBusy(true);
          setError("");
          try {
            onNote(await proposeNote(settings, doc, lang, screen, item));
          } catch (err) {
            setError(err instanceof Error ? err.message : "error");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? t("aiBusy", lang) : t("aiWrite", lang)}
      </button>
      {error && <div className="text-[11px] text-[#E94634]">{error}</div>}
    </div>
  );
}
