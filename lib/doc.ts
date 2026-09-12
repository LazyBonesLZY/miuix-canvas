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
  const home: Screen = {
    id: uid(),
    name: loc(lang, "首页", "Home", "ホーム", "홈"),
    x: 0,
    y: 0,
    preset: "phone",
    items: [
      item("topAppBar", 0, 0, 412, 72, loc(lang, "首页", "Home", "ホーム", "홈"), { variant: "small" }),
      item("searchBar", 16, 80, 380, 45, loc(lang, "搜索", "Search", "検索", "검색"), { variant: "field" }),
      item("smallTitle", 0, 133, 412, 40, loc(lang, "开关", "Switch", "スイッチ", "스위치")),
      item("switchPref", 16, 173, 380, 56, loc(lang, "开关", "Switch", "スイッチ", "스위치"), { checked: false }),
      item("switchPref", 16, 229, 380, 56, loc(lang, "默认开启", "On by default", "デフォルトオン", "기본 켜짐"), { checked: true }),
      item("smallTitle", 0, 293, 412, 40, loc(lang, "复选 / 单选", "Check / Radio", "チェック / ラジオ", "체크 / 라디오")),
      item("checkboxPref", 16, 333, 380, 56, loc(lang, "复选", "Checkbox", "체크", "체크"), { checked: true }),
      item("radioPref", 16, 389, 380, 56, loc(lang, "标准", "Standard", "標準", "표준"), { checked: true }),
      item("smallTitle", 0, 453, 412, 40, loc(lang, "按钮", "Button", "ボタン", "버튼")),
      item("button", 16, 501, 182, 50, loc(lang, "取消", "Cancel", "キャンセル", "취소"), { variant: "secondary" }),
      item("button", 214, 501, 182, 50, loc(lang, "提交", "Submit", "送信", "제출"), { variant: "primary" }),
      item("smallTitle", 0, 559, 412, 40, loc(lang, "卡片", "Card", "カード", "카드")),
      item("card", 16, 599, 380, 88, "Miuix Canvas", {
        supporting: loc(lang, "用 Miuix 组件拼界面，再生成提示词。", "Sketch with Miuix parts, then copy a prompt.", "Miuix 部品で画面を組み、プロンプトにする。", "Miuix 부품으로 화면을 만든 뒤 프롬프트를 복사한다."),
      }),
      item("dropdownPref", 16, 695, 380, 80, loc(lang, "语言", "Language", "言語", "언어"), {
        supporting: loc(lang, "简体中文", "English", "日本語", "한국어"),
        variant: "overlay",
        selected: 0,
        tabs: [
          { icon: "", label: loc(lang, "简体中文", "Chinese", "中国語", "중국어") },
          { icon: "", label: loc(lang, "English", "English", "英語", "영어") },
          { icon: "", label: loc(lang, "日本語", "Japanese", "日本語", "일본어") },
        ],
      }),
      item("navigationBar", 0, 828, 412, 64, "", {
        variant: "iconAndText",
        tabs: [
          { icon: "home", label: loc(lang, "首页", "Home", "ホーム", "홈") },
          { icon: "explore", label: loc(lang, "发现", "Explore", "探す", "탐색") },
          { icon: "person", label: loc(lang, "我的", "Me", "マイ", "나") },
        ],
        selected: 0,
      }),
    ],
  };

  return {
    version: 3,
    title: loc(lang, "示例应用", "Sample app", "サンプルアプリ", "샘플 앱"),
    platform: "cmp",
    theme: { ...DEFAULT_THEME, seed: MIUIX_BLUE },
    screens: [home],
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
