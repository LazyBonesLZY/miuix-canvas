import { buildPrompt } from "./prompt";
import type { Doc, Item, Screen } from "./types";
import type { Lang } from "./i18n";

export type Provider = "openai" | "claude" | "gemini" | "deepseek";

export type AiSettings = {
  provider: Provider;
  baseUrl: string;
  model: string;
  key: string;
};

export const PROVIDERS: { key: Provider; label: string; baseUrl: string; model: string }[] = [
  { key: "openai", label: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-5.6-luna" },
  { key: "claude", label: "Claude", baseUrl: "https://api.anthropic.com", model: "claude-sonnet-5" },
  { key: "gemini", label: "Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-3.8-flash" },
  { key: "deepseek", label: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-v4-flash" },
];

export const DEFAULT_AI: AiSettings = { ...PROVIDERS[0], provider: PROVIDERS[0].key };

const STORE = "miuix:ai";

export function loadAiSettings(): AiSettings {
  const next = { ...DEFAULT_AI };
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return next;
    const v = JSON.parse(raw) as Partial<AiSettings>;
    if (PROVIDERS.some((p) => p.key === v.provider)) next.provider = v.provider as Provider;
    if (typeof v.baseUrl === "string") next.baseUrl = v.baseUrl;
    if (typeof v.model === "string") next.model = v.model;
    if (typeof v.key === "string") next.key = v.key;
  } catch {
    /* ignore */
  }
  return next;
}

export function saveAiSettings(s: AiSettings) {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

const isLocal = (u: string) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(u.trim());
export const hasKey = (s: AiSettings) => s.key.trim().length > 0 || isLocal(s.baseUrl);
export const isSecureUrl = (u: string) => /^https:\/\//i.test(u.trim()) || isLocal(u);

async function readError(res: Response) {
  try {
    const j = await res.json();
    return `${res.status}: ${j?.error?.message ?? j?.message ?? res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

async function complete(s: AiSettings, system: string, user: string): Promise<string> {
  const base = s.baseUrl.trim().replace(/\/+$/, "");
  if (!s.model.trim()) throw new Error("model");
  if (!isSecureUrl(base)) throw new Error("insecure");
  if (s.provider === "claude") {
    const res = await fetch(`${base}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": s.key.trim(),
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: s.model.trim(),
        max_tokens: 512,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) throw new Error(await readError(res));
    const j = await res.json();
    return (j.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
  }
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (s.key.trim()) headers.authorization = `Bearer ${s.key.trim()}`;
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: s.model.trim(),
      ...(s.provider === "openai" ? {} : { max_tokens: 512 }),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const j = await res.json();
  const c = j.choices?.[0]?.message?.content;
  if (typeof c === "string") return c.trim();
  throw new Error("empty");
}

const LANG: Record<Lang, string> = { zh: "Simplified Chinese", en: "English" };

export async function proposeNote(s: AiSettings, doc: Doc, lang: Lang, screen: Screen, item?: Item): Promise<string> {
  const system = "You write short product-spec notes for a HyperOS / Miuix UI sketch. Reply with one sentence only. No markdown.";
  const focus = item
    ? `Part: kind=${item.kind} label=${JSON.stringify(item.label)} supporting=${JSON.stringify(item.supporting ?? "")} current=${JSON.stringify(item.note ?? "")}`
    : `Screen: name=${JSON.stringify(screen.name)} current=${JSON.stringify(screen.note ?? "")}`;
  const user = [
    buildPrompt(doc, lang, screen.id),
    "",
    focus,
    `Write in ${LANG[lang]}. Say what the user can do, where it goes, what it shows. Do not invent screens that are not in the sketch.`,
  ].join("\n");
  return (await complete(s, system, user)).replace(/^["']|["']$/g, "").slice(0, 280);
}
