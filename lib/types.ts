export const PHONE_W = 412;
export const PHONE_H = 892;
export const DESKTOP_W = 1280;
export const DESKTOP_H = 800;
export const PHONE_R = 36;
export const DESKTOP_R = 20;
export const STATUS_BAR_H = 28;
export const GESTURE_H = 18;
export const MARGIN = 16;
export const BEZEL = 10;
export const FRAME_LABEL_H = 40;
export const FRAME_GAP = 96;
export const GRID = 4;
export const HISTORY_MAX = 80;
export const GUIDE_PX = 6;
export const MAGNET = 14;

export const uid = () => Math.random().toString(36).slice(2, 10);
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const onGrid = (v: number, origin = 0) => origin + Math.round((v - origin) / GRID) * GRID;

export type Lang = "zh" | "en" | "ja" | "ko";
export const LANGS: { key: Lang; label: string }[] = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "ja", label: "日本語" },
  { key: "ko", label: "한국어" },
];
export type Platform = "cmp" | "android" | "web";
export type FramePreset = "phone" | "desktop";
export type ThemeMode = "light" | "dark";
export type Transition = "slide" | "slideLeft" | "slideUp" | "slideDown" | "fade" | "none";
export type Category = "actions" | "navigation" | "containment" | "inputs" | "content" | "progress" | "preference";
export type SwipeDir = "left" | "right" | "up" | "down";

export type Kind =
  | "button"
  | "iconButton"
  | "fab"
  | "floatingToolbar"
  | "topAppBar"
  | "smallTitle"
  | "navigationBar"
  | "floatingNav"
  | "navigationRail"
  | "tabRow"
  | "searchBar"
  | "breadcrumb"
  | "card"
  | "surface"
  | "divider"
  | "snackbar"
  | "dialog"
  | "bottomSheet"
  | "listPopup"
  | "cascadingPopup"
  | "dropdownMenu"
  | "iconDropdownMenu"
  | "iconCascadingMenu"
  | "tooltip"
  | "textField"
  | "switch"
  | "checkbox"
  | "radio"
  | "slider"
  | "rangeSlider"
  | "dropdown"
  | "numberPicker"
  | "colorPicker"
  | "colorPalette"
  | "text"
  | "image"
  | "badge"
  | "icon"
  | "progress"
  | "pullToRefresh"
  | "scrollBar"
  | "blur"
  | "basicPref"
  | "switchPref"
  | "checkboxPref"
  | "radioPref"
  | "sliderPref"
  | "rangeSliderPref"
  | "dropdownPref"
  | "spinnerPref"
  | "arrowPref";

export type NavTab = { icon: string; label: string; to?: string; transition?: Transition; badge?: string };
export type ScaffoldSlot = "content" | "topBar" | "bottomBar" | "floatingActionButton" | "floatingToolbar" | "snackbarHost" | "overlay";
export type MiuixTextStyle = "body1" | "body2" | "button" | "footnote1" | "footnote2" | "headline1" | "headline2" | "subtitle" | "title1" | "title2" | "title3" | "title4";
export type MiuixEffect = "none" | "textureBlur" | "progressiveTextureBlur";

export type Item = {
  id: string;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  supporting?: string;
  icon?: string | null;
  variant?: string;
  checked?: boolean;
  value?: number;
  from?: number;
  tabs?: NavTab[];
  selected?: number;
  note?: string;
  to?: string;
  transition?: Transition;
  enabled?: boolean;
  show?: boolean;
  refreshing?: boolean;
  badge?: string;
  parentId?: string;
  slot?: ScaffoldSlot;
  subtitle?: string;
  largeTitle?: string;
  actionLabel?: string;
  textStyle?: MiuixTextStyle;
  multiline?: boolean;
  source?: string;
  contentDescription?: string;
  color?: string;
  effect?: MiuixEffect;
  blurRadius?: number;
  effectDirection?: "top" | "bottom" | "left" | "right";
  noiseCoefficient?: number;
  group?: string;
};

export type Swipe = Partial<Record<SwipeDir, string>>;

export type Screen = {
  id: string;
  name: string;
  x: number;
  y: number;
  preset: FramePreset;
  note?: string;
  swipe?: Swipe;
  items: Item[];
};

export type Theme = {
  mode: ThemeMode;
  seed: string;
  monet: boolean;
};

export type Doc = {
  version: 3;
  title: string;
  brief?: string;
  platform: Platform;
  theme: Theme;
  screens: Screen[];
};

export type Selection =
  | { kind: "screen"; screenId: string }
  | { kind: "item"; screenId: string; itemId: string }
  | null;

export type Join = { top: boolean; bottom: boolean };
export type Guide = { x?: number; y?: number; gx?: number; gy?: number };

export const BACK_TARGET = "back";
export const TRANSITIONS: Transition[] = ["slide", "slideLeft", "slideUp", "slideDown", "fade", "none"];
export const SWIPE_DIRS: SwipeDir[] = ["left", "right", "up", "down"];

export function frameSize(preset: FramePreset) {
  return preset === "desktop" ? { w: DESKTOP_W, h: DESKTOP_H, r: DESKTOP_R } : { w: PHONE_W, h: PHONE_H, r: PHONE_R };
}

export function contentWidth(preset: FramePreset) {
  return frameSize(preset).w - MARGIN * 2;
}

export type Localized = Record<Lang, string>;

export function isPref(kind: Kind) {
  return kind.endsWith("Pref");
}

export function isBar(kind: Kind) {
  return kind === "topAppBar" || kind === "navigationBar" || kind === "navigationRail" || kind === "searchBar";
}

export function isTypingTarget(el: EventTarget | null) {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || (el instanceof HTMLElement && el.isContentEditable);
}
