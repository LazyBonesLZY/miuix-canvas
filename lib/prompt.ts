import { KIND_TEXT, PLATFORM_TEXT, SWIPE_TEXT, TRANSITION_TEXT, type Lang } from "./i18n";
import { composableOf } from "./tokens";
import type { Doc, Item, Platform, Screen } from "./types";
import { BACK_TARGET, SWIPE_DIRS, frameSize } from "./types";

const STACK: Record<Platform, Record<Lang, string>> = {
  cmp: {
    zh: "用 Compose Multiplatform 实现，依赖 top.yukonga.miuix.kmp 的 miuix-ui、miuix-preference、miuix-icons、miuix-nav。根节点包在 MiuixTheme 里。",
    en: "Implement with Compose Multiplatform using top.yukonga.miuix.kmp miuix-ui, miuix-preference, miuix-icons and miuix-nav. Wrap the root in MiuixTheme.",
    ja: "Compose Multiplatform で実装する。依存は top.yukonga.miuix.kmp の miuix-ui、miuix-preference、miuix-icons、miuix-nav。ルートを MiuixTheme で包む。",
    ko: "Compose Multiplatform으로 구현한다. top.yukonga.miuix.kmp의 miuix-ui, miuix-preference, miuix-icons, miuix-nav에 의존한다. 루트를 MiuixTheme으로 감싼다.",
  },
  android: {
    zh: "用 Jetpack Compose（Android）实现，依赖 top.yukonga.miuix.kmp 的 miuix-ui、miuix-preference、miuix-icons。根节点包在 MiuixTheme 里。",
    en: "Implement with Jetpack Compose on Android using top.yukonga.miuix.kmp miuix-ui, miuix-preference and miuix-icons. Wrap the root in MiuixTheme.",
    ja: "Jetpack Compose（Android）で実装する。依存は top.yukonga.miuix.kmp の miuix-ui、miuix-preference、miuix-icons。ルートを MiuixTheme で包む。",
    ko: "Jetpack Compose(Android)로 구현한다. top.yukonga.miuix.kmp의 miuix-ui, miuix-preference, miuix-icons에 의존한다. 루트를 MiuixTheme으로 감싼다.",
  },
  web: {
    zh: "用 Compose Multiplatform 的 Web（Wasm/JS）目标实现，依赖 top.yukonga.miuix.kmp 的 miuix-ui、miuix-preference、miuix-icons。根节点包在 MiuixTheme 里。",
    en: "Implement with Compose Multiplatform for Web (Wasm/JS) using top.yukonga.miuix.kmp miuix-ui, miuix-preference and miuix-icons. Wrap the root in MiuixTheme.",
    ja: "Compose Multiplatform の Web（Wasm/JS）向けに実装する。依存は top.yukonga.miuix.kmp の miuix-ui、miuix-preference、miuix-icons。ルートを MiuixTheme で包む。",
    ko: "Compose Multiplatform Web(Wasm/JS)으로 구현한다. top.yukonga.miuix.kmp의 miuix-ui, miuix-preference, miuix-icons에 의존한다. 루트를 MiuixTheme으로 감싼다.",
  },
};

const cjk = (lang: Lang) => lang === "zh" || lang === "ja";
const q = (s: string, lang: Lang) => (cjk(lang) ? `「${s}」` : `“${s}”`);
const sep = (lang: Lang) => (cjk(lang) ? "，" : ", ");
const colon = (lang: Lang) => (cjk(lang) ? "：" : ": ");

function themeLine(doc: Doc, lang: Lang): string {
  const seed = doc.theme.seed;
  const hex = seed.replace("#", "");
  const mode = {
    zh: doc.theme.mode === "dark" ? "深色" : "浅色",
    en: doc.theme.mode === "dark" ? "dark" : "light",
    ja: doc.theme.mode === "dark" ? "ダーク" : "ライト",
    ko: doc.theme.mode === "dark" ? "다크" : "라이트",
  }[lang];
  const monet = doc.theme.monet
    ? `ThemeController(ColorSchemeMode.MonetSystem, keyColor = Color(0xFF${hex}))`
    : "lightColorScheme() / darkColorScheme()";
  if (lang === "zh") {
    return `主题：${mode}，种子色 ${seed}，用 ${monet}。背景用 surface（浅色约 #F7F7F7），卡片与 Preference 用 surfaceContainer。主色给 Button / Switch / Slider。圆角用 Miuix 默认 16.dp squircle（miuix-squircle）。`;
  }
  if (lang === "ja") {
    return `テーマ：${mode}、シード色 ${seed}、${monet} を使う。背景は surface（ライト時は約 #F7F7F7）。カードと Preference は surfaceContainer。主色は Button / Switch / Slider。角は Miuix 既定の 16.dp squircle（miuix-squircle）。`;
  }
  if (lang === "ko") {
    return `테마: ${mode}, 시드 색 ${seed}, ${monet}를 쓴다. 배경은 surface(라이트는 약 #F7F7F7). 카드와 Preference는 surfaceContainer. 주색은 Button / Switch / Slider. 모서리는 Miuix 기본 16.dp squircle(miuix-squircle).`;
  }
  return `Theme: ${mode}, seed ${seed}, using ${monet}. Background is surface (~#F7F7F7 in light). Cards and preferences sit on surfaceContainer. Primary tints Button, Switch and Slider. Use Miuix 16.dp squircle corners (miuix-squircle).`;
}

function destName(doc: Doc, to: string | undefined, lang: Lang): string {
  if (!to) return "";
  if (to === BACK_TARGET) {
    return { zh: "返回上一屏", en: "go back", ja: "前の画面に戻る", ko: "이전 화면으로" }[lang];
  }
  const name = doc.screens.find((s) => s.id === to)?.name;
  return name ? { zh: `打开${q(name, lang)}`, en: `open ${q(name, lang)}`, ja: `${q(name, lang)}を開く`, ko: `${q(name, lang)} 열기` }[lang] : "";
}

function describeItem(doc: Doc, it: Item, lang: Lang): string {
  const kind = KIND_TEXT[lang][it.kind];
  const api = composableOf(it);
  const bits: string[] = [
    { zh: `组件 ${api}`, en: `composable ${api}`, ja: `コンポーネント ${api}`, ko: `컴포저블 ${api}` }[lang],
  ];
  if (it.label.trim()) bits.push({ zh: `标题${q(it.label, lang)}`, en: `title ${q(it.label, lang)}`, ja: `タイトル${q(it.label, lang)}`, ko: `제목 ${q(it.label, lang)}` }[lang]);
  if (it.supporting?.trim()) bits.push({ zh: `摘要${q(it.supporting, lang)}`, en: `summary ${q(it.supporting, lang)}`, ja: `要約${q(it.supporting, lang)}`, ko: `요약 ${q(it.supporting, lang)}` }[lang]);
  if (it.icon) bits.push({ zh: `图标 ${it.icon}`, en: `icon ${it.icon}`, ja: `アイコン ${it.icon}`, ko: `아이콘 ${it.icon}` }[lang]);
  if (it.variant) bits.push({ zh: `样式 ${it.variant}`, en: `${it.variant} style`, ja: `スタイル ${it.variant}`, ko: `스타일 ${it.variant}` }[lang]);
  if (typeof it.checked === "boolean" && (it.kind.includes("switch") || it.kind.includes("checkbox") || it.kind.includes("radio"))) {
    bits.push(it.checked
      ? { zh: "默认开启", en: "on by default", ja: "初期値はオン", ko: "기본 켜짐" }[lang]
      : { zh: "默认关闭", en: "off by default", ja: "初期値はオフ", ko: "기본 꺼짐" }[lang]);
  }
  if (typeof it.value === "number" && (it.kind === "slider" || it.kind === "rangeSlider" || it.kind === "sliderPref" || it.kind === "rangeSliderPref" || it.kind === "progress")) {
    const start = typeof it.from === "number" ? `${Math.round(it.from * 100)}%–` : "";
    bits.push({ zh: `值 ${start}${Math.round(it.value * 100)}%`, en: `value ${start}${Math.round(it.value * 100)}%`, ja: `値 ${start}${Math.round(it.value * 100)}%`, ko: `값 ${start}${Math.round(it.value * 100)}%` }[lang]);
  }
  if (it.kind === "floatingNav" && it.variant === "glass") {
    bits.push({ zh: "用 Modifier.textureBlur / layerBackdrop 做液态玻璃底栏", en: "liquid-glass bar via Modifier.textureBlur / layerBackdrop", ja: "Modifier.textureBlur / layerBackdrop でリキッドガラス下バー", ko: "Modifier.textureBlur / layerBackdrop로 리퀴드 글래스 하단바" }[lang]);
  }
  if (it.kind === "navigationBar" && it.variant === "blur") {
    bits.push({ zh: "底栏用 Modifier.textureBlur", en: "frost the bar with Modifier.textureBlur", ja: "下バーは Modifier.textureBlur", ko: "하단바는 Modifier.textureBlur" }[lang]);
  }
  if (it.tabs?.length) {
    const names = it.tabs.map((tab) => {
      const dest = destName(doc, tab.to, lang);
      return dest ? `${tab.label || tab.icon}→${dest}` : tab.label || tab.icon;
    }).join(cjk(lang) ? "、" : ", ");
    bits.push({ zh: `目的地：${names}`, en: `destinations: ${names}`, ja: `行き先：${names}`, ko: `목적지: ${names}` }[lang]);
  }
  const dest = destName(doc, it.to, lang);
  if (dest) {
    const tr = it.transition && it.transition !== "none" ? TRANSITION_TEXT[lang][it.transition] : "";
    bits.push(tr ? `${dest}（${tr}）` : dest);
  }
  if (it.note?.trim()) bits.push(it.note.trim());
  return `- ${kind}${colon(lang)}${bits.join(sep(lang))}`;
}

function describeScreen(doc: Doc, screen: Screen, lang: Lang): string {
  const { w, h } = frameSize(screen.preset);
  const size = screen.preset === "desktop"
    ? { zh: `桌面 ${w}×${h}dp，宽屏用 NavigationRail`, en: `desktop ${w}×${h}dp, use NavigationRail`, ja: `デスクトップ ${w}×${h}dp、幅が広いときは NavigationRail`, ko: `데스크톱 ${w}×${h}dp, 넓은 폭은 NavigationRail` }[lang]
    : { zh: `手机 ${w}×${h}dp`, en: `phone ${w}×${h}dp`, ja: `スマホ ${w}×${h}dp`, ko: `휴대폰 ${w}×${h}dp` }[lang];
  const head = { zh: `## 屏幕${q(screen.name, lang)}（${size}）`, en: `## Screen ${q(screen.name, lang)} (${size})`, ja: `## 画面${q(screen.name, lang)}（${size}）`, ko: `## 화면 ${q(screen.name, lang)} (${size})` }[lang];
  const note = screen.note?.trim() ? `\n${screen.note.trim()}` : "";
  const swipes = SWIPE_DIRS.map((dir) => {
    const dest = destName(doc, screen.swipe?.[dir], lang);
    return dest ? `${SWIPE_TEXT[lang][dir]}${colon(lang)}${dest}` : "";
  }).filter(Boolean);
  const swipeLine = swipes.length ? `\n${swipes.join(cjk(lang) ? "；" : "; ")}` : "";
  const sorted = [...screen.items].sort((a, b) => a.y - b.y || a.x - b.x);
  return `${head}${note}${swipeLine}\n${sorted.map((it) => describeItem(doc, it, lang)).join("\n")}`;
}

export function buildPrompt(doc: Doc, lang: Lang, onlyScreenId?: string): string {
  const screens = onlyScreenId ? doc.screens.filter((s) => s.id === onlyScreenId) : doc.screens;
  const title = doc.title.trim() || { zh: "未命名应用", en: "Untitled app", ja: "名称未設定のアプリ", ko: "이름 없는 앱" }[lang];
  const intro = {
    zh: `做一款名为${q(title, lang)}的应用。${STACK[doc.platform][lang]}界面必须使用 Miuix（https://github.com/compose-miuix-ui/miuix）组件，不要用 Material 3。HyperOS 风格：灰底白卡片、16.dp 超椭圆圆角、设置项用 Preference 并放在 Card 里分组。`,
    en: `Build an app named ${q(title, lang)}. ${STACK[doc.platform][lang]} The UI must use Miuix (https://github.com/compose-miuix-ui/miuix) components, not Material 3. HyperOS look: gray background, white cards, 16.dp squircle corners, settings rows as Preference items grouped in Card.`,
    ja: `${q(title, lang)}というアプリを作る。${STACK[doc.platform][lang]}画面は必ず Miuix（https://github.com/compose-miuix-ui/miuix）コンポーネントを使い、Material 3 は使わない。HyperOS 風：グレー背景、白いカード、16.dp の超楕円角、設定行は Preference を Card でグループ化する。`,
    ko: `${q(title, lang)} 앱을 만든다. ${STACK[doc.platform][lang]} UI는 반드시 Miuix(https://github.com/compose-miuix-ui/miuix) 컴포넌트를 쓰고 Material 3는 쓰지 않는다. HyperOS 스타일: 회색 배경, 흰 카드, 16.dp 스쿼클 모서리, 설정 행은 Preference를 Card로 묶는다.`,
  }[lang];

  const nav = {
    zh: "用 Scaffold + TopAppBar / NavigationBar（桌面宽度改 NavigationRail）。对话框用 OverlayDialog 或 WindowDialog，底栏用 OverlayBottomSheet 或 WindowBottomSheet。悬浮底栏用 FloatingNavigationBar。屏幕之间用 miuix-nav 或普通导航；标明返回的走返回栈。",
    en: "Use Scaffold with TopAppBar / NavigationBar (NavigationRail on desktop widths). Dialogs are OverlayDialog or WindowDialog, sheets are OverlayBottomSheet or WindowBottomSheet. Floating bottom nav is FloatingNavigationBar. Navigate with miuix-nav or a regular back stack.",
    ja: "Scaffold + TopAppBar / NavigationBar（デスクトップ幅では NavigationRail）。ダイアログは OverlayDialog または WindowDialog、シートは OverlayBottomSheet または WindowBottomSheet。フローティング下ナビは FloatingNavigationBar。画面遷移は miuix-nav か通常のバックスタック。",
    ko: "Scaffold + TopAppBar / NavigationBar(데스크톱 폭은 NavigationRail). 대화상자는 OverlayDialog 또는 WindowDialog, 시트는 OverlayBottomSheet 또는 WindowBottomSheet. 플로팅 하단 탐색은 FloatingNavigationBar. 화면 이동은 miuix-nav 또는 일반 백 스택.",
  }[lang];

  const footer = {
    zh: `实现提示：相邻 Preference 合成一组 Card（首尾圆角 16.dp，中间无缝）。列表垂直排列，左右边距 16.dp。保持 Miuix 默认间距与排版。目标平台：${PLATFORM_TEXT[lang][doc.platform]}。`,
    en: `Implementation notes: adjacent Preference rows share one Card (16.dp on the outer corners). Vertical list, 16.dp side margins. Keep Miuix default spacing and type. Target: ${PLATFORM_TEXT[lang][doc.platform]}.`,
    ja: `実装メモ：隣り合う Preference は 1 枚の Card にまとめる（外側の角だけ 16.dp）。縦リスト、左右余白 16.dp。Miuix の既定スペースと書体を保つ。実装先：${PLATFORM_TEXT[lang][doc.platform]}。`,
    ko: `구현 메모: 인접 Preference는 하나의 Card로 묶는다(바깥 모서리만 16.dp). 세로 목록, 좌우 여백 16.dp. Miuix 기본 간격과 서체를 유지한다. 대상: ${PLATFORM_TEXT[lang][doc.platform]}.`,
  }[lang];

  return [intro, themeLine(doc, lang), nav, screens.map((s) => describeScreen(doc, s, lang)).join("\n\n"), footer].join("\n\n");
}

export function effectivePrompt(doc: Doc, lang: Lang, onlyScreenId?: string) {
  return buildPrompt(doc, lang, onlyScreenId);
}
