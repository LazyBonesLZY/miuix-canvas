import { MIUIX_BLUE } from "./color";
import type { Category, FramePreset, Item, Kind, Lang, Localized, NavTab, ScaffoldSlot, Theme } from "./types";
import { DESKTOP_H, DESKTOP_W, MARGIN, PHONE_H, PHONE_W, contentWidth, uid } from "./types";

export const DEFAULT_THEME: Theme = {
  mode: "light",
  seed: MIUIX_BLUE,
  monet: false,
};

export type KindSpec = {
  kind: Kind;
  category: Category;
  icon: string;
  w: (preset: FramePreset) => number;
  h: number;
  edge?: "top" | "bottom" | "start";
  variants?: string[];
  defaultLabel: Localized;
  defaultSupporting?: Localized;
  tabs?: NavTab[];
  checked?: boolean;
  value?: number;
  from?: number;
  composable: string;
};

const L = (zh: string, en: string, ja: string, ko: string): Localized => ({ zh, en, ja, ko });
const full = (preset: FramePreset) => contentWidth(preset);
const edge = () => PHONE_W;

const TAB_I18N: Record<string, Localized> = {
  首页: L("首页", "Home", "ホーム", "홈"),
  发现: L("发现", "Explore", "探す", "탐색"),
  我的: L("我的", "Me", "マイ", "나"),
  推荐: L("推荐", "For you", "おすすめ", "추천"),
  关注: L("关注", "Following", "フォロー", "팔로잉"),
  热门: L("热门", "Popular", "人気", "인기"),
  复制: L("复制", "Copy", "コピー", "복사"),
  分享: L("分享", "Share", "共有", "공유"),
  删除: L("删除", "Delete", "削除", "삭제"),
  编辑: L("编辑", "Edit", "編集", "편집"),
  更多: L("更多", "More", "その他", "더보기"),
  排序: L("排序", "Sort", "並べ替え", "정렬"),
  视图: L("视图", "View", "表示", "보기"),
  筛选: L("筛选", "Filter", "絞り込み", "필터"),
  选项一: L("选项一", "Option 1", "オプション 1", "옵션 1"),
  选项二: L("选项二", "Option 2", "オプション 2", "옵션 2"),
  选项三: L("选项三", "Option 3", "オプション 3", "옵션 3"),
  中文: L("简体中文", "Chinese", "中国語", "중국어"),
  英文: L("English", "English", "英語", "영어"),
  日文: L("日本語", "Japanese", "日本語", "일본어"),
  名称: L("名称", "Name", "名前", "이름"),
  日期: L("日期", "Date", "日付", "날짜"),
  大小: L("大小", "Size", "サイズ", "크기"),
};

export const KIND_SPEC: Record<Kind, KindSpec> = {
  button: { kind: "button", category: "actions", icon: "smart_button", w: () => 180, h: 50, variants: ["secondary", "primary", "text", "disabled"], defaultLabel: L("确定", "OK", "OK", "확인"), composable: "Button" },
  iconButton: { kind: "iconButton", category: "actions", icon: "more_horiz", w: () => 40, h: 40, defaultLabel: L("", "", "", ""), composable: "IconButton" },
  fab: { kind: "fab", category: "actions", icon: "add", w: () => 60, h: 60, defaultLabel: L("", "", "", ""), composable: "FloatingActionButton" },
  floatingToolbar: { kind: "floatingToolbar", category: "actions", icon: "construction", w: () => 220, h: 52, defaultLabel: L("工具", "Tools", "ツール", "도구"), tabs: [{ icon: "edit", label: "" }, { icon: "content_copy", label: "" }, { icon: "delete", label: "" }], composable: "FloatingToolbar" },
  topAppBar: { kind: "topAppBar", category: "navigation", icon: "web_asset", w: edge, h: 72, edge: "top", variants: ["small", "large"], defaultLabel: L("标题", "Title", "タイトル", "제목"), composable: "SmallTopAppBar" },
  smallTitle: { kind: "smallTitle", category: "navigation", icon: "title", w: full, h: 36, defaultLabel: L("常用功能", "Shortcuts", "ショートカット", "바로가기"), composable: "SmallTitle" },
  navigationBar: { kind: "navigationBar", category: "navigation", icon: "dock_to_bottom", w: edge, h: 64, edge: "bottom", variants: ["iconAndText", "iconOnly", "iconWithSelectedLabel"], defaultLabel: L("导航", "Navigation", "ナビ", "탐색"), tabs: [{ icon: "home", label: "首页" }, { icon: "explore", label: "发现" }, { icon: "person", label: "我的" }], composable: "NavigationBar" },
  floatingNav: { kind: "floatingNav", category: "navigation", icon: "dock_to_bottom", w: () => 280, h: 52, variants: ["default", "iosLike"], defaultLabel: L("悬浮导航", "Floating nav", "フローティングナビ", "플로팅 탐색"), tabs: [{ icon: "home", label: "首页" }, { icon: "explore", label: "发现" }, { icon: "person", label: "我的" }], composable: "FloatingNavigationBar" },
  navigationRail: { kind: "navigationRail", category: "navigation", icon: "view_sidebar", w: () => 80, h: 400, edge: "start", variants: ["classic", "collapsed", "expanded"], defaultLabel: L("导航", "Navigation", "ナビ", "탐색"), tabs: [{ icon: "home", label: "首页" }, { icon: "explore", label: "发现" }, { icon: "person", label: "我的" }], composable: "NavigationRail" },
  tabRow: { kind: "tabRow", category: "navigation", icon: "tabs", w: full, h: 42, variants: ["default", "contour"], defaultLabel: L("标签", "Tabs", "タブ", "탭"), tabs: [{ icon: "", label: "推荐" }, { icon: "", label: "关注" }, { icon: "", label: "热门" }], composable: "TabRow" },
  searchBar: { kind: "searchBar", category: "navigation", icon: "search", w: full, h: 45, variants: ["field", "expanded"], defaultLabel: L("搜索", "Search", "検索", "검색"), composable: "SearchBar" },
  breadcrumb: { kind: "breadcrumb", category: "navigation", icon: "more_horiz", w: full, h: 48, defaultLabel: L("设置 / 显示", "Settings / Display", "設定 / 表示", "설정 / 디스플레이"), composable: "BreadcrumbBar" },
  card: { kind: "card", category: "containment", icon: "rectangle", w: full, h: 120, defaultLabel: L("卡片标题", "Card title", "カードタイトル", "카드 제목"), defaultSupporting: L("辅助说明文字", "Supporting text", "補足テキスト", "보조 설명"), composable: "Card" },
  surface: { kind: "surface", category: "containment", icon: "crop_square", w: full, h: 80, defaultLabel: L("", "", "", ""), composable: "Surface" },
  divider: { kind: "divider", category: "containment", icon: "horizontal_rule", w: full, h: 1, variants: ["horizontal", "vertical"], defaultLabel: L("", "", "", ""), composable: "HorizontalDivider" },
  snackbar: { kind: "snackbar", category: "containment", icon: "call_to_action", w: full, h: 48, defaultLabel: L("已保存", "Saved", "保存しました", "저장됨"), composable: "Snackbar" },
  dialog: { kind: "dialog", category: "containment", icon: "web_stories", w: () => 320, h: 200, variants: ["overlay", "window"], defaultLabel: L("提示", "Notice", "確認", "알림"), defaultSupporting: L("确认要继续吗？", "Continue?", "続行しますか？", "계속할까요?"), composable: "OverlayDialog" },
  bottomSheet: { kind: "bottomSheet", category: "containment", icon: "bottom_sheets", w: edge, h: 280, edge: "bottom", variants: ["overlay", "window"], defaultLabel: L("更多操作", "More", "その他", "더보기"), defaultSupporting: L("从底部滑出的面板", "Sheet from the bottom", "下から出るシート", "아래에서 올라오는 시트"), composable: "OverlayBottomSheet" },
  listPopup: { kind: "listPopup", category: "containment", icon: "list", w: () => 200, h: 160, variants: ["overlay", "window"], defaultLabel: L("菜单", "Menu", "メニュー", "메뉴"), tabs: [{ icon: "", label: "复制" }, { icon: "", label: "分享" }, { icon: "", label: "删除" }], composable: "OverlayListPopup" },
  cascadingPopup: { kind: "cascadingPopup", category: "containment", icon: "account_tree", w: () => 280, h: 176, variants: ["overlay", "window"], defaultLabel: L("级联菜单", "Cascading menu", "カスケードメニュー", "계단식 메뉴"), tabs: [{ icon: "", label: "编辑" }, { icon: "", label: "分享" }, { icon: "", label: "更多" }], composable: "OverlayCascadingListPopup" },
  dropdownMenu: { kind: "dropdownMenu", category: "containment", icon: "menu", w: () => 200, h: 168, variants: ["overlay", "window"], defaultLabel: L("下拉菜单", "Dropdown menu", "ドロップダウン", "드롭다운 메뉴"), tabs: [{ icon: "", label: "复制" }, { icon: "", label: "分享" }, { icon: "", label: "删除" }], composable: "OverlayDropdownMenu" },
  iconDropdownMenu: { kind: "iconDropdownMenu", category: "containment", icon: "more_horiz", w: () => 200, h: 176, variants: ["overlay", "window"], defaultLabel: L("更多", "More", "その他", "더보기"), tabs: [{ icon: "", label: "编辑" }, { icon: "", label: "复制" }, { icon: "", label: "分享" }, { icon: "", label: "删除" }], composable: "OverlayIconDropdownMenu" },
  iconCascadingMenu: { kind: "iconCascadingMenu", category: "containment", icon: "more_vert", w: () => 280, h: 176, variants: ["overlay", "window"], defaultLabel: L("更多", "More", "その他", "더보기"), tabs: [{ icon: "", label: "排序" }, { icon: "", label: "视图" }, { icon: "", label: "筛选" }], composable: "OverlayIconCascadingDropdownMenu" },
  tooltip: { kind: "tooltip", category: "containment", icon: "tooltip_2", w: () => 140, h: 36, variants: ["plain", "rich"], defaultLabel: L("提示文字", "Tooltip", "ツールチップ", "툴팁"), defaultSupporting: L("补充说明", "More detail", "補足", "추가 설명"), composable: "Tooltip" },
  textField: { kind: "textField", category: "inputs", icon: "edit_note", w: full, h: 50, defaultLabel: L("输入内容", "Enter text", "入力", "입력"), composable: "TextField" },
  switch: { kind: "switch", category: "inputs", icon: "toggle_on", w: () => 49, h: 28, defaultLabel: L("", "", "", ""), checked: true, composable: "Switch" },
  checkbox: { kind: "checkbox", category: "inputs", icon: "check_box", w: () => 26, h: 26, defaultLabel: L("", "", "", ""), checked: true, composable: "Checkbox" },
  radio: { kind: "radio", category: "inputs", icon: "radio_button_checked", w: () => 26, h: 26, defaultLabel: L("", "", "", ""), checked: true, composable: "RadioButton" },
  slider: { kind: "slider", category: "inputs", icon: "tune", w: full, h: 28, variants: ["horizontal", "vertical", "steps", "disabled"], defaultLabel: L("", "", "", ""), value: 0.6, composable: "Slider" },
  rangeSlider: { kind: "rangeSlider", category: "inputs", icon: "linear_scale", w: full, h: 28, defaultLabel: L("", "", "", ""), value: 0.8, from: 0.2, composable: "RangeSlider" },
  dropdown: { kind: "dropdown", category: "inputs", icon: "arrow_drop_down_circle", w: full, h: 50, variants: ["overlay", "window"], defaultLabel: L("请选择", "Choose", "選択", "선택"), tabs: [{ icon: "", label: "选项一" }, { icon: "", label: "选项二" }, { icon: "", label: "选项三" }], composable: "OverlayDropdownPreference" },
  numberPicker: { kind: "numberPicker", category: "inputs", icon: "pin", w: () => 160, h: 140, defaultLabel: L("12", "12", "12", "12"), composable: "NumberPicker" },
  colorPicker: { kind: "colorPicker", category: "inputs", icon: "palette", w: full, h: 180, defaultLabel: L("取色", "Color", "カラー", "색상"), composable: "ColorPicker" },
  colorPalette: { kind: "colorPalette", category: "inputs", icon: "grid_view", w: full, h: 96, defaultLabel: L("", "", "", ""), composable: "ColorPalette" },
  text: { kind: "text", category: "content", icon: "notes", w: full, h: 24, defaultLabel: L("正文", "Body", "本文", "본문"), composable: "Text" },
  image: { kind: "image", category: "content", icon: "image", w: full, h: 160, defaultLabel: L("", "", "", ""), composable: "Image" },
  badge: { kind: "badge", category: "content", icon: "mark_chat_unread", w: () => 16, h: 16, variants: ["number", "dot"], defaultLabel: L("3", "3", "3", "3"), composable: "Badge" },
  icon: { kind: "icon", category: "content", icon: "star", w: () => 28, h: 28, defaultLabel: L("", "", "", ""), composable: "Icon" },
  progress: { kind: "progress", category: "progress", icon: "progress_activity", w: full, h: 6, variants: ["linear", "circular", "infinite"], defaultLabel: L("", "", "", ""), value: 0.45, composable: "ProgressIndicator" },
  pullToRefresh: { kind: "pullToRefresh", category: "progress", icon: "refresh", w: () => 20, h: 20, defaultLabel: L("", "", "", ""), composable: "PullToRefresh" },
  scrollBar: { kind: "scrollBar", category: "progress", icon: "linear_scale", w: () => 6, h: 80, variants: ["vertical", "horizontal"], defaultLabel: L("", "", "", ""), composable: "ScrollBar" },
  blur: { kind: "blur", category: "containment", icon: "blur_on", w: full, h: 160, defaultLabel: L("模糊", "Blur", "ブラー", "블러"), composable: "Modifier.textureBlur" },
  basicPref: { kind: "basicPref", category: "preference", icon: "view_agenda", w: full, h: 64, defaultLabel: L("通用项", "Basic row", "基本項目", "기본 항목"), defaultSupporting: L("自定义右侧内容", "Custom trailing slot", "末尾スロットをカスタム", "오른쪽 슬롯 사용자화"), composable: "BasicComponent" },
  switchPref: { kind: "switchPref", category: "preference", icon: "toggle_on", w: full, h: 64, defaultLabel: L("深色模式", "Dark mode", "ダークモード", "다크 모드"), defaultSupporting: L("跟随系统", "Follow system", "システムに合わせる", "시스템 따름"), checked: true, composable: "SwitchPreference" },
  checkboxPref: { kind: "checkboxPref", category: "preference", icon: "check_box", w: full, h: 64, defaultLabel: L("同步数据", "Sync data", "データを同期", "데이터 동기화"), defaultSupporting: L("使用移动网络时同步", "Sync on mobile data", "モバイル通信でも同期", "모바일 데이터에서도 동기화"), checked: false, composable: "CheckboxPreference" },
  radioPref: { kind: "radioPref", category: "preference", icon: "radio_button_checked", w: full, h: 56, defaultLabel: L("标准", "Standard", "標準", "표준"), checked: true, composable: "RadioButtonPreference" },
  sliderPref: { kind: "sliderPref", category: "preference", icon: "tune", w: full, h: 80, defaultLabel: L("字体大小", "Font size", "文字サイズ", "글자 크기"), value: 0.5, composable: "SliderPreference" },
  rangeSliderPref: { kind: "rangeSliderPref", category: "preference", icon: "linear_scale", w: full, h: 80, defaultLabel: L("音量范围", "Volume range", "音量レンジ", "음량 범위"), value: 0.8, from: 0.2, composable: "RangeSliderPreference" },
  dropdownPref: { kind: "dropdownPref", category: "preference", icon: "arrow_drop_down_circle", w: full, h: 64, variants: ["window", "overlay"], defaultLabel: L("语言", "Language", "言語", "언어"), defaultSupporting: L("简体中文", "English", "日本語", "한국어"), tabs: [{ icon: "", label: "中文" }, { icon: "", label: "英文" }, { icon: "", label: "日文" }], composable: "WindowDropdownPreference" },
  spinnerPref: { kind: "spinnerPref", category: "preference", icon: "tune", w: full, h: 64, variants: ["window", "overlay"], defaultLabel: L("排序方式", "Sort by", "並べ替え", "정렬"), defaultSupporting: L("名称", "Name", "名前", "이름"), tabs: [{ icon: "", label: "名称" }, { icon: "", label: "日期" }, { icon: "", label: "大小" }], composable: "WindowSpinnerPreference" },
  arrowPref: { kind: "arrowPref", category: "preference", icon: "chevron_right", w: full, h: 64, defaultLabel: L("关于本机", "About phone", "端末情報", "휴대전화 정보"), defaultSupporting: L("HyperOS 2", "HyperOS 2", "HyperOS 2", "HyperOS 2"), composable: "ArrowPreference" },
};

export const KIND_ORDER = Object.keys(KIND_SPEC) as Kind[];
export const KIND_SET = new Set<string>(KIND_ORDER);
export const CATEGORIES: Category[] = ["actions", "navigation", "containment", "inputs", "content", "progress", "preference"];

function defaultSlot(kind: Kind): ScaffoldSlot {
  if (kind === "topAppBar") return "topBar";
  if (kind === "navigationBar" || kind === "floatingNav") return "bottomBar";
  if (kind === "fab") return "floatingActionButton";
  if (kind === "floatingToolbar") return "floatingToolbar";
  if (kind === "snackbar") return "snackbarHost";
  if (["dialog", "bottomSheet", "listPopup", "cascadingPopup", "dropdownMenu", "iconDropdownMenu", "iconCascadingMenu"].includes(kind)) return "overlay";
  return "content";
}

export function makeItem(kind: Kind, preset: FramePreset, lang: Lang, x: number, y: number): Item {
  const spec = KIND_SPEC[kind];
  const screenW = preset === "desktop" ? DESKTOP_W : PHONE_W;
  const sized = applyVariant({ id: "", kind, x, y, w: spec.w(preset), h: spec.h, label: "" }, spec.variants?.[0] ?? "");
  const w = spec.edge === "top" || spec.edge === "bottom" ? screenW : (sized.w ?? spec.w(preset));
  return {
    id: uid(),
    kind,
    x,
    y,
    w,
    h: sized.h ?? spec.h,
    label: spec.defaultLabel[lang],
    supporting: spec.defaultSupporting?.[lang],
    icon: ["iconButton", "fab", "icon", "pullToRefresh"].includes(kind) ? spec.icon : undefined,
    variant: spec.variants?.[0],
    enabled: true,
    show: true,
    slot: defaultSlot(kind),
    checked: spec.checked,
    value: spec.value,
    from: spec.from,
    tabs: spec.tabs
      ? spec.tabs.map((tab) => ({ ...tab, label: TAB_I18N[tab.label]?.[lang] ?? tab.label }))
      : undefined,
    selected: spec.tabs ? 0 : undefined,
  };
}

export function applyVariant(it: Item, variant: string): Partial<Item> {
  const patch: Partial<Item> = { variant };
  if (it.kind === "divider") {
    return variant === "vertical" ? { ...patch, w: 1, h: Math.max(it.h > 8 ? it.h : 160, 120) } : { ...patch, w: Math.max(it.w, 200), h: 1 };
  }
  if (it.kind === "slider") {
    return variant === "vertical" ? { ...patch, w: 28, h: Math.max(it.h, 160) } : { ...patch, w: Math.max(it.w, 200), h: 28 };
  }
  if (it.kind === "floatingNav") {
    return variant === "iosLike" || variant === "glass" ? { ...patch, x: 0, w: Math.max(it.w, PHONE_W), h: 100 } : { ...patch, w: 280, h: 52 };
  }
  if (it.kind === "navigationRail") {
    return variant === "expanded" ? { ...patch, w: 240 } : { ...patch, w: 80 };
  }
  if (it.kind === "topAppBar") {
    return variant === "large" ? { ...patch, h: 88 } : { ...patch, h: 72 };
  }
  if (it.kind === "progress") {
    return variant === "linear" ? { ...patch, w: Math.max(it.w, 200), h: 6 } : { ...patch, w: 30, h: 30 };
  }
  if (it.kind === "searchBar") {
    return variant === "expanded" ? { ...patch, h: 220 } : { ...patch, h: 45 };
  }
  if (it.kind === "badge") {
    return variant === "dot" ? { ...patch, w: 6, h: 6, label: "" } : { ...patch, w: 16, h: 16 };
  }
  if (it.kind === "tabRow") {
    return variant === "contour" ? { ...patch, h: 45 } : { ...patch, h: 42 };
  }
  if (it.kind === "tooltip") {
    return variant === "rich" ? { ...patch, w: Math.max(it.w, 168), h: Math.max(it.h, 88) } : { ...patch, h: 36 };
  }
  if (it.kind === "scrollBar") {
    return variant === "horizontal" ? { ...patch, w: Math.max(it.w, 80), h: 6 } : { ...patch, w: 6, h: Math.max(it.h, 80) };
  }
  return patch;
}

export function composableOf(it: Pick<Item, "kind" | "variant">): string {
  const v = it.variant;
  switch (it.kind) {
    case "divider":
      return v === "vertical" ? "VerticalDivider" : "HorizontalDivider";
    case "progress":
      return v === "infinite" ? "InfiniteProgressIndicator" : v === "circular" ? "CircularProgressIndicator" : "LinearProgressIndicator";
    case "slider":
      return v === "vertical" ? "VerticalSlider" : "Slider";
    case "button":
      return v === "text" ? "TextButton" : "Button";
    case "topAppBar":
      return v === "small" ? "SmallTopAppBar" : "TopAppBar";
    case "tabRow":
      return v === "contour" ? "TabRowWithContour" : "TabRow";
    case "tooltip":
      return v === "rich" ? "RichTooltipBox" : "Tooltip";
    case "dialog":
      return v === "window" ? "WindowDialog" : "OverlayDialog";
    case "bottomSheet":
      return v === "window" ? "WindowBottomSheet" : "OverlayBottomSheet";
    case "dropdown":
      return v === "window" ? "WindowDropdownPreference" : "OverlayDropdownPreference";
    case "dropdownMenu":
      return v === "window" ? "WindowDropdownMenu" : "OverlayDropdownMenu";
    case "iconDropdownMenu":
      return v === "window" ? "WindowIconDropdownMenu" : "OverlayIconDropdownMenu";
    case "iconCascadingMenu":
      return v === "window" ? "WindowIconCascadingDropdownMenu" : "OverlayIconCascadingDropdownMenu";
    case "listPopup":
      return v === "window" ? "WindowListPopup" : "OverlayListPopup";
    case "cascadingPopup":
      return v === "window" ? "WindowCascadingListPopup" : "OverlayCascadingListPopup";
    case "dropdownPref":
      return v === "overlay" ? "OverlayDropdownPreference" : "WindowDropdownPreference";
    case "spinnerPref":
      return v === "overlay" ? "OverlaySpinnerPreference" : "WindowSpinnerPreference";
    case "scrollBar":
      return v === "horizontal" ? "HorizontalScrollBar" : "VerticalScrollBar";
    default:
      return KIND_SPEC[it.kind].composable;
  }
}

export function defaultPosition(kind: Kind, preset: FramePreset, existing: Item[]) {
  const spec = KIND_SPEC[kind];
  const w = preset === "desktop" ? DESKTOP_W : PHONE_W;
  const h = preset === "desktop" ? DESKTOP_H : PHONE_H;
  if (spec.edge === "top") return { x: 0, y: 0 };
  if (spec.edge === "bottom") return { x: 0, y: h - spec.h };
  if (spec.edge === "start") return { x: 0, y: 88 };
  if (kind === "fab") return { x: w - MARGIN - 60, y: h - 64 - MARGIN - 60 };
  if (kind === "floatingNav") return { x: Math.round((w - 280) / 2), y: h - 64 - MARGIN - 52 };
  if (kind === "snackbar") return { x: MARGIN, y: h - 64 - MARGIN - 48 };
  if (kind === "dialog") return { x: Math.round((w - 320) / 2), y: Math.round((h - 200) / 2) };
  if (kind === "bottomSheet") return { x: 0, y: h - 280 };
  if (kind === "scrollBar") return { x: w - 14, y: 120 };
  if (kind === "cascadingPopup" || kind === "dropdownMenu" || kind === "listPopup" || kind === "iconDropdownMenu" || kind === "iconCascadingMenu") return { x: Math.round((w - spec.w(preset)) / 2), y: 180 };
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
