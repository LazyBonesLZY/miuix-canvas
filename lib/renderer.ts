import type { Lang, Screen, Theme } from "./types";

export type RendererEvent = {
  type: "ready" | "rendered" | "patch" | "navigate" | "dismiss" | "snapshot" | "error";
  requestId?: string;
  itemId?: string;
  action?: string;
  to?: string;
  checked?: boolean;
  value?: number;
  from?: number;
  selected?: number;
  label?: string;
  color?: string;
  variant?: string;
  refreshing?: boolean;
  dataUrl?: string;
  message?: string;
};

export type RenderRequest = {
  type: "render";
  requestId: string;
  interactive: boolean;
  lang: Lang;
  theme: Theme;
  screen: Screen;
  screens?: Screen[];
  currentScreenId?: string;
};

export function rendererUrl() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}/renderer/index.html`;
}

export function renderRequest(
  screen: Screen,
  theme: Theme,
  lang: Lang,
  interactive: boolean,
  screens?: Screen[],
): RenderRequest {
  return {
    type: "render",
    requestId: `${screen.id}:${Date.now().toString(36)}`,
    interactive,
    lang,
    theme,
    screen,
    screens,
    currentScreenId: screen.id,
  };
}

export function parseRendererEvent(value: unknown): RendererEvent | null {
  if (typeof value !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || !("type" in parsed) || typeof parsed.type !== "string") return null;
    return parsed as RendererEvent;
  } catch {
    return null;
  }
}
