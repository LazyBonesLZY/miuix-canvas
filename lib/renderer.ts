import type { Lang, Screen, Theme } from "./types";

export type RendererEvent = {
  type: "ready" | "rendered" | "fonts" | "patch" | "navigate" | "dismiss" | "snapshot" | "error";
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

/** A deferred iframe must start immediately if the screen is selected before its timeout. */
export function rendererBoot(src: string, deferMs: number): "keep" | "now" | "later" {
  if (src) return "keep";
  return deferMs <= 0 ? "now" : "later";
}

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function optionalText(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function sanitizeTabs(tabs: Screen["items"][number]["tabs"]) {
  if (!Array.isArray(tabs)) return tabs;
  return tabs.flatMap((tab) => {
    if (!tab || typeof tab !== "object") return [];
    return [{
      ...tab,
      icon: text(tab.icon),
      label: text(tab.label),
    }];
  });
}

function sanitizeItem(item: Screen["items"][number]): Screen["items"][number] {
  return {
    ...item,
    label: text(item.label),
    icon: optionalText(item.icon),
    variant: optionalText(item.variant),
    supporting: optionalText(item.supporting),
    tabs: sanitizeTabs(item.tabs),
    x: finite(item.x),
    y: finite(item.y),
    w: finite(item.w, 1),
    h: finite(item.h, 1),
    value: item.value === undefined || item.value === null ? undefined : finite(item.value),
    from: item.from === undefined || item.from === null ? undefined : finite(item.from),
    selected: item.selected === undefined || item.selected === null ? undefined : finite(item.selected),
    blurRadius: item.blurRadius === undefined || item.blurRadius === null ? undefined : finite(item.blurRadius),
    noiseCoefficient: item.noiseCoefficient === undefined || item.noiseCoefficient === null ? undefined : finite(item.noiseCoefficient),
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
