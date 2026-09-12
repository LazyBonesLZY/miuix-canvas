import { KIND_TEXT, PLATFORM_TEXT, SWIPE_TEXT, TRANSITION_TEXT, type Lang } from "./i18n";
import { KIND_SPEC } from "./tokens";
import type { Doc, Item, Platform, Screen } from "./types";
import { BACK_TARGET, SWIPE_DIRS, frameSize } from "./types";

const STACK: Record<Platform, Record<Lang, string>> = {
  cmp: {
    zh: "用 Compose Multiplatform 实现，依赖 top.yukonga.miuix.kmp 的 miuix-ui、miuix-preference、miuix-icons、miuix-nav。根节点包在 MiuixTheme 里。",
    en: "Implement with Compose Multiplatform using top.yukonga.miuix.kmp miuix-ui, miuix-preference, miuix-icons and miuix-nav. Wrap the root in MiuixTheme.",
  },
  android: {
    zh: "用 Jetpack Compose（Android）实现，依赖 top.yukonga.miuix.kmp 的 miuix-ui、miuix-preference、miuix-icons。根节点包在 MiuixTheme 里。",
    en: "Implement with Jetpack Compose on Android using top.yukonga.miuix.kmp miuix-ui, miuix-preference and miuix-icons. Wrap the root in MiuixTheme.",
  },
  web: {
    zh: "用 Compose Multiplatform 的 Web（Wasm/JS）目标实现，依赖 top.yukonga.miuix.kmp 的 miuix-ui、miuix-preference、miuix-icons。根节点包在 MiuixTheme 里。",
    en: "Implement with Compose Multiplatform for Web (Wasm/JS) using top.yukonga.miuix.kmp miuix-ui, miuix-preference and miuix-icons. Wrap the root in MiuixTheme.",
  },
};

function themeLine(doc: Doc, lang: Lang): string {
  const seed = doc.theme.seed;
  const hex = seed.replace("#", "");
  const mode = doc.theme.mode === "dark" ? (lang === "zh" ? "深色" : "dark") : lang === "zh" ? "浅色" : "light";
  if (lang === "zh") {
    return `主题：${mode}，种子色 ${seed}${doc.theme.monet ? `，用 ThemeController(ColorSchemeMode.MonetSystem, keyColor = Color(0xFF${hex}))` : "，用 lightColorScheme() / darkColorScheme()"}。背景用 surface（浅色约 #F7F7F7），卡片与 Preference 用 surfaceContainer。主色给 Button / Switch / Slider。圆角用 Miuix 默认 16.dp squircle（miuix-squircle）。`;
  }
  return `Theme: ${mode}, seed ${seed}${doc.theme.monet ? `, with ThemeController(ColorSchemeMode.MonetSystem, keyColor = Color(0xFF${hex}))` : ", using lightColorScheme() / darkColorScheme()"}. Background is surface (~#F7F7F7 in light). Cards and preferences sit on surfaceContainer. Primary tints Button, Switch and Slider. Use Miuix 16.dp squircle corners (miuix-squircle).`;
}

function destName(doc: Doc, to: string | undefined, lang: Lang): string {
  if (!to) return "";
  if (to === BACK_TARGET) return lang === "zh" ? "返回上一屏" : "go back";
  const name = doc.screens.find((s) => s.id === to)?.name;
  return name ? (lang === "zh" ? `打开「${name}」` : `open “${name}”`) : "";
}

function describeItem(doc: Doc, it: Item, lang: Lang): string {
  const kind = KIND_TEXT[lang][it.kind];
  const api = KIND_SPEC[it.kind].composable;
  const bits: string[] = [lang === "zh" ? `组件 ${api}` : `composable ${api}`];
  if (it.label.trim()) bits.push(lang === "zh" ? `标题「${it.label}」` : `title “${it.label}”`);
  if (it.supporting?.trim()) bits.push(lang === "zh" ? `摘要「${it.supporting}」` : `summary “${it.supporting}”`);
  if (it.icon) bits.push(lang === "zh" ? `图标 ${it.icon}` : `icon ${it.icon}`);
  if (it.variant && it.variant !== KIND_SPEC[it.kind].variants?.[0]) {
    bits.push(lang === "zh" ? `样式 ${it.variant}` : `${it.variant} style`);
  }
  if (typeof it.checked === "boolean" && (it.kind.includes("switch") || it.kind.includes("checkbox") || it.kind.includes("radio"))) {
    bits.push(it.checked ? (lang === "zh" ? "默认开启" : "on by default") : lang === "zh" ? "默认关闭" : "off by default");
  }
  if (typeof it.value === "number" && (it.kind === "slider" || it.kind === "sliderPref" || it.kind === "progress")) {
    bits.push(lang === "zh" ? `值 ${Math.round(it.value * 100)}%` : `value ${Math.round(it.value * 100)}%`);
  }
  if (it.tabs?.length) {
    const names = it.tabs.map((tab) => {
      const dest = destName(doc, tab.to, lang);
      return dest ? `${tab.label || tab.icon}→${dest}` : tab.label || tab.icon;
    }).join(lang === "zh" ? "、" : ", ");
    bits.push(lang === "zh" ? `目的地：${names}` : `destinations: ${names}`);
  }
  const dest = destName(doc, it.to, lang);
  if (dest) {
    const tr = it.transition && it.transition !== "none" ? TRANSITION_TEXT[lang][it.transition] : "";
    bits.push(tr ? `${dest}（${tr}）` : dest);
  }
  if (it.note?.trim()) bits.push(it.note.trim());
  return lang === "zh" ? `- ${kind}：${bits.join("，")}` : `- ${kind}: ${bits.join(", ")}`;
}

function describeScreen(doc: Doc, screen: Screen, lang: Lang): string {
  const { w, h } = frameSize(screen.preset);
  const size = screen.preset === "desktop"
    ? (lang === "zh" ? `桌面 ${w}×${h}dp，宽屏用 NavigationRail` : `desktop ${w}×${h}dp, use NavigationRail`)
    : (lang === "zh" ? `手机 ${w}×${h}dp` : `phone ${w}×${h}dp`);
  const head = lang === "zh" ? `## 屏幕「${screen.name}」（${size}）` : `## Screen “${screen.name}” (${size})`;
  const note = screen.note?.trim() ? `\n${screen.note.trim()}` : "";
  const swipes = SWIPE_DIRS.map((dir) => {
    const dest = destName(doc, screen.swipe?.[dir], lang);
    return dest ? (lang === "zh" ? `${SWIPE_TEXT[lang][dir]}：${dest}` : `${SWIPE_TEXT[lang][dir]}: ${dest}`) : "";
  }).filter(Boolean);
  const swipeLine = swipes.length ? `\n${swipes.join(lang === "zh" ? "；" : "; ")}` : "";
  const sorted = [...screen.items].sort((a, b) => a.y - b.y || a.x - b.x);
  return `${head}${note}${swipeLine}\n${sorted.map((it) => describeItem(doc, it, lang)).join("\n")}`;
}

export function buildPrompt(doc: Doc, lang: Lang, onlyScreenId?: string): string {
  const screens = onlyScreenId ? doc.screens.filter((s) => s.id === onlyScreenId) : doc.screens;
  const title = doc.title.trim() || (lang === "zh" ? "未命名应用" : "Untitled app");
  const intro = lang === "zh"
    ? `做一款名为「${title}」的应用。${STACK[doc.platform][lang]}界面必须使用 Miuix（https://github.com/compose-miuix-ui/miuix）组件，不要用 Material 3。HyperOS 风格：灰底白卡片、16.dp 超椭圆圆角、设置项用 Preference 并放在 Card 里分组。`
    : `Build an app named “${title}”. ${STACK[doc.platform][lang]} The UI must use Miuix (https://github.com/compose-miuix-ui/miuix) components, not Material 3. HyperOS look: gray background, white cards, 16.dp squircle corners, settings rows as Preference items grouped in Card.`;

  const nav = lang === "zh"
    ? "用 Scaffold + TopAppBar / NavigationBar（桌面宽度改 NavigationRail）。对话框用 OverlayDialog，底栏用 OverlayBottomSheet。屏幕之间用 miuix-nav 或普通导航；标明返回的走返回栈。"
    : "Use Scaffold with TopAppBar / NavigationBar (NavigationRail on desktop widths). Dialogs are OverlayDialog, sheets are OverlayBottomSheet. Navigate with miuix-nav or a regular back stack.";

  const footer = lang === "zh"
    ? `实现提示：相邻 Preference 合成一组 Card（首尾圆角 16.dp，中间无缝）。列表垂直排列，左右边距 16.dp。保持 Miuix 默认间距与排版。目标平台：${PLATFORM_TEXT[lang][doc.platform]}。`
    : `Implementation notes: adjacent Preference rows share one Card (16.dp on the outer corners). Vertical list, 16.dp side margins. Keep Miuix default spacing and type. Target: ${PLATFORM_TEXT[lang][doc.platform]}.`;

  return [intro, themeLine(doc, lang), nav, screens.map((s) => describeScreen(doc, s, lang)).join("\n\n"), footer].join("\n\n");
}

export function effectivePrompt(doc: Doc, lang: Lang, onlyScreenId?: string) {
  return buildPrompt(doc, lang, onlyScreenId);
}
