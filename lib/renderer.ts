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

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function sanitizeItem(item: Screen["items"][number]): Screen["items"][number] {
  return {
    ...item,
    x: finite(item.x),
    y: finite(item.y),
    w: finite(item.w, 1),
    h: finite(item.h, 1),
    value: item.value === undefined ? undefined : finite(item.value),
    from: item.from === undefined ? undefined : finite(item.from),
    selected: item.selected === undefined ? undefined : finite(item.selected),
    blurRadius: item.blurRadius === undefined ? undefined : finite(item.blurRadius),
    noiseCoefficient: item.noiseCoefficient === undefined ? undefined : finite(item.noiseCoefficient),
  };
}

function sanitizeScreen(screen: Screen): Screen {
  return {
    ...screen,
    x: finite(screen.x),
    y: finite(screen.y),
    items: screen.items.map(sanitizeItem),
  };
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
    screen: sanitizeScreen(screen),
    screens: screens?.map(sanitizeScreen),
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
