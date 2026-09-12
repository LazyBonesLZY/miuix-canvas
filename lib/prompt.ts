import { schemeFromSeed } from "./color";
import { KIND_TEXT, PLATFORM_TEXT, SWIPE_TEXT, TRANSITION_TEXT, variantLabel, type Lang } from "./i18n";
import { composableOf } from "./tokens";
import type { Doc, Item, Kind, Platform, Screen } from "./types";
import { BACK_TARGET, SWIPE_DIRS, frameSize } from "./types";

const STACK: Record<Platform, Record<Lang, string>> = {
  cmp: {
    zh: "实现目标是 Compose Multiplatform 应用，依赖 top.yukonga.miuix.kmp 的 miuix-ui、miuix-preference、miuix-icons、miuix-nav、miuix-blur。根节点包在 MiuixTheme 里。",
    en: "Build it as a Compose Multiplatform app using top.yukonga.miuix.kmp miuix-ui, miuix-preference, miuix-icons, miuix-nav and miuix-blur. Wrap the root in MiuixTheme.",
    ja: "実装先は Compose Multiplatform。依存は top.yukonga.miuix.kmp の miuix-ui、miuix-preference、miuix-icons、miuix-nav、miuix-blur。ルートを MiuixTheme で包む。",
    ko: "Compose Multiplatform 앱으로 구현한다. top.yukonga.miuix.kmp의 miuix-ui, miuix-preference, miuix-icons, miuix-nav, miuix-blur에 의존하고 루트를 MiuixTheme으로 감싼다.",
  },
  android: {
    zh: "实现目标是 Android 原生应用，用 Jetpack Compose，依赖 top.yukonga.miuix.kmp 的 miuix-ui、miuix-preference、miuix-icons、miuix-blur。根节点包在 MiuixTheme 里。",
    en: "Build it as a native Android app with Jetpack Compose using top.yukonga.miuix.kmp miuix-ui, miuix-preference, miuix-icons and miuix-blur. Wrap the root in MiuixTheme.",
    ja: "実装先は Android ネイティブ。Jetpack Compose で、依存は top.yukonga.miuix.kmp の miuix-ui、miuix-preference、miuix-icons、miuix-blur。ルートを MiuixTheme で包む。",
    ko: "Android 네이티브 앱으로 구현한다. Jetpack Compose와 top.yukonga.miuix.kmp의 miuix-ui, miuix-preference, miuix-icons, miuix-blur를 쓰고 루트를 MiuixTheme으로 감싼다.",
  },
  web: {
    zh: "实现目标是在浏览器里运行的 Compose Multiplatform Web（Wasm/JS）应用，依赖 top.yukonga.miuix.kmp 的 miuix-ui、miuix-preference、miuix-icons、miuix-blur。根节点包在 MiuixTheme 里。",
    en: "Build it as a Compose Multiplatform Web (Wasm/JS) app using top.yukonga.miuix.kmp miuix-ui, miuix-preference, miuix-icons and miuix-blur. Wrap the root in MiuixTheme.",
    ja: "実装先はブラウザで動く Compose Multiplatform Web（Wasm/JS）。依存は top.yukonga.miuix.kmp の miuix-ui、miuix-preference、miuix-icons、miuix-blur。ルートを MiuixTheme で包む。",
    ko: "브라우저에서 실행되는 Compose Multiplatform Web(Wasm/JS) 앱으로 구현한다. top.yukonga.miuix.kmp의 miuix-ui, miuix-preference, miuix-icons, miuix-blur를 쓰고 루트를 MiuixTheme으로 감싼다.",
  },
};

const cjk = (lang: Lang) => lang === "zh" || lang === "ja";
const q = (s: string, lang: Lang) => (cjk(lang) ? `「${s}」` : `“${s}”`);
const sep = (lang: Lang) => (cjk(lang) ? "，" : ", ");
const colon = (lang: Lang) => (cjk(lang) ? "：" : ": ");
const trimEnd = (s: string) => s.trim().replace(/[。.\s]+$/, "");

function themeController(doc: Doc): string {
  const hex = doc.theme.seed.replace("#", "");
  if (doc.theme.monet) {
    return `MiuixTheme(controller = ThemeController(ColorSchemeMode.${doc.theme.mode === "dark" ? "MonetDark" : "MonetLight"}, keyColor = Color(0xFF${hex})))`;
  }
  return `MiuixTheme(controller = ThemeController(ColorSchemeMode.${doc.theme.mode === "dark" ? "Dark" : "Light"}))`;
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
  if (it.variant) {
    bits.push({ zh: `样式 ${variantLabel(it.variant, lang)}`, en: `${variantLabel(it.variant, lang)} style`, ja: `スタイル ${variantLabel(it.variant, lang)}`, ko: `스타일 ${variantLabel(it.variant, lang)}` }[lang]);
  }
  if (typeof it.checked === "boolean" && (it.kind.includes("switch") || it.kind.includes("checkbox") || it.kind.includes("radio"))) {
    bits.push(it.checked
      ? { zh: "默认开启", en: "on by default", ja: "初期値はオン", ko: "기본 켜짐" }[lang]
      : { zh: "默认关闭", en: "off by default", ja: "初期値はオフ", ko: "기본 꺼짐" }[lang]);
  }
  if (typeof it.value === "number" && (it.kind === "slider" || it.kind === "rangeSlider" || it.kind === "sliderPref" || it.kind === "rangeSliderPref" || it.kind === "progress")) {
    const start = typeof it.from === "number" ? `${Math.round(it.from * 100)}%–` : "";
    bits.push({ zh: `值 ${start}${Math.round(it.value * 100)}%`, en: `value ${start}${Math.round(it.value * 100)}%`, ja: `値 ${start}${Math.round(it.value * 100)}%`, ko: `값 ${start}${Math.round(it.value * 100)}%` }[lang]);
  }
  if (it.kind === "button" && it.variant === "text") {
    bits.push({ zh: "TextButton：secondaryVariant 底，onSecondaryVariant 字", en: "TextButton: secondaryVariant fill, onSecondaryVariant label", ja: "TextButton：secondaryVariant 背景、onSecondaryVariant 文字", ko: "TextButton: secondaryVariant 배경, onSecondaryVariant 글자" }[lang]);
  }
  if (it.kind === "button" && it.variant === "primary") {
    bits.push({ zh: "用 ButtonDefaults.buttonColorsPrimary()", en: "use ButtonDefaults.buttonColorsPrimary()", ja: "ButtonDefaults.buttonColorsPrimary() を使う", ko: "ButtonDefaults.buttonColorsPrimary()를 쓴다" }[lang]);
  }
  if (it.kind === "searchBar") {
    bits.push({ zh: "SearchBar 需配合 InputField", en: "SearchBar needs an InputField child", ja: "SearchBar は InputField を子に", ko: "SearchBar는 InputField 자식이 필요" }[lang]);
  }
  if (it.kind === "image") {
    bits.push({ zh: "用 Compose 的 Image / Coil，没有 Miuix Image 组件", en: "use Compose Image / Coil; there is no Miuix Image composable", ja: "Compose の Image / Coil を使う。Miuix の Image コンポーネントはない", ko: "Compose Image / Coil을 쓴다. Miuix Image 컴포저블은 없다" }[lang]);
  }
  if (it.kind === "blur") {
    bits.push({ zh: "这是 Modifier.textureBlur（miuix-blur），不是独立组件", en: "this is Modifier.textureBlur from miuix-blur, not a composable", ja: "これは Modifier.textureBlur（miuix-blur）でありコンポーネントではない", ko: "독립 컴포저블이 아니라 miuix-blur의 Modifier.textureBlur" }[lang]);
  }
  if (it.kind !== "blur" && it.effect && it.effect !== "none") {
    const radius = it.blurRadius ?? 20;
    const direction = it.effect === "progressiveTextureBlur" ? `, gradient = ProgressiveBlur.${(it.effectDirection ?? "top")[0].toUpperCase()}${(it.effectDirection ?? "top").slice(1)}` : "";
    bits.push({ zh: `应用 Modifier.${it.effect}(blurRadius = ${radius}f${direction})，背景先接 layerBackdrop`, en: `apply Modifier.${it.effect}(blurRadius = ${radius}f${direction}) after layerBackdrop`, ja: `layerBackdrop の上で Modifier.${it.effect}(blurRadius = ${radius}f${direction})`, ko: `layerBackdrop 후 Modifier.${it.effect}(blurRadius = ${radius}f${direction}) 적용` }[lang]);
  }
  if (api.startsWith("Overlay")) {
    bits.push({ zh: "须在 Scaffold 内", en: "must live inside Scaffold", ja: "Scaffold 内に置く", ko: "Scaffold 안에 둔다" }[lang]);
  }
  if (typeof it.selected === "number" && it.tabs?.length) {
    const name = it.tabs[it.selected]?.label;
    bits.push({ zh: `选中第 ${it.selected + 1} 项${name ? q(name, lang) : ""}`, en: `selected item ${it.selected + 1}${name ? ` ${q(name, lang)}` : ""}`, ja: `選択は ${it.selected + 1} 番目${name ? q(name, lang) : ""}`, ko: `${it.selected + 1}번째 선택${name ? ` ${q(name, lang)}` : ""}` }[lang]);
  }
  if (it.tabs?.length) {
    const names = it.tabs.map((tab) => tab.label || tab.icon).filter(Boolean).join(cjk(lang) ? "、" : ", ");
    const list = it.kind === "dropdown" || it.kind === "dropdownPref" || it.kind === "spinnerPref"
      ? { zh: "选项", en: "options", ja: "選択肢", ko: "옵션" }[lang]
      : it.kind === "listPopup" || it.kind === "dropdownMenu" || it.kind === "iconDropdownMenu" || it.kind === "iconCascadingMenu" || it.kind === "cascadingPopup" || it.kind === "bottomSheet"
        ? { zh: "菜单项", en: "menu items", ja: "メニュー項目", ko: "메뉴 항목" }[lang]
        : it.kind === "navigationBar" || it.kind === "floatingNav" || it.kind === "navigationRail"
          ? { zh: "目的地", en: "destinations", ja: "行き先", ko: "목적지" }[lang]
          : { zh: "标签", en: "tabs", ja: "タブ", ko: "탭" }[lang];
    bits.push(`${list}${colon(lang)}${names}`);
  }
  return `- ${kind}${colon(lang)}${bits.join(sep(lang))}`;
}

function describeScreen(doc: Doc, screen: Screen, lang: Lang): string {
  const { w, h } = frameSize(screen.preset);
  const size = screen.preset === "desktop"
    ? { zh: `桌面 ${w}×${h}dp，宽屏用 NavigationRail`, en: `desktop ${w}×${h}dp, use NavigationRail`, ja: `デスクトップ ${w}×${h}dp、幅が広いときは NavigationRail`, ko: `데스크톱 ${w}×${h}dp, 넓은 폭은 NavigationRail` }[lang]
    : { zh: `手机 ${w}×${h}dp`, en: `phone ${w}×${h}dp`, ja: `スマホ ${w}×${h}dp`, ko: `휴대폰 ${w}×${h}dp` }[lang];
  const head = { zh: `屏幕${q(screen.name, lang)}（${size}）从上到下依次如下：`, en: `Screen ${q(screen.name, lang)} (${size}), from top to bottom:`, ja: `画面${q(screen.name, lang)}（${size}）は上から順に次の通りです。`, ko: `화면 ${q(screen.name, lang)} (${size}) 위에서부터:` }[lang];
  const note = screen.note?.trim() ? `\n${trimEnd(screen.note)}` : "";
  const sorted = [...screen.items].sort((a, b) => a.y - b.y || a.x - b.x);
  const body = sorted.length
    ? sorted.map((it) => describeItem(doc, it, lang)).join("\n")
    : { zh: "（还没有放置组件）", en: "(nothing placed yet)", ja: "（まだ部品がない）", ko: "(아직 부품 없음)" }[lang];
  return `${head}${note}\n${body}`;
}

function behaviorNotes(doc: Doc, screens: Screen[], lang: Lang): string[] {
  const notes: string[] = [];
  for (const screen of screens) {
    for (const dir of SWIPE_DIRS) {
      const dest = destName(doc, screen.swipe?.[dir], lang);
      if (dest) notes.push(`${q(screen.name, lang)}${colon(lang)}${SWIPE_TEXT[lang][dir]}${colon(lang)}${dest}`);
    }
    for (const it of screen.items) {
      const dest = destName(doc, it.to, lang);
      if (dest) {
        const tr = it.transition && it.transition !== "none" ? TRANSITION_TEXT[lang][it.transition] : "";
        const who = it.label.trim() || KIND_TEXT[lang][it.kind];
        notes.push(tr ? `${q(who, lang)} → ${dest}（${tr}）` : `${q(who, lang)} → ${dest}`);
      }
      for (const tab of it.tabs ?? []) {
        const tabDest = destName(doc, tab.to, lang);
        if (!tabDest) continue;
        const tr = tab.transition && tab.transition !== "none" ? TRANSITION_TEXT[lang][tab.transition] : "";
        const who = tab.label || tab.icon || KIND_TEXT[lang][it.kind];
        notes.push(tr ? `${q(who, lang)} → ${tabDest}（${tr}）` : `${q(who, lang)} → ${tabDest}`);
      }
      if (it.note?.trim()) notes.push(`${it.label.trim() || KIND_TEXT[lang][it.kind]}${colon(lang)}${trimEnd(it.note)}`);
    }
  }
  return notes;
}

const STYLE_NOTES: Record<Lang, Partial<Record<Kind, string>>> = {
  zh: {
    button: "Button：高 50.dp，圆角 16.dp squircle。主按钮用 ButtonDefaults.buttonColorsPrimary()。TextButton 用 secondaryVariant 底和 onSecondaryVariant 字，不要做成 Material 透明文字按钮。",
    topAppBar: "顶栏：SmallTopAppBar / TopAppBar，高约 72.dp，背景 surface，左右 IconButton 48.dp。",
    smallTitle: "SmallTitle：分组小标题，高 40.dp，左右 16.dp。",
    navigationBar: "NavigationBar：高 64.dp，底色 surface，顶部分割线，未选中 alpha 0.4。可用 IconAndText / IconOnly / IconWithSelectedLabel。",
    floatingNav: "FloatingNavigationBar：默认只显示图标，圆角 50.dp。iosLike 用官方 example 的 IosLiquidGlassNavigationBar（layerBackdrop + vibrancy）。",
    navigationRail: "宽屏用 NavigationRail，不要用手机底栏硬拉宽。",
    tabRow: "TabRow 未选中带 1.dp outline，选中是滑动 surfaceContainer 指示条。TabRowWithContour 是 8.dp 轮廓胶囊。",
    searchBar: "SearchBar 必须配合 InputField，占位符 onSurfaceContainerHigh。",
    card: "Card：16.dp squircle，padding 16.dp，背景 surfaceContainer。标题约 19.sp，摘要 17.sp。",
    snackbar: "Snackbar 动作是主色胶囊 TextButton。",
    dialog: "OverlayDialog / OverlayBottomSheet / Overlay* 必须放在 Scaffold 内；Window* 版不需要。",
    bottomSheet: "OverlayBottomSheet 必须放在 Scaffold 内。",
    textField: "TextField 用 Miuix 默认样式，不要换成 Material OutlinedTextField。",
    switch: "Switch / Checkbox / RadioButton 用官方尺寸，不要自行绘制。",
    checkbox: "Checkbox 用官方尺寸。",
    radio: "同一 group 的 RadioButton 互斥。",
    slider: "Slider / RangeSlider 用官方轨道，不要改成 Material 细轨。",
    progress: "CircularProgressIndicator 直径 30.dp、描边 4.dp。InfiniteProgressIndicator 是 20.dp 灰环加 2.dp 轨道点。",
    pullToRefresh: "PullToRefresh 用 PullToRefreshDefaults.circleSize = 20.dp，不要复用 InfiniteProgressIndicator。",
    numberPicker: "NumberPicker 用淡出缩放，不要选中条。",
    breadcrumb: "BreadcrumbBar 是胶囊分段，高亮 primary@20%。",
    switchPref: "相邻 Preference 合成一组 Card（首尾圆角 16.dp，中间无缝，insideMargin = 0）。标题 onBackground，内边距 16.dp。",
    checkboxPref: "相邻 Preference 合成一组 Card，标题 onBackground。",
    radioPref: "相邻 Preference 合成一组 Card；同一 group 互斥。",
    basicPref: "相邻 Preference 合成一组 Card。",
    sliderPref: "SliderPreference 放在 Preference Card 组里。",
    rangeSliderPref: "RangeSliderPreference 放在 Preference Card 组里。",
    dropdownPref: "下拉设置项用 OverlayDropdownPreference 或 WindowDropdownPreference，不要写成普通 Dropdown。",
    spinnerPref: "Spinner 设置项用 OverlaySpinnerPreference 或 WindowSpinnerPreference。",
    arrowPref: "ArrowPreference 表示进入下一页，右侧 chevron。",
    blur: "模糊是 Modifier.textureBlur，先 layerBackdrop 再 blur。",
    image: "图片用 Compose Image / Coil。",
  },
  en: {
    button: "Button: 50.dp tall, 16.dp squircle. Primary uses ButtonDefaults.buttonColorsPrimary(). TextButton is secondaryVariant / onSecondaryVariant — not a transparent Material text button.",
    topAppBar: "App bar: SmallTopAppBar / TopAppBar, about 72.dp, surface, 48.dp icon buttons.",
    smallTitle: "SmallTitle: 40.dp section label with 16.dp side inset.",
    navigationBar: "NavigationBar: 64.dp, surface, top divider, unselected alpha 0.4. Modes: IconAndText / IconOnly / IconWithSelectedLabel.",
    floatingNav: "FloatingNavigationBar is icons-only by default with 50.dp corners. iosLike uses the official IosLiquidGlassNavigationBar example.",
    navigationRail: "Use NavigationRail on wide layouts instead of stretching a phone nav bar.",
    tabRow: "Unselected TabRow tabs have a 1.dp outline; selected uses a sliding surfaceContainer indicator.",
    searchBar: "SearchBar must wrap an InputField; placeholder uses onSurfaceContainerHigh.",
    card: "Card: 16.dp squircle, 16.dp padding, surfaceContainer. Title ~19.sp, summary 17.sp.",
    snackbar: "Snackbar actions are a primary pill TextButton.",
    dialog: "OverlayDialog, OverlayBottomSheet and other Overlay* widgets must live inside Scaffold; Window* variants do not.",
    bottomSheet: "OverlayBottomSheet must live inside Scaffold.",
    textField: "Use the Miuix TextField, not Material OutlinedTextField.",
    switch: "Use official Switch / Checkbox / RadioButton sizes; do not custom-draw them.",
    checkbox: "Use the official Checkbox size.",
    radio: "RadioButtons that share a group are exclusive.",
    slider: "Use official Slider / RangeSlider tracks, not the thin Material ones.",
    progress: "CircularProgressIndicator is 30.dp with a 4.dp stroke. InfiniteProgressIndicator is a 20.dp gray ring with a 2.dp orbiting dot.",
    pullToRefresh: "PullToRefresh uses PullToRefreshDefaults.circleSize = 20.dp; do not reuse InfiniteProgressIndicator.",
    numberPicker: "NumberPicker fades and scales; no highlight bar.",
    breadcrumb: "BreadcrumbBar uses capsule chips highlighted at primary@20%.",
    switchPref: "Adjacent Preference rows share one Card (16.dp outer corners, insideMargin = 0). Titles use onBackground with 16.dp padding.",
    checkboxPref: "Adjacent Preference rows share one Card; titles use onBackground.",
    radioPref: "Adjacent Preference rows share one Card; the same group is exclusive.",
    basicPref: "Adjacent Preference rows share one Card.",
    sliderPref: "SliderPreference sits in a Preference Card group.",
    rangeSliderPref: "RangeSliderPreference sits in a Preference Card group.",
    dropdownPref: "Use OverlayDropdownPreference or WindowDropdownPreference, not a generic Dropdown.",
    spinnerPref: "Use OverlaySpinnerPreference or WindowSpinnerPreference.",
    arrowPref: "ArrowPreference opens the next page with a trailing chevron.",
    blur: "Blur is Modifier.textureBlur after layerBackdrop.",
    image: "Images use Compose Image / Coil.",
  },
  ja: {
    button: "Button：高さ 50.dp、角 16.dp squircle。主ボタンは ButtonDefaults.buttonColorsPrimary()。TextButton は secondaryVariant / onSecondaryVariant で、Material の透明テキストボタンにはしない。",
    topAppBar: "トップバー：SmallTopAppBar / TopAppBar、高さ約 72.dp、背景 surface、左右の IconButton は 48.dp。",
    smallTitle: "SmallTitle：グループ見出し、高さ 40.dp、左右 16.dp。",
    navigationBar: "NavigationBar：高さ 64.dp、surface、上端の分割線、未選択 alpha 0.4。",
    floatingNav: "FloatingNavigationBar は既定でアイコンのみ、角 50.dp。",
    navigationRail: "広い幅では NavigationRail を使う。",
    tabRow: "TabRow の未選択は 1.dp の輪郭。",
    searchBar: "SearchBar は InputField を子に置く。",
    card: "Card：16.dp squircle、余白 16.dp、surfaceContainer。",
    snackbar: "Snackbar のアクションは主色カプセルの TextButton。",
    dialog: "Overlay* は Scaffold 内。Window* は不要。",
    bottomSheet: "OverlayBottomSheet は Scaffold 内。",
    textField: "Miuix の TextField を使い、Material の OutlinedTextField にはしない。",
    switch: "公式の Switch / Checkbox / RadioButton サイズを使う。",
    checkbox: "公式の Checkbox サイズを使う。",
    radio: "同じ group の RadioButton は排他。",
    slider: "公式の Slider 軌道を使う。",
    progress: "CircularProgressIndicator は直径 30.dp、線幅 4.dp。InfiniteProgressIndicator は 20.dp のグレー環と 2.dp の軌道点。",
    pullToRefresh: "PullToRefreshDefaults.circleSize = 20.dp。InfiniteProgressIndicator を流用しない。",
    numberPicker: "NumberPicker はフェードとスケールで、選択バーは付けない。",
    breadcrumb: "BreadcrumbBar はカプセル。",
    switchPref: "隣り合う Preference は 1 枚の Card にまとめる（外側の角だけ 16.dp）。",
    checkboxPref: "隣り合う Preference は 1 枚の Card にまとめる。",
    radioPref: "隣り合う Preference は 1 枚の Card にまとめる。",
    basicPref: "隣り合う Preference は 1 枚の Card にまとめる。",
    sliderPref: "SliderPreference は Preference の Card グループに入れる。",
    rangeSliderPref: "RangeSliderPreference は Preference の Card グループに入れる。",
    dropdownPref: "OverlayDropdownPreference または WindowDropdownPreference を使う。",
    spinnerPref: "OverlaySpinnerPreference または WindowSpinnerPreference を使う。",
    arrowPref: "ArrowPreference は次の画面へ進む。",
    blur: "ブラーは layerBackdrop の上の Modifier.textureBlur。",
    image: "画像は Compose Image / Coil。",
  },
  ko: {
    button: "Button: 높이 50.dp, 16.dp squircle. 주 버튼은 ButtonDefaults.buttonColorsPrimary(). TextButton은 secondaryVariant / onSecondaryVariant이며 Material 투명 텍스트 버튼이 아니다.",
    topAppBar: "상단 바: SmallTopAppBar / TopAppBar, 약 72.dp, surface, 아이콘 버튼 48.dp.",
    smallTitle: "SmallTitle: 40.dp 구역 제목, 좌우 16.dp.",
    navigationBar: "NavigationBar: 높이 64.dp, surface, 상단 구분선, 미선택 alpha 0.4.",
    floatingNav: "FloatingNavigationBar는 기본 아이콘만, 모서리 50.dp.",
    navigationRail: "넓은 폭에서는 NavigationRail을 쓴다.",
    tabRow: "TabRow 미선택은 1.dp 윤곽.",
    searchBar: "SearchBar는 InputField 자식이 필요하다.",
    card: "Card: 16.dp squircle, 안쪽 여백 16.dp, surfaceContainer.",
    snackbar: "Snackbar 동작은 주색 캡슐 TextButton.",
    dialog: "Overlay*는 Scaffold 안, Window*는 필요 없다.",
    bottomSheet: "OverlayBottomSheet는 Scaffold 안에 둔다.",
    textField: "Miuix TextField를 쓰고 Material OutlinedTextField는 쓰지 않는다.",
    switch: "공식 Switch / Checkbox / RadioButton 크기를 쓴다.",
    checkbox: "공식 Checkbox 크기를 쓴다.",
    radio: "같은 group의 RadioButton은 배타적이다.",
    slider: "공식 Slider 트랙을 쓴다.",
    progress: "CircularProgressIndicator는 지름 30.dp, 선 4.dp. InfiniteProgressIndicator는 20.dp 회색 고리와 2.dp 궤도 점.",
    pullToRefresh: "PullToRefreshDefaults.circleSize = 20.dp이며 InfiniteProgressIndicator를 재사용하지 않는다.",
    numberPicker: "NumberPicker는 페이드·스케일이며 선택 막대가 없다.",
    breadcrumb: "BreadcrumbBar는 캡슐 조각.",
    switchPref: "인접 Preference는 하나의 Card로 묶는다(바깥 모서리만 16.dp).",
    checkboxPref: "인접 Preference는 하나의 Card로 묶는다.",
    radioPref: "인접 Preference는 하나의 Card로 묶는다.",
    basicPref: "인접 Preference는 하나의 Card로 묶는다.",
    sliderPref: "SliderPreference는 Preference Card 그룹에 둔다.",
    rangeSliderPref: "RangeSliderPreference는 Preference Card 그룹에 둔다.",
    dropdownPref: "OverlayDropdownPreference 또는 WindowDropdownPreference를 쓴다.",
    spinnerPref: "OverlaySpinnerPreference 또는 WindowSpinnerPreference를 쓴다.",
    arrowPref: "ArrowPreference는 다음 화면으로 이동한다.",
    blur: "블러는 layerBackdrop 위의 Modifier.textureBlur.",
    image: "이미지는 Compose Image / Coil.",
  },
};

function styleNotesFor(kinds: Kind[], lang: Lang): string[] {
  const seen = new Set<string>();
  const notes: string[] = [];
  const group = kinds.some((k) => k.endsWith("Pref") || k === "dropdown");
  for (const kind of kinds) {
    const note = STYLE_NOTES[lang][kind];
    if (!note || seen.has(note)) continue;
    seen.add(note);
    notes.push(note);
  }
  if (group && !notes.some((n) => n.includes("Preference") || n.includes("Card"))) {
    notes.unshift(STYLE_NOTES[lang].switchPref ?? "");
  }
  return notes.filter(Boolean);
}

const GENERAL: Record<Lang, string[]> = {
  zh: [
    "先根据屏幕目的判断这是什么类型的应用，并实现该类应用通常应有的功能（新建、列表、详情、编辑、删除、搜索、设置等，视情况而定），即使草图中没有画出。",
    "把数据当作真实数据处理：用户创建的内容要持久化（CMP/Android 用 DataStore 或数据库，Web 用 IndexedDB 等），重启或刷新后仍在。不要塞虚拟示例数据；没有数据时显示空状态。校验输入，删除和失败要有确认或提示。",
    "草图没有写明的行为，根据屏幕目的和组件标签补全。未指定行为的按钮或项目要实现与其标签相符的操作（保存、发送、打开详情等），不要什么都不做。",
    "下面的屏幕结构是传达意图的草图，不是最终像素规格。不要当静态图照搬；尺寸和间距可按内容调整。真机上会出问题就优先可用。",
    "界面必须使用 Miuix（https://github.com/compose-miuix-ui/miuix）官方组件，不要用 Material 3，也不要自行绘制库里已有的部件。",
    "颜色必须通过配色角色名（primary、surface、surfaceContainer、onBackground 等）引用，不要写死色值。",
    "屏幕边缘 16.dp，组件之间 8〜16.dp。相邻 Preference 放进同一张 Card。用 Scaffold + TopAppBar / NavigationBar（桌面宽度改 NavigationRail）。Overlay* 必须包在 Scaffold 里。",
    "可点击部件要有按压缩放反馈。“返回”走返回栈，系统返回手势也要一样。",
    "图标用 Miuix Icons / Material Symbols 对应名。列表垂直排列。保持 HyperOS 灰底白卡片、16.dp 超椭圆圆角。",
  ],
  en: [
    "Work out what kind of app this is from the purpose of the screens, and implement the features such an app is normally expected to have (create, list, detail, edit, delete, search, settings, whichever apply) even where the sketch does not show them.",
    "Treat the data as real. Persist what the user creates (DataStore or a database on CMP/Android, IndexedDB or similar on Web) so it survives restarts. Do not ship dummy sample data; show an empty state when there is nothing yet. Validate input, and confirm or report failures and deletions.",
    "Fill in behavior the sketch leaves out from the purpose of the screen and the labels of the parts. A button or item with no behavior specified should do what its label implies (save, send, open a detail screen), never nothing.",
    "The layout below is a rough sketch of intent, not a finished pixel spec. Do not reproduce it as a static picture; sizes and spacing may be adjusted. If something would break on a device, prefer working over matching the sketch.",
    "The UI must use official Miuix components (https://github.com/compose-miuix-ui/miuix), not Material 3, and must not custom-draw parts the library already provides.",
    "Always reference colors through scheme roles (primary, surface, surfaceContainer, onBackground, …) instead of hard-coded values.",
    "Keep 16.dp screen margins and 8–16.dp between parts. Adjacent Preference rows share one Card. Use Scaffold with TopAppBar / NavigationBar (NavigationRail on desktop widths). Overlay* widgets must live inside Scaffold.",
    "Give every tappable part press feedback. Back uses the back stack; the system back gesture must do the same.",
    "Use Miuix Icons (Material Symbols names). Vertical lists. Keep the HyperOS look: gray background, white cards, 16.dp squircle corners.",
  ],
  ja: [
    "まず画面の目的から「これは何のアプリか」を判断し、そのカテゴリで一般に期待される機能（作成・一覧・詳細・編集・削除・検索・設定など）を、スケッチになくても一通り実装する。",
    "データは本物として扱う。ユーザーが作った内容は永続化し、再起動後も残す。ダミーデータは入れず、空なら空状態を出す。入力は検証し、削除や失敗は確認・通知する。",
    "書かれていない振る舞いは画面の目的とラベルから補う。指定のないボタンはラベルにふさわしい処理をし、何も起きないままにしない。",
    "下の画面構成は意図を伝えるラフスケッチであり完成図ではない。静止画のように再現せず、使える完成品にする。",
    "画面は必ず Miuix（https://github.com/compose-miuix-ui/miuix）の公式コンポーネントを使い、Material 3 は使わない。ライブラリにある部品を独自描画しない。",
    "色はロール名（primary、surface、surfaceContainer など）で参照し、ハードコードしない。",
    "画面端 16.dp、部品間 8〜16.dp。隣り合う Preference は 1 枚の Card。Scaffold + TopAppBar / NavigationBar（広い幅は NavigationRail）。Overlay* は Scaffold 内。",
    "タップできる部品には押し込みフィードバックを付ける。戻るはバックスタック。",
    "アイコンは Miuix Icons。縦リスト。HyperOS 風のグレー背景・白いカード・16.dp 超楕円角を保つ。",
  ],
  ko: [
    "화면의 목적에서 앱 종류를 판단하고, 스케치에 없더라도 그 종류에 일반적으로 필요한 기능(만들기, 목록, 상세, 편집, 삭제, 검색, 설정 등)을 구현한다.",
    "데이터를 실제로 취급한다. 사용자가 만든 내용은 저장해 재시작 후에도 남긴다. 더미 데이터는 넣지 말고 없으면 빈 상태를 보여 준다. 입력을 검증하고 삭제와 실패는 확인하거나 알린다.",
    "스케치에 없는 동작은 화면 목적과 레이블로 보완한다. 동작이 없는 버튼도 레이블에 맞는 일을 해야 한다.",
    "아래 구성은 의도를 전하는 스케치이지 픽셀 사양이 아니다. 정지 그림처럼 복제하지 말고 실제로 쓸 수 있는 완성품으로 만든다.",
    "UI는 반드시 Miuix(https://github.com/compose-miuix-ui/miuix) 공식 컴포넌트를 쓰고 Material 3는 쓰지 않으며 라이브러리에 있는 부품을 직접 그리지 않는다.",
    "색은 primary, surface, surfaceContainer 등 역할 이름으로 참조하고 하드코딩하지 않는다.",
    "화면 가장자리 16.dp, 부품 사이 8~16.dp. 인접 Preference는 하나의 Card. Scaffold + TopAppBar / NavigationBar(넓은 폭은 NavigationRail). Overlay*는 Scaffold 안.",
    "탭 가능한 부품에는 눌림 피드백을 준다. 뒤로 가기는 백 스택을 쓴다.",
    "아이콘은 Miuix Icons. 세로 목록. HyperOS 회색 배경, 흰 카드, 16.dp 스쿼클 모서리를 유지한다.",
  ],
};

function paletteLines(doc: Doc): string[] {
  const pal = schemeFromSeed(doc.theme.seed, doc.theme.mode === "dark");
  const keys = ["primary", "onPrimary", "surface", "onSurface", "surfaceContainer", "onBackground", "secondaryVariant", "onSecondaryVariant", "outline"] as const;
  return keys.map((key) => `- ${key}: ${pal[key]}`);
}

export function buildPrompt(doc: Doc, lang: Lang, onlyScreenId?: string): string {
  const screens = onlyScreenId ? doc.screens.filter((s) => s.id === onlyScreenId) : doc.screens;
  const title = doc.title.trim() || { zh: "未命名应用", en: "Untitled app", ja: "名称未設定のアプリ", ko: "이름 없는 앱" }[lang];
  const brief = doc.brief?.trim() ? `${trimEnd(doc.brief)}${cjk(lang) ? "。" : "."}` : "";
  const mode = {
    zh: doc.theme.mode === "dark" ? "深色" : "浅色",
    en: doc.theme.mode === "dark" ? "dark" : "light",
    ja: doc.theme.mode === "dark" ? "ダーク" : "ライト",
    ko: doc.theme.mode === "dark" ? "다크" : "라이트",
  }[lang];
  const phones = screens.filter((s) => s.preset === "phone").length;
  const desktops = screens.filter((s) => s.preset === "desktop").length;
  const target = {
    zh: phones && desktops
      ? `同时面向竖屏手机（412×892dp）和桌面（1280×800dp），同名思路做成响应式。`
      : desktops
        ? `目标为桌面（1280×800dp）。`
        : `目标为竖屏手机（412×892dp）。`,
    en: phones && desktops
      ? `Target both a portrait phone (412×892dp) and desktop (1280×800dp); treat same-name screens as one responsive layout.`
      : desktops
        ? `Target a desktop viewport (1280×800dp).`
        : `Target a portrait phone (412×892dp).`,
    ja: phones && desktops
      ? `スマホ縦（412×892dp）とデスクトップ（1280×800dp）の両方。同名は応答的に 1 画面。`
      : desktops
        ? `想定はデスクトップ（1280×800dp）。`
        : `想定はスマホ縦画面（412×892dp）。`,
    ko: phones && desktops
      ? `세로 휴대폰(412×892dp)과 데스크톱(1280×800dp)을 모두 대상으로 하며 같은 이름은 반응형 한 화면으로 본다.`
      : desktops
        ? `데스크톱(1280×800dp)을 대상으로 한다.`
        : `세로 휴대폰(412×892dp)을 대상으로 한다.`,
  }[lang];
  const intro = {
    zh: `请用 Miuix（https://github.com/compose-miuix-ui/miuix）实现${q(title, lang)}。${brief}${STACK[doc.platform][lang]}${target}只做${mode}模式。不要用 Material 3。`,
    en: `Please implement ${q(title, lang)} with Miuix (https://github.com/compose-miuix-ui/miuix). ${brief} ${STACK[doc.platform][lang]} ${target} ${mode} mode only. Do not use Material 3.`,
    ja: `${q(title, lang)}を Miuix（https://github.com/compose-miuix-ui/miuix）で実装する。${brief}${STACK[doc.platform][lang]}${target}${mode}モードのみ。Material 3 は使わない。`,
    ko: `Miuix(https://github.com/compose-miuix-ui/miuix)로 ${q(title, lang)}를 구현한다. ${brief}${STACK[doc.platform][lang]}${target}${mode} 모드만. Material 3는 쓰지 않는다.`,
  }[lang];

  const hColor = { zh: "## 配色", en: "## Colors", ja: "## カラー", ko: "## 색상" }[lang];
  const hShape = { zh: "## 形状与字体", en: "## Shape and type", ja: "## 形と文字", ko: "## 모양과 글꼴" }[lang];
  const hLayout = { zh: "## 屏幕结构", en: "## Layout", ja: "## 画面構成", ko: "## 화면 구성" }[lang];
  const hBehavior = { zh: "## 行为与屏幕跳转", en: "## Behavior and navigation", ja: "## 振る舞いと画面遷移", ko: "## 동작 및 화면 전환" }[lang];
  const hStyle = { zh: "## 各组件的样式", en: "## Component styles", ja: "## 各部品のスタイル", ko: "## 부품별 스타일" }[lang];
  const hGeneral = { zh: "## 整体原则", en: "## General guidance", ja: "## 全体の指針", ko: "## 전체 지침" }[lang];

  const colorIntro = {
    zh: `主题：${mode}，种子色 ${doc.theme.seed}，用 ${themeController(doc)}。背景用 surface（浅色约 #F7F7F7），卡片与 Preference 用 surfaceContainer。主色给 Button / Switch / Slider。UI 颜色都通过这些角色引用：`,
    en: `Theme: ${mode}, seed ${doc.theme.seed}, using ${themeController(doc)}. Background is surface (~#F7F7F7 in light). Cards and preferences sit on surfaceContainer. Primary tints Button, Switch and Slider. Reference UI colors through these roles:`,
    ja: `テーマ：${mode}、シード色 ${doc.theme.seed}、${themeController(doc)} を使う。背景は surface（ライト時は約 #F7F7F7）。カードと Preference は surfaceContainer。次のロールで色を参照する：`,
    ko: `테마: ${mode}, 시드 색 ${doc.theme.seed}, ${themeController(doc)}를 쓴다. 배경은 surface(라이트는 약 #F7F7F7). 카드와 Preference는 surfaceContainer. 색은 다음 역할로 참조한다:`,
  }[lang];

  const shape = {
    zh: `- 圆角用 Miuix 默认 16.dp squircle（miuix-squircle），不要改成 Material 全胶囊。\n- 字体跟随 HyperOS / 系统默认，标题与 Preference 用 onBackground。\n- 动效用 Miuix 默认，屏幕跳转可用 miuix-nav。`,
    en: `- Corners are Miuix 16.dp squircles (miuix-squircle), not Material pills.\n- Type follows HyperOS / the system font; titles and preferences use onBackground.\n- Motion stays on Miuix defaults; navigate with miuix-nav.`,
    ja: `- 角は Miuix 既定の 16.dp squircle（miuix-squircle）。\n- 書体は HyperOS / システム。タイトルと Preference は onBackground。\n- モーションは Miuix 既定。遷移は miuix-nav。`,
    ko: `- 모서리는 Miuix 기본 16.dp squircle(miuix-squircle).\n- 글꼴은 HyperOS / 시스템. 제목과 Preference는 onBackground.\n- 모션은 Miuix 기본, 이동은 miuix-nav.`,
  }[lang];

  const names = screens.map((s) => q(s.name, lang));
  const screenList = screens.length > 1
    ? { zh: `共有 ${screens.length} 个屏幕：${names.join("、")}。`, en: `There are ${screens.length} screens: ${names.join(", ")}.`, ja: `画面は ${screens.length} つあり、${names.join("、")}です。`, ko: `화면은 ${screens.length}개이며 ${names.join(", ")}입니다.` }[lang]
    : "";

  const kinds = [...new Set(screens.flatMap((s) => s.items.map((it) => it.kind)))];
  const styles = styleNotesFor(kinds, lang);
  const styleIntro = {
    zh: "以下是所用组件的参考。数值是 Miuix / HyperOS 默认，能交给官方组件的就不要重画。",
    en: "Per-component guidance for the parts in use. Numbers are Miuix / HyperOS defaults: let official components do the work.",
    ja: "使っている部品の目安。数値は Miuix / HyperOS の既定なので、公式コンポーネントに任せる。",
    ko: "사용된 부품 기준. 수치는 Miuix / HyperOS 기본값이며 공식 컴포넌트에 맡긴다.",
  }[lang];

  const behavior = behaviorNotes(doc, screens, lang);
  const parts = [
    intro,
    `${hColor}\n${colorIntro}\n${paletteLines(doc).join("\n")}`,
    `${hShape}\n${shape}`,
    `${hLayout}\n${[screenList, screens.map((s) => describeScreen(doc, s, lang)).join("\n\n")].filter(Boolean).join("\n")}`,
  ];
  if (behavior.length) parts.push(`${hBehavior}\n${behavior.map((n) => `- ${n}`).join("\n")}`);
  if (styles.length) parts.push(`${hStyle}\n${styleIntro}\n${styles.map((s) => `- ${s}`).join("\n")}`);
  const targetLine = {
    zh: `目标平台：${PLATFORM_TEXT[lang][doc.platform]}。`,
    en: `Target: ${PLATFORM_TEXT[lang][doc.platform]}.`,
    ja: `実装先：${PLATFORM_TEXT[lang][doc.platform]}。`,
    ko: `대상: ${PLATFORM_TEXT[lang][doc.platform]}.`,
  }[lang];
  parts.push(`${hGeneral}\n${GENERAL[lang].map((s) => `- ${s}`).join("\n")}\n- ${targetLine}`);
  return parts.join("\n\n");
}

export function effectivePrompt(doc: Doc, lang: Lang, onlyScreenId?: string) {
  return buildPrompt(doc, lang, onlyScreenId);
}
