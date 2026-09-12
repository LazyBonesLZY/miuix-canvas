import { MIUIX_BLUE } from "./color";
import { DEFAULT_THEME } from "./tokens";
import type { Doc, FramePreset, Item, Screen } from "./types";
import { FRAME_GAP, PHONE_H, PHONE_W, uid } from "./types";

export const DOC_KEY = "miuix:doc";
export const UI_KEY = "miuix:ui";

export function emptyScreen(preset: FramePreset, index: number, lang: "zh" | "en"): Screen {
  return {
    id: uid(),
    name: lang === "zh" ? `屏幕 ${index + 1}` : `Screen ${index + 1}`,
    x: index * (PHONE_W + FRAME_GAP),
    y: 0,
    preset,
    items: [],
  };
}

export function defaultDoc(lang: "zh" | "en"): Doc {
  const homeId = uid();
  const settingsId = uid();
  const aboutId = uid();

  const home: Screen = {
    id: homeId,
    name: lang === "zh" ? "首页" : "Home",
    x: 0,
    y: 0,
    preset: "phone",
    items: [
      item("topAppBar", 0, 0, 412, 88, lang === "zh" ? "生活" : "Life", { variant: "large", icon: "home" }),
      item("searchBar", 16, 100, 380, 48, lang === "zh" ? "搜索服务" : "Search services"),
      item("card", 16, 164, 380, 132, lang === "zh" ? "今日天气" : "Today's weather", {
        supporting: lang === "zh" ? "晴 26° · 空气优" : "Sunny 26° · Good air",
        icon: "wb_sunny",
        to: settingsId,
        transition: "slide",
        note: lang === "zh" ? "打开天气详情" : "Open weather details",
      }),
      item("smallTitle", 16, 312, 380, 28, lang === "zh" ? "常用功能" : "Shortcuts"),
      item("arrowPref", 16, 348, 380, 64, lang === "zh" ? "设置" : "Settings", {
        supporting: lang === "zh" ? "显示、声音、通知" : "Display, sound, notifications",
        icon: "settings",
        to: settingsId,
        transition: "slide",
      }),
      item("arrowPref", 16, 412, 380, 64, lang === "zh" ? "关于" : "About", {
        supporting: "HyperOS · Miuix",
        icon: "info",
        to: aboutId,
        transition: "slide",
      }),
      item("navigationBar", 0, 828, 412, 64, "", {
        tabs: lang === "zh"
          ? [{ icon: "home", label: "首页" }, { icon: "explore", label: "发现" }, { icon: "person", label: "我的" }]
          : [{ icon: "home", label: "Home" }, { icon: "explore", label: "Explore" }, { icon: "person", label: "Me" }],
        selected: 0,
      }),
    ],
  };

  const settings: Screen = {
    id: settingsId,
    name: lang === "zh" ? "设置" : "Settings",
    x: PHONE_W + FRAME_GAP,
    y: 0,
    preset: "phone",
    note: lang === "zh" ? "系统设置列表，分组放在 Card 里" : "System settings list, grouped in Cards",
    items: [
      item("topAppBar", 0, 0, 412, 72, lang === "zh" ? "设置" : "Settings", { variant: "small", icon: "arrow_back", to: "back", transition: "slide" }),
      item("searchBar", 16, 84, 380, 48, lang === "zh" ? "搜索设置项" : "Search settings"),
      item("smallTitle", 16, 148, 380, 28, lang === "zh" ? "显示" : "Display"),
      item("switchPref", 16, 180, 380, 64, lang === "zh" ? "深色模式" : "Dark mode", {
        supporting: lang === "zh" ? "跟随系统" : "Follow system",
        icon: "dark_mode",
        checked: false,
        note: lang === "zh" ? "切换 MiuixTheme 的 ThemeController 模式" : "Toggle ThemeController dark/light",
      }),
      item("sliderPref", 16, 244, 380, 80, lang === "zh" ? "字体大小" : "Font size", { value: 0.45, icon: "format_size" }),
      item("dropdownPref", 16, 324, 380, 64, lang === "zh" ? "语言" : "Language", {
        supporting: lang === "zh" ? "简体中文" : "English",
        icon: "language",
      }),
      item("smallTitle", 16, 404, 380, 28, lang === "zh" ? "系统" : "System"),
      item("arrowPref", 16, 436, 380, 64, lang === "zh" ? "关于本机" : "About phone", {
        supporting: "HyperOS 2",
        icon: "phone_iphone",
        to: aboutId,
        transition: "slide",
      }),
    ],
  };

  const about: Screen = {
    id: aboutId,
    name: lang === "zh" ? "关于" : "About",
    x: (PHONE_W + FRAME_GAP) * 2,
    y: 0,
    preset: "phone",
    items: [
      item("topAppBar", 0, 0, 412, 72, lang === "zh" ? "关于本机" : "About phone", { variant: "small", icon: "arrow_back", to: "back", transition: "slide" }),
      item("card", 16, 100, 380, 160, "Miuix Canvas", {
        supporting: lang === "zh" ? "用 Miuix 组件拼界面，再生成提示词。" : "Sketch with Miuix parts, then copy a prompt.",
        icon: "palette",
      }),
      item("arrowPref", 16, 276, 380, 64, lang === "zh" ? "开源许可" : "Open source licenses", {
        supporting: "Apache-2.0 · MIT",
        icon: "gavel",
      }),
      item("button", 141, 380, 130, 50, lang === "zh" ? "返回" : "Back", { variant: "primary", to: "back", transition: "fade" }),
    ],
  };

  return {
    version: 1,
    title: lang === "zh" ? "示例应用" : "Sample app",
    platform: "cmp",
    theme: { ...DEFAULT_THEME, seed: MIUIX_BLUE },
    screens: [home, settings, about],
  };
}

function item(
  kind: Item["kind"],
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  extra: Partial<Item> = {},
): Item {
  return { id: uid(), kind, x, y, w, h, label, ...extra };
}

export function cloneDoc(doc: Doc): Doc {
  return structuredClone(doc);
}

export function screenOf(doc: Doc, id: string | undefined) {
  return doc.screens.find((s) => s.id === id);
}

export function itemOf(screen: Screen | undefined, id: string | undefined) {
  return screen?.items.find((it) => it.id === id);
}

export function nextScreenOrigin(doc: Doc) {
  if (!doc.screens.length) return { x: 0, y: 0 };
  const right = Math.max(...doc.screens.map((s) => s.x + (s.preset === "desktop" ? 1280 : PHONE_W)));
  return { x: right + FRAME_GAP, y: 0 };
}

export function loadDoc(): Doc | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(DOC_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Doc;
    if (parsed?.version === 1 && Array.isArray(parsed.screens)) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveDoc(doc: Doc) {
  try {
    localStorage.setItem(DOC_KEY, JSON.stringify(doc));
  } catch {
    /* quota */
  }
}
