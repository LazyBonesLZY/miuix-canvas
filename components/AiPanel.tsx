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
    <div className="flex flex-col gap-2 rounded-[16px] bg-[var(--chrome)] p-3">
      <div className="text-[13px] text-[var(--muted-strong)]">{t("ai", lang)}</div>
      <select
        className="miuix-field"
        value={settings.provider}
        onChange={(e) => {
          const spec = PROVIDERS.find((p) => p.key === e.target.value) ?? PROVIDERS[0];
          if (spec.key === "custom") {
            patch({ provider: "custom" });
            return;
          }
          patch({ provider: spec.key, baseUrl: spec.baseUrl, model: spec.model, apiStyle: spec.apiStyle });
        }}
      >
        {PROVIDERS.map((p) => (
          <option key={p.key} value={p.key}>{p.key === "custom" ? t("aiCustom", lang) : p.label}</option>
        ))}
      </select>
      <input
        className="miuix-field"
        placeholder={t("aiBaseUrl", lang)}
        value={settings.baseUrl}
        onChange={(e) => patch({ baseUrl: e.target.value })}
        autoComplete="off"
        spellCheck={false}
      />
      {settings.provider === "custom" && (
        <select
          className="miuix-field"
          value={settings.apiStyle}
          onChange={(e) => patch({ apiStyle: e.target.value === "claude" ? "claude" : "openai" })}
        >
          <option value="openai">{t("aiOpenAICompat", lang)}</option>
          <option value="claude">{t("aiClaudeCompat", lang)}</option>
        </select>
      )}
      <input
        className="miuix-field"
        placeholder={t("aiModel", lang)}
        value={settings.model}
        onChange={(e) => patch({ model: e.target.value })}
      />
      <input
        className="miuix-field"
        placeholder={t("aiKey", lang)}
        type="password"
        value={settings.key}
        onChange={(e) => patch({ key: e.target.value })}
      />
      <p className="text-[13px] leading-relaxed text-[var(--muted)]">{t("aiNeedKey", lang)}</p>
      <button
        type="button"
        disabled={!hasKey(settings) || busy || !screen}
        className="press rounded-[16px] bg-[var(--accent)] py-2 text-[15px] text-white disabled:opacity-40"
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
