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
  const galleryId = uid();

  const home: Screen = {
    id: homeId,
    name: loc(lang, "首页", "Home", "ホーム", "홈"),
    x: 0,
    y: 0,
    preset: "phone",
    items: [
      item("topAppBar", 0, 0, 412, 72, loc(lang, "首页", "Home", "ホーム", "홈"), { variant: "small" }),
      item("searchBar", 16, 80, 380, 45, loc(lang, "搜索", "Search", "検索", "검색"), { variant: "field" }),
      item("smallTitle", 0, 132, 412, 36, loc(lang, "开关", "Switch", "スイッチ", "스위치")),
      item("switchPref", 16, 168, 380, 56, loc(lang, "开关", "Switch", "スイッチ", "스위치"), { checked: false }),
      item("switchPref", 16, 224, 380, 56, loc(lang, "默认开启", "On by default", "デフォルトオン", "기본 켜짐"), { checked: true }),
      item("smallTitle", 0, 288, 412, 36, loc(lang, "复选 / 单选", "Checkbox / RadioButton", "チェック / ラジオ", "체크 / 라디오")),
      item("checkboxPref", 16, 324, 380, 56, loc(lang, "复选", "Checkbox", "チェック", "체크"), { checked: true }),
      item("radioPref", 16, 380, 380, 56, loc(lang, "标准", "Standard", "標準", "표준"), { checked: true }),
      item("smallTitle", 0, 444, 412, 36, loc(lang, "按钮", "Button", "ボタン", "버튼")),
      item("button", 16, 484, 182, 50, loc(lang, "取消", "Cancel", "キャンセル", "취소"), { variant: "secondary" }),
      item("button", 214, 484, 182, 50, loc(lang, "提交", "Submit", "送信", "제출"), { variant: "primary" }),
      item("smallTitle", 0, 542, 412, 36, loc(lang, "标签栏", "TabRow", "タブ行", "탭 행")),
      item("tabRow", 16, 578, 380, 42, "", {
        variant: "default",
        tabs: [
          { icon: "", label: loc(lang, "推荐", "For you", "おすすめ", "추천") },
          { icon: "", label: loc(lang, "关注", "Following", "フォロー", "팔로잉") },
          { icon: "", label: loc(lang, "热门", "Popular", "人気", "인기") },
        ],
        selected: 0,
      }),
      item("smallTitle", 0, 628, 412, 36, loc(lang, "其他", "Other", "その他", "기타")),
      item("arrowPref", 16, 664, 380, 64, loc(lang, "下拉刷新", "Pull to refresh", "プル更新", "당겨서 새로고침"), {
        supporting: loc(lang, "打开下拉刷新页", "Open the refresh page", "更新ページを開く", "새로고침 페이지"),
        to: galleryId,
        transition: "slide",
      }),
      item("arrowPref", 16, 728, 380, 64, loc(lang, "设置", "Settings", "設定", "설정"), {
        supporting: loc(lang, "显示、声音、通知", "Display, sound, notifications", "表示、サウンド、通知", "디스플레이, 소리, 알림"),
        to: settingsId,
        transition: "slide",
      }),
      item("navigationBar", 0, 828, 412, 64, "", {
        variant: "iconAndText",
        tabs: [
          { icon: "home", label: loc(lang, "首页", "Home", "ホーム", "홈") },
          { icon: "explore", label: loc(lang, "发现", "Explore", "探す", "탐색"), to: galleryId, transition: "slide" },
          { icon: "person", label: loc(lang, "我的", "Me", "マイ", "나"), to: aboutId, transition: "slide" },
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
      item("searchBar", 16, 80, 380, 45, loc(lang, "搜索设置项", "Search settings", "設定を検索", "설정 검색"), { variant: "field" }),
      item("smallTitle", 0, 136, 412, 36, loc(lang, "显示", "Display", "表示", "디스플레이")),
      item("switchPref", 16, 172, 380, 64, loc(lang, "深色模式", "Dark mode", "ダークモード", "다크 모드"), {
        supporting: loc(lang, "跟随系统", "Follow system", "システムに合わせる", "시스템 따름"),
        checked: false,
        note: loc(lang, "切换 MiuixTheme 的 ThemeController 模式", "Toggle ThemeController dark/light", "ThemeController のモードを切り替える", "ThemeController 모드를 전환"),
      }),
      item("sliderPref", 16, 236, 380, 80, loc(lang, "字体大小", "Font size", "文字サイズ", "글자 크기"), { value: 0.45 }),
      item("dropdownPref", 16, 316, 380, 64, loc(lang, "语言", "Language", "言語", "언어"), {
        supporting: loc(lang, "简体中文", "English", "日本語", "한국어"),
        variant: "overlay",
        selected: 0,
        tabs: [
          { icon: "", label: loc(lang, "简体中文", "Chinese", "中国語", "중국어") },
          { icon: "", label: loc(lang, "English", "English", "英語", "영어") },
          { icon: "", label: loc(lang, "日本語", "Japanese", "日本語", "일본어") },
        ],
      }),
      item("spinnerPref", 16, 380, 380, 64, loc(lang, "排序方式", "Sort by", "並べ替え", "정렬"), {
        supporting: loc(lang, "名称", "Name", "名前", "이름"),
        variant: "overlay",
        selected: 0,
        tabs: [
          { icon: "", label: loc(lang, "名称", "Name", "名前", "이름") },
          { icon: "", label: loc(lang, "日期", "Date", "日付", "날짜") },
          { icon: "", label: loc(lang, "大小", "Size", "サイズ", "크기") },
        ],
      }),
      item("smallTitle", 0, 452, 412, 36, loc(lang, "系统", "System", "システム", "시스템")),
      item("arrowPref", 16, 488, 380, 64, loc(lang, "关于本机", "About phone", "端末情報", "휴대전화 정보"), {
        supporting: "HyperOS 2",
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
      item("card", 16, 100, 380, 148, "Miuix Canvas", {
        supporting: loc(lang, "用 Miuix 组件拼界面，再生成提示词。", "Sketch with Miuix parts, then copy a prompt.", "Miuix 部品で画面を組み、プロンプトにする。", "Miuix 부품으로 화면을 만든 뒤 프롬프트를 복사한다."),
      }),
      item("textField", 16, 264, 380, 50, loc(lang, "设备名称", "Device name", "デバイス名", "기기 이름")),
      item("breadcrumb", 16, 328, 380, 48, loc(lang, "设置 / 显示 / 关于", "Settings / Display / About", "設定 / 表示 / 情報", "설정 / 디스플레이 / 정보")),
      item("arrowPref", 16, 392, 380, 64, loc(lang, "开源许可", "Open source licenses", "オープンソースライセンス", "오픈 소스 라이선스"), {
        supporting: "Apache-2.0 · MIT",
      }),
      item("button", 16, 472, 182, 50, loc(lang, "返回", "Back", "戻る", "뒤로"), { variant: "text", to: "back", transition: "fade" }),
      item("button", 214, 472, 182, 50, loc(lang, "确定", "OK", "OK", "확인"), { variant: "primary", to: "back", transition: "fade" }),
    ],
  };

  const gallery: Screen = {
    id: galleryId,
    name: loc(lang, "组件", "Parts", "部品", "부품"),
    x: (PHONE_W + FRAME_GAP) * 3,
    y: 0,
    preset: "phone",
    items: [
      item("topAppBar", 0, 0, 412, 72, loc(lang, "组件", "Parts", "部品", "부품"), { variant: "small", icon: "arrow_back", to: "back", transition: "slide" }),
      item("smallTitle", 0, 80, 412, 36, loc(lang, "滑块", "Slider", "スライダー", "슬라이더")),
      item("slider", 16, 124, 380, 28, "", { value: 0.6, variant: "horizontal" }),
      item("rangeSlider", 16, 160, 380, 28, "", { value: 0.8, from: 0.2 }),
      item("smallTitle", 0, 196, 412, 36, loc(lang, "进度", "Progress", "進捗", "진행")),
      item("progress", 16, 240, 380, 6, "", { variant: "linear", value: 0.45 }),
      item("progress", 16, 260, 30, 30, "", { variant: "circular" }),
      item("progress", 56, 265, 20, 20, "", { variant: "infinite" }),
      item("smallTitle", 0, 304, 412, 36, loc(lang, "色板", "Color palette", "カラーパレット", "색 팔레트")),
      item("colorPalette", 16, 344, 380, 96, ""),
      item("smallTitle", 0, 420, 412, 36, loc(lang, "数字选择 / 模糊", "NumberPicker / Blur", "数値ピッカー / ブラー", "숫자 선택 / 블러")),
      item("numberPicker", 36, 464, 160, 140, "12"),
      item("blur", 216, 464, 180, 140, loc(lang, "纹理模糊", "Texture blur", "テクスチャブラー", "텍스처 블러")),
      item("snackbar", 16, 620, 380, 48, loc(lang, "已保存", "Saved", "保存しました", "저장됨")),
      item("tooltip", 16, 684, 140, 36, loc(lang, "提示文字", "Tooltip", "ツールチップ", "툴팁"), { variant: "plain" }),
      item("badge", 172, 692, 16, 16, "3", { variant: "number" }),
      item("badge", 200, 698, 6, 6, "", { variant: "dot" }),
      item("image", 0, 700, 412, 192, ""),
      item("floatingNav", 0, 792, 412, 100, "", {
        variant: "iosLike",
        tabs: [
          { icon: "home", label: loc(lang, "首页", "Home", "ホーム", "홈") },
          { icon: "explore", label: loc(lang, "发现", "Explore", "探す", "탐색") },
          { icon: "person", label: loc(lang, "我的", "Me", "マイ", "마이") },
        ],
        selected: 0,
      }),
    ],
  };

  return {
    version: 2,
    title: loc(lang, "示例应用", "Sample app", "サンプルアプリ", "샘플 앱"),
    platform: "cmp",
    theme: { ...DEFAULT_THEME, seed: MIUIX_BLUE },
    screens: [home, settings, about, gallery],
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
