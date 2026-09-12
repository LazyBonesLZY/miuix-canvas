"use client";

import { useMemo, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { buildPrompt } from "@/lib/prompt";
import type { Doc } from "@/lib/types";

export function PromptPanel({ doc, lang }: { doc: Doc; lang: Lang }) {
  const [only, setOnly] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => buildPrompt(doc, lang, only || undefined), [doc, lang, only]);

  return (
    <div className="flex h-full flex-col gap-2 px-3 py-3">
      <p className="text-[11px] leading-relaxed text-[var(--muted)]">{t("promptHint", lang)}</p>
      <select
        className="miuix-field"
        value={only}
        onChange={(e) => setOnly(e.target.value)}
      >
        <option value="">{t("allScreens", lang)}</option>
        {doc.screens.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <textarea
        readOnly
        value={text}
        className="miuix-field min-h-[140px] flex-1 resize-none text-[13px] leading-relaxed"
      />
      <button
        type="button"
        className="press rounded-[16px] bg-[var(--accent)] py-2.5 text-[16px] font-medium text-white"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
      >
        {copied ? t("copied", lang) : t("copy", lang)}
      </button>
    </div>
  );
}
