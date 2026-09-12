import { applyVariant } from "./tokens";
import type { Item, Kind } from "./types";

const TOGGLE = new Set<Kind>([
  "switch", "checkbox", "radio", "switchPref", "checkboxPref", "radioPref",
]);

const SLIDER = new Set<Kind>(["slider", "sliderPref", "rangeSlider", "rangeSliderPref"]);

const TABS = new Set<Kind>([
  "tabRow", "navigationBar", "floatingNav", "floatingToolbar", "navigationRail",
  "listPopup", "dropdownMenu", "iconDropdownMenu", "cascadingPopup", "iconCascadingMenu",
  "bottomSheet",
]);

export function isLiveKind(kind: Kind): boolean {
  return TOGGLE.has(kind)
    || SLIDER.has(kind)
    || TABS.has(kind)
    || kind === "searchBar"
    || kind === "numberPicker"
    || kind === "colorPalette"
    || kind === "colorPicker"
    || kind === "breadcrumb"
    || kind === "dropdown"
    || kind === "dropdownPref"
    || kind === "spinnerPref"
    || kind === "progress";
}

export function isValueDragKind(kind: Kind): boolean {
  return SLIDER.has(kind) || kind === "progress" || kind === "colorPicker";
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/** Patch from a tap at normalized 0–1 coordinates inside the item. */
export function livePatch(it: Item, nx: number, ny: number): Partial<Item> | null {
  const x = clamp01(nx);
  const y = clamp01(ny);
  if (TOGGLE.has(it.kind)) return { checked: !it.checked };
  if (it.kind === "slider" || it.kind === "sliderPref") {
    return { value: it.variant === "vertical" ? 1 - y : x };
  }
  if (it.kind === "rangeSlider" || it.kind === "rangeSliderPref") {
    return { value: Math.max(0.25, x) };
  }
  if (it.kind === "progress" && it.variant !== "infinite") {
    return { value: it.variant === "circular" ? x : x };
  }
  if (it.kind === "colorPicker") {
    if (y > 0.7) return { value: x };
    return { value: x };
  }
  if (TABS.has(it.kind)) {
    const n = it.tabs?.length ?? 0;
    if (!n) return null;
    const axis = it.kind === "navigationRail" ? y : x;
    return { selected: Math.min(n - 1, Math.floor(axis * n)) };
  }
  if (it.kind === "searchBar") {
    return applyVariant(it, it.variant === "expanded" ? "field" : "expanded");
  }
  if (it.kind === "numberPicker") {
    const n = Number.parseInt(it.label, 10);
    const base = Number.isFinite(n) ? n : 12;
    return { label: String(y < 0.45 ? base + 1 : y > 0.55 ? base - 1 : base) };
  }
  if (it.kind === "colorPalette") {
    return { selected: Math.min(7, Math.floor(x * 8)) };
  }
  if (it.kind === "breadcrumb") {
    const parts = it.label.split(/\s*[\/·>]\s*/).filter(Boolean);
    if (parts.length < 2) return null;
    const i = Math.min(parts.length - 1, Math.floor(x * parts.length));
    return { label: parts.slice(0, i + 1).join(" / ") };
  }
  if (it.kind === "dropdown" || it.kind === "dropdownPref" || it.kind === "spinnerPref") {
    const choices = it.tabs?.map((tab) => tab.label).filter(Boolean) ?? [];
    if (!choices.length) return { checked: !it.checked };
    const i = ((it.selected ?? 0) + 1) % choices.length;
    return it.kind === "dropdown"
      ? { selected: i, label: choices[i] }
      : { selected: i, supporting: choices[i] };
  }
  return null;
}
