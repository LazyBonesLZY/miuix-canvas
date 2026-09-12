import { MIUIX_BLUE } from "./color";
import { isProject, migrateDoc } from "./project";
import { DEFAULT_THEME } from "./tokens";
import type { Doc, FramePreset, Item, Lang, Screen } from "./types";
import { FRAME_GAP, PHONE_W, uid } from "./types";

export const DOC_KEY = "miuix:doc";
export const UI_KEY = "miuix:ui";

const loc = (lang: Lang, zh: string, en: string, ja: string, ko: string) => ({ zh, en, ja, ko }[lang]);

export function emptyScreen(preset: FramePreset, index: number, lang: Lang): Screen {
  return {
    id: uid(),
    name: loc(lang, `屏幕 ${index + 1}`, `Screen ${index + 1}`, `画面 ${index + 1}`, `화면 ${index + 1}`),
    x: index * (PHONE_W + FRAME_GAP),
    y: 0,
    preset,
    items: [],
  };
}

export function defaultDoc(lang: Lang): Doc {
  const homeId = uid();
  const settingsId = uid();
  const aboutId = uid();

  const home: Screen = {
    id: homeId,
    name: loc(lang, "首页", "Home", "ホーム", "홈"),
    x: 0,
    y: 0,
    preset: "phone",
    items: [
      item("topAppBar", 0, 0, 412, 88, loc(lang, "生活", "Life", "ライフ", "라이프"), { variant: "large", icon: "home" }),
      item("searchBar", 16, 100, 380, 45, loc(lang, "搜索服务", "Search services", "サービスを検索", "서비스 검색")),
      item("card", 16, 164, 380, 132, loc(lang, "今日天气", "Today's weather", "今日の天気", "오늘 날씨"), {
        supporting: loc(lang, "晴 26° · 空气优", "Sunny 26° · Good air", "晴れ 26° · 空気良好", "맑음 26° · 대기 좋음"),
        icon: "wb_sunny",
        to: settingsId,
        transition: "slide",
        note: loc(lang, "打开天气详情", "Open weather details", "天気の詳細を開く", "날씨 상세 열기"),
      }),
      item("smallTitle", 16, 312, 380, 28, loc(lang, "常用功能", "Shortcuts", "ショートカット", "바로가기")),
      item("arrowPref", 16, 348, 380, 64, loc(lang, "设置", "Settings", "設定", "설정"), {
        supporting: loc(lang, "显示、声音、通知", "Display, sound, notifications", "表示、サウンド、通知", "디스플레이, 소리, 알림"),
        icon: "settings",
        to: settingsId,
        transition: "slide",
      }),
      item("arrowPref", 16, 412, 380, 64, loc(lang, "关于", "About", "情報", "정보"), {
        supporting: "HyperOS · Miuix",
        icon: "info",
        to: aboutId,
        transition: "slide",
      }),
      item("navigationBar", 0, 828, 412, 64, "", {
        tabs: [
          { icon: "home", label: loc(lang, "首页", "Home", "ホーム", "홈") },
          { icon: "explore", label: loc(lang, "发现", "Explore", "探す", "탐색") },
          { icon: "person", label: loc(lang, "我的", "Me", "マイ", "나") },
        ],
        selected: 0,
      }),
    ],
  };

  const settings: Screen = {
    id: settingsId,
    name: loc(lang, "设置", "Settings", "設定", "설정"),
    x: PHONE_W + FRAME_GAP,
    y: 0,
    preset: "phone",
    note: loc(lang, "系统设置列表，分组放在 Card 里", "System settings list, grouped in Cards", "システム設定リスト。Card でグループ化する", "시스템 설정 목록. Card로 묶는다"),
    items: [
      item("topAppBar", 0, 0, 412, 72, loc(lang, "设置", "Settings", "設定", "설정"), { variant: "small", icon: "arrow_back", to: "back", transition: "slide" }),
      item("searchBar", 16, 84, 380, 45, loc(lang, "搜索设置项", "Search settings", "設定を検索", "설정 검색")),
      item("smallTitle", 16, 148, 380, 28, loc(lang, "显示", "Display", "表示", "디스플레이")),
      item("switchPref", 16, 180, 380, 64, loc(lang, "深色模式", "Dark mode", "ダークモード", "다크 모드"), {
        supporting: loc(lang, "跟随系统", "Follow system", "システムに合わせる", "시스템 따름"),
        icon: "dark_mode",
        checked: false,
        note: loc(lang, "切换 MiuixTheme 的 ThemeController 模式", "Toggle ThemeController dark/light", "ThemeController のモードを切り替える", "ThemeController 모드를 전환"),
      }),
      item("sliderPref", 16, 244, 380, 80, loc(lang, "字体大小", "Font size", "文字サイズ", "글자 크기"), { value: 0.45, icon: "format_size" }),
      item("dropdownPref", 16, 324, 380, 64, loc(lang, "语言", "Language", "言語", "언어"), {
        supporting: loc(lang, "简体中文", "English", "日本語", "한국어"),
        icon: "language",
      }),
      item("smallTitle", 16, 404, 380, 28, loc(lang, "系统", "System", "システム", "시스템")),
      item("arrowPref", 16, 436, 380, 64, loc(lang, "关于本机", "About phone", "端末情報", "휴대전화 정보"), {
        supporting: "HyperOS 2",
        icon: "phone_iphone",
        to: aboutId,
        transition: "slide",
      }),
    ],
  };

  const about: Screen = {
    id: aboutId,
    name: loc(lang, "关于", "About", "情報", "정보"),
    x: (PHONE_W + FRAME_GAP) * 2,
    y: 0,
    preset: "phone",
    items: [
      item("topAppBar", 0, 0, 412, 72, loc(lang, "关于本机", "About phone", "端末情報", "휴대전화 정보"), { variant: "small", icon: "arrow_back", to: "back", transition: "slide" }),
      item("card", 16, 100, 380, 160, "Miuix Canvas", {
        supporting: loc(lang, "用 Miuix 组件拼界面，再生成提示词。", "Sketch with Miuix parts, then copy a prompt.", "Miuix 部品で画面を組み、プロンプトにする。", "Miuix 부품으로 화면을 만든 뒤 프롬프트를 복사한다."),
        icon: "palette",
      }),
      item("arrowPref", 16, 276, 380, 64, loc(lang, "开源许可", "Open source licenses", "オープンソースライセンス", "오픈 소스 라이선스"), {
        supporting: "Apache-2.0 · MIT",
        icon: "gavel",
      }),
      item("button", 141, 380, 130, 50, loc(lang, "返回", "Back", "戻る", "뒤로"), { variant: "primary", to: "back", transition: "fade" }),
    ],
  };

  return {
    version: 1,
    title: loc(lang, "示例应用", "Sample app", "サンプルアプリ", "샘플 앱"),
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
    const parsed: unknown = JSON.parse(raw);
    if (isProject(parsed)) return migrateDoc(parsed);
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
