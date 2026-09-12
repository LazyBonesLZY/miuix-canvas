import { MIUIX_BLUE } from "./color";
import type { Category, FramePreset, Item, Kind, NavTab, Theme } from "./types";
import { MARGIN, PHONE_W, contentWidth, uid } from "./types";

export const DEFAULT_THEME: Theme = {
  mode: "light",
  seed: MIUIX_BLUE,
  monet: true,
};

export type KindSpec = {
  kind: Kind;
  category: Category;
  icon: string;
  w: (preset: FramePreset) => number;
  h: number;
  edge?: "top" | "bottom" | "start";
  variants?: string[];
  defaultLabel: { zh: string; en: string };
  defaultSupporting?: { zh: string; en: string };
  tabs?: NavTab[];
  checked?: boolean;
  value?: number;
};

const full = (preset: FramePreset) => contentWidth(preset);
const edge = () => PHONE_W; // overwritten at add-time by screen width

export const KIND_SPEC: Record<Kind, KindSpec> = {
  button: { kind: "button", category: "actions", icon: "smart_button", w: () => 128, h: 50, variants: ["primary", "secondary", "text"], defaultLabel: { zh: "确定", en: "OK" } },
  iconButton: { kind: "iconButton", category: "actions", icon: "more_horiz", w: () => 40, h: 40, defaultLabel: { zh: "", en: "" } },
  fab: { kind: "fab", category: "actions", icon: "add", w: () => 56, h: 56, defaultLabel: { zh: "", en: "" } },
  floatingToolbar: { kind: "floatingToolbar", category: "actions", icon: "construction", w: () => 220, h: 52, defaultLabel: { zh: "工具", en: "Tools" }, tabs: [{ icon: "edit", label: "" }, { icon: "content_copy", label: "" }, { icon: "delete", label: "" }] },
  topAppBar: { kind: "topAppBar", category: "navigation", icon: "web_asset", w: edge, h: 88, edge: "top", variants: ["small", "large"], defaultLabel: { zh: "标题", en: "Title" } },
  smallTitle: { kind: "smallTitle", category: "navigation", icon: "title", w: full, h: 28, defaultLabel: { zh: "常用功能", en: "Shortcuts" } },
  navigationBar: { kind: "navigationBar", category: "navigation", icon: "dock_to_bottom", w: edge, h: 64, edge: "bottom", defaultLabel: { zh: "导航", en: "Navigation" }, tabs: [{ icon: "home", label: "首页" }, { icon: "explore", label: "发现" }, { icon: "person", label: "我的" }] },
  navigationRail: { kind: "navigationRail", category: "navigation", icon: "view_sidebar", w: () => 80, h: 400, edge: "start", defaultLabel: { zh: "导航", en: "Navigation" }, tabs: [{ icon: "home", label: "首页" }, { icon: "explore", label: "发现" }, { icon: "person", label: "我的" }] },
  tabRow: { kind: "tabRow", category: "navigation", icon: "tabs", w: full, h: 40, defaultLabel: { zh: "标签", en: "Tabs" }, tabs: [{ icon: "", label: "推荐" }, { icon: "", label: "关注" }, { icon: "", label: "热门" }] },
  searchBar: { kind: "searchBar", category: "navigation", icon: "search", w: full, h: 48, defaultLabel: { zh: "搜索", en: "Search" } },
  breadcrumb: { kind: "breadcrumb", category: "navigation", icon: "more_horiz", w: full, h: 36, defaultLabel: { zh: "设置 / 显示", en: "Settings / Display" } },
  card: { kind: "card", category: "containment", icon: "rectangle", w: full, h: 120, defaultLabel: { zh: "卡片标题", en: "Card title" }, defaultSupporting: { zh: "辅助说明文字", en: "Supporting text" } },
  surface: { kind: "surface", category: "containment", icon: "crop_square", w: full, h: 80, defaultLabel: { zh: "", en: "" } },
  divider: { kind: "divider", category: "containment", icon: "horizontal_rule", w: full, h: 1, defaultLabel: { zh: "", en: "" } },
  snackbar: { kind: "snackbar", category: "containment", icon: "call_to_action", w: full, h: 48, defaultLabel: { zh: "已保存", en: "Saved" } },
  dialog: { kind: "dialog", category: "containment", icon: "web_stories", w: () => 320, h: 200, defaultLabel: { zh: "提示", en: "Notice" }, defaultSupporting: { zh: "确认要继续吗？", en: "Continue?" } },
  textField: { kind: "textField", category: "inputs", icon: "edit_note", w: full, h: 50, defaultLabel: { zh: "输入内容", en: "Enter text" } },
  switch: { kind: "switch", category: "inputs", icon: "toggle_on", w: () => 46, h: 26, defaultLabel: { zh: "", en: "" }, checked: true },
  checkbox: { kind: "checkbox", category: "inputs", icon: "check_box", w: () => 24, h: 24, defaultLabel: { zh: "", en: "" }, checked: true },
  radio: { kind: "radio", category: "inputs", icon: "radio_button_checked", w: () => 24, h: 24, defaultLabel: { zh: "", en: "" }, checked: true },
  slider: { kind: "slider", category: "inputs", icon: "tune", w: full, h: 28, defaultLabel: { zh: "", en: "" }, value: 0.6 },
  dropdown: { kind: "dropdown", category: "inputs", icon: "arrow_drop_down_circle", w: full, h: 50, defaultLabel: { zh: "请选择", en: "Choose" } },
  numberPicker: { kind: "numberPicker", category: "inputs", icon: "pin", w: () => 160, h: 140, defaultLabel: { zh: "12", en: "12" } },
  text: { kind: "text", category: "content", icon: "notes", w: full, h: 24, defaultLabel: { zh: "正文", en: "Body" } },
  image: { kind: "image", category: "content", icon: "image", w: full, h: 160, defaultLabel: { zh: "", en: "" } },
  badge: { kind: "badge", category: "content", icon: "mark_chat_unread", w: () => 22, h: 18, defaultLabel: { zh: "3", en: "3" } },
  icon: { kind: "icon", category: "content", icon: "star", w: () => 28, h: 28, defaultLabel: { zh: "", en: "" } },
  progress: { kind: "progress", category: "progress", icon: "progress_activity", w: full, h: 6, variants: ["linear", "circular"], defaultLabel: { zh: "", en: "" }, value: 0.45 },
  pullToRefresh: { kind: "pullToRefresh", category: "progress", icon: "refresh", w: () => 40, h: 40, defaultLabel: { zh: "", en: "" } },
  switchPref: { kind: "switchPref", category: "preference", icon: "toggle_on", w: full, h: 64, defaultLabel: { zh: "深色模式", en: "Dark mode" }, defaultSupporting: { zh: "跟随系统", en: "Follow system" }, checked: true },
  checkboxPref: { kind: "checkboxPref", category: "preference", icon: "check_box", w: full, h: 64, defaultLabel: { zh: "同步数据", en: "Sync data" }, defaultSupporting: { zh: "使用移动网络时同步", en: "Sync on mobile data" }, checked: false },
  radioPref: { kind: "radioPref", category: "preference", icon: "radio_button_checked", w: full, h: 56, defaultLabel: { zh: "标准", en: "Standard" }, checked: true },
  sliderPref: { kind: "sliderPref", category: "preference", icon: "tune", w: full, h: 80, defaultLabel: { zh: "字体大小", en: "Font size" }, value: 0.5 },
  dropdownPref: { kind: "dropdownPref", category: "preference", icon: "arrow_drop_down_circle", w: full, h: 64, defaultLabel: { zh: "语言", en: "Language" }, defaultSupporting: { zh: "简体中文", en: "Simplified Chinese" } },
  arrowPref: { kind: "arrowPref", category: "preference", icon: "chevron_right", w: full, h: 64, defaultLabel: { zh: "关于本机", en: "About phone" }, defaultSupporting: { zh: "HyperOS 2", en: "HyperOS 2" } },
};

export const KIND_ORDER = Object.keys(KIND_SPEC) as Kind[];

export const CATEGORIES: Category[] = ["actions", "navigation", "containment", "inputs", "content", "progress", "preference"];

export function makeItem(kind: Kind, preset: FramePreset, lang: "zh" | "en", x: number, y: number): Item {
  const spec = KIND_SPEC[kind];
  const screenW = preset === "desktop" ? 1280 : 412;
  const w = spec.edge === "top" || spec.edge === "bottom" ? screenW : spec.w(preset);
  return {
    id: uid(),
    kind,
    x,
    y,
    w,
    h: spec.h,
    label: spec.defaultLabel[lang],
    supporting: spec.defaultSupporting?.[lang],
    icon: spec.icon,
    variant: spec.variants?.[0],
    checked: spec.checked,
    value: spec.value,
    tabs: spec.tabs ? spec.tabs.map((t) => ({ ...t })) : undefined,
    selected: spec.tabs ? 0 : undefined,
  };
}

export function defaultPosition(kind: Kind, preset: FramePreset, existing: Item[]) {
  const spec = KIND_SPEC[kind];
  const { w, h } = { w: preset === "desktop" ? 1280 : 412, h: preset === "desktop" ? 800 : 892 };
  if (spec.edge === "top") return { x: 0, y: 0 };
  if (spec.edge === "bottom") return { x: 0, y: h - spec.h };
  if (spec.edge === "start") return { x: 0, y: 88 };
  if (kind === "fab") return { x: w - MARGIN - 56, y: h - 64 - MARGIN - 56 };
  if (kind === "snackbar") return { x: MARGIN, y: h - 64 - MARGIN - 48 };
  if (kind === "dialog") return { x: (w - 320) / 2, y: (h - 200) / 2 };
  const prefs = existing.filter((it) => it.kind.endsWith("Pref") || it.kind === "card" || it.kind === "smallTitle" || it.kind === "searchBar");
  const last = prefs.at(-1);
  if (last) return { x: MARGIN, y: last.y + last.h };
  const top = existing.find((it) => it.kind === "topAppBar");
  return { x: MARGIN, y: (top ? top.h : 28) + 12 };
}

export const ICONS = [
  "home", "explore", "person", "settings", "search", "add", "edit", "delete",
  "star", "favorite", "chat", "notifications", "camera", "photo", "map",
  "wifi", "bluetooth", "battery_full", "dark_mode", "light_mode", "palette",
  "language", "lock", "fingerprint", "wallpaper", "tune", "info", "help",
  "chevron_right", "arrow_back", "more_horiz", "check", "close", "refresh",
  "share", "download", "content_copy", "visibility", "volume_up", "play_arrow",
] as const;
