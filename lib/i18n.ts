import type { Category, Kind, Lang, Platform, Transition } from "./types";

export type { Lang };

const ZH = {
  app: "Miuix Canvas",
  tagline: "在浏览器里拼装 HyperOS / Miuix 界面，再变成给 AI 编程工具的提示词",
  parts: "部件",
  layers: "图层",
  inspect: "属性",
  theme: "主题",
  prompt: "提示词",
  preview: "预览",
  edit: "编辑",
  addScreen: "添加屏幕",
  phone: "手机",
  desktop: "桌面",
  undo: "撤销",
  redo: "重做",
  tidy: "整理",
  copy: "复制提示词",
  copied: "已复制",
  save: "保存 JSON",
  load: "打开",
  share: "分享链接",
  png: "导出 PNG",
  delete: "删除",
  title: "应用名称",
  screenName: "屏幕名称",
  label: "标题",
  supporting: "摘要",
  icon: "图标",
  variant: "样式",
  note: "行为说明",
  target: "跳转到",
  transition: "过渡",
  none: "无",
  back: "返回",
  light: "浅色",
  dark: "深色",
  seed: "种子色",
  monet: "动态取色（Monet）",
  platform: "实现目标",
  cmp: "Compose Multiplatform",
  android: "Android",
  web: "Web (CMP)",
  lang: "语言",
  empty: "从左侧拖入部件，或点选后放到当前屏幕。",
  ready: "点预览里的部件可以跳转。按 Esc 退出。",
  github: "GitHub",
  select: "选择",
  hand: "抓手",
  actions: "操作",
  navigation: "导航",
  containment: "容器",
  inputs: "输入",
  content: "内容",
  progress: "进度",
  preference: "设置项",
  checked: "开启",
  value: "数值",
  tabs: "目的地",
  noSelection: "选中屏幕或部件以编辑。",
  newPhone: "屏幕",
  shareHint: "链接会打开这份设计。太大时请改用 JSON 文件。",
  linkCopied: "链接已复制",
  promptHint: "贴到 Cursor / Claude Code / Codex，让它用 Miuix 把应用做出来。",
} as const;

const EN: Record<keyof typeof ZH, string> = {
  app: "Miuix Canvas",
  tagline: "Sketch HyperOS / Miuix screens in the browser and turn them into vibe-coding prompts",
  parts: "Parts",
  layers: "Layers",
  inspect: "Inspect",
  theme: "Theme",
  prompt: "Prompt",
  preview: "Preview",
  edit: "Edit",
  addScreen: "Add screen",
  phone: "Phone",
  desktop: "Desktop",
  undo: "Undo",
  redo: "Redo",
  tidy: "Tidy",
  copy: "Copy prompt",
  copied: "Copied",
  save: "Save JSON",
  load: "Open",
  share: "Share link",
  png: "Export PNG",
  delete: "Delete",
  title: "App name",
  screenName: "Screen name",
  label: "Title",
  supporting: "Summary",
  icon: "Icon",
  variant: "Style",
  note: "Behavior note",
  target: "Goes to",
  transition: "Transition",
  none: "None",
  back: "Back",
  light: "Light",
  dark: "Dark",
  seed: "Seed color",
  monet: "Dynamic color (Monet)",
  platform: "Target",
  cmp: "Compose Multiplatform",
  android: "Android",
  web: "Web (CMP)",
  lang: "Language",
  empty: "Drag a part from the left, or click one to drop it on this screen.",
  ready: "Tap linked parts in preview. Esc to leave.",
  github: "GitHub",
  select: "Select",
  hand: "Hand",
  actions: "Actions",
  navigation: "Navigation",
  containment: "Containment",
  inputs: "Inputs",
  content: "Content",
  progress: "Progress",
  preference: "Preferences",
  checked: "On",
  value: "Value",
  tabs: "Destinations",
  noSelection: "Select a screen or part to edit.",
  newPhone: "Screen",
  shareHint: "Anyone with the link opens this design. Use JSON if it is too large.",
  linkCopied: "Link copied",
  promptHint: "Paste into Cursor, Claude Code or Codex and ask it to build the app with Miuix.",
};

const DICT: Record<Lang, Record<keyof typeof ZH, string>> = { zh: ZH, en: EN };

let current: Lang = "zh";

export function isLang(v: unknown): v is Lang {
  return v === "zh" || v === "en";
}

export function getLang(): Lang {
  return current;
}

export function setGlobalLang(lang: Lang) {
  current = lang;
}

export function t(key: keyof typeof ZH, lang: Lang = current): string {
  return DICT[lang][key];
}

export function categoryLabel(cat: Category, lang: Lang) {
  return t(cat, lang);
}

export const KIND_TEXT: Record<Lang, Record<Kind, string>> = {
  zh: {
    button: "按钮 Button",
    iconButton: "图标按钮 IconButton",
    fab: "悬浮按钮 FloatingActionButton",
    floatingToolbar: "悬浮工具栏 FloatingToolbar",
    topAppBar: "顶栏 TopAppBar",
    smallTitle: "小标题 SmallTitle",
    navigationBar: "导航栏 NavigationBar",
    navigationRail: "导航轨 NavigationRail",
    tabRow: "标签行 TabRow",
    searchBar: "搜索栏 SearchBar",
    breadcrumb: "面包屑 BreadcrumbBar",
    card: "卡片 Card",
    surface: "表面 Surface",
    divider: "分割线 Divider",
    snackbar: "提示条 Snackbar",
    dialog: "对话框 SuperDialog",
    textField: "输入框 TextField",
    switch: "开关 Switch",
    checkbox: "复选框 Checkbox",
    radio: "单选 RadioButton",
    slider: "滑块 Slider",
    dropdown: "下拉 Dropdown",
    numberPicker: "数字选择 NumberPicker",
    text: "文本 Text",
    image: "图片",
    badge: "徽标 Badge",
    icon: "图标 Icon",
    progress: "进度 ProgressIndicator",
    pullToRefresh: "下拉刷新 PullToRefresh",
    switchPref: "开关设置 SwitchPreference",
    checkboxPref: "复选设置 CheckboxPreference",
    radioPref: "单选设置 RadioButtonPreference",
    sliderPref: "滑块设置 SliderPreference",
    dropdownPref: "下拉设置 SpinnerPreference",
    arrowPref: "箭头设置 ArrowPreference",
  },
  en: {
    button: "Button",
    iconButton: "IconButton",
    fab: "FloatingActionButton",
    floatingToolbar: "FloatingToolbar",
    topAppBar: "TopAppBar",
    smallTitle: "SmallTitle",
    navigationBar: "NavigationBar",
    navigationRail: "NavigationRail",
    tabRow: "TabRow",
    searchBar: "SearchBar",
    breadcrumb: "BreadcrumbBar",
    card: "Card",
    surface: "Surface",
    divider: "Divider",
    snackbar: "Snackbar",
    dialog: "SuperDialog",
    textField: "TextField",
    switch: "Switch",
    checkbox: "Checkbox",
    radio: "RadioButton",
    slider: "Slider",
    dropdown: "Dropdown",
    numberPicker: "NumberPicker",
    text: "Text",
    image: "Image",
    badge: "Badge",
    icon: "Icon",
    progress: "ProgressIndicator",
    pullToRefresh: "PullToRefresh",
    switchPref: "SwitchPreference",
    checkboxPref: "CheckboxPreference",
    radioPref: "RadioButtonPreference",
    sliderPref: "SliderPreference",
    dropdownPref: "SpinnerPreference",
    arrowPref: "ArrowPreference",
  },
};

export const TRANSITION_TEXT: Record<Lang, Record<Transition, string>> = {
  zh: { slide: "从右滑入", slideLeft: "从左滑入", slideUp: "从下滑入", fade: "淡入", none: "无" },
  en: { slide: "Slide from right", slideLeft: "Slide from left", slideUp: "Slide from bottom", fade: "Fade", none: "None" },
};

export const PLATFORM_TEXT: Record<Lang, Record<Platform, string>> = {
  zh: { cmp: "Compose Multiplatform", android: "Android", web: "Web (CMP)" },
  en: { cmp: "Compose Multiplatform", android: "Android", web: "Web (CMP)" },
};

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "zh";
  return (navigator.language ?? "").toLowerCase().startsWith("en") ? "en" : "zh";
}
