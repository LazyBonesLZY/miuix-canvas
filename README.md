# Miuix Canvas

Sketch [Miuix](https://github.com/compose-miuix-ui/miuix) (HyperOS-style Compose Multiplatform) screens in the browser, link them, tap through them, and copy a prompt for your AI coding tool.

Inspired by [M3E Canvas](https://github.com/lnkiai/m3e-canvas), but the parts, colors, and generated prompts are Miuix — not Material 3 Expressive.

**Open the app:** https://lazyboneslzy.github.io/miuix-canvas/

Works with any AI coding tool that takes a prompt, such as Cursor, Claude Code, Codex or Gemini CLI: copy the prompt, paste it into the tool, and ask for the app.

## What it does

- **Drag-and-drop Miuix parts** — Button, IconButton, FAB, FloatingToolbar, TopAppBar, SmallTitle, NavigationBar, FloatingNavigationBar, NavigationRail, TabRow / TabRowWithContour, SearchBar, BreadcrumbBar, Card, Surface, HorizontalDivider / VerticalDivider, Snackbar, OverlayDialog / WindowDialog, OverlayBottomSheet / WindowBottomSheet, ListPopup, cascading ListPopup, OverlayDropdownMenu / WindowDropdownMenu, Tooltip / RichTooltipBox, TextField, Switch, Checkbox, RadioButton, Slider / VerticalSlider, RangeSlider, Dropdown, NumberPicker, ColorPicker, ColorPalette, Text, Image, Badge, Icon, Linear / Circular / Infinite ProgressIndicator, PullToRefresh, Vertical / Horizontal ScrollBar.
- **Preference rows** — BasicComponent, SwitchPreference, CheckboxPreference, RadioButtonPreference, SliderPreference, RangeSliderPreference, SpinnerPreference / OverlayDropdownPreference, ArrowPreference. Adjacent rows magnetically join into one HyperOS Card.
- **Phone and desktop screens** — 412×892 phone and 1280×800 desktop. Switching size converts NavigationBar ↔ NavigationRail.
- **Tap and swipe to navigate** — parts, nav destinations and screen swipes can open another screen. Preview plays the transition; canvas arrows show the flow.
- **Theme** — light / dark, a seed color (default `#3482FF`), Monet flag. Surfaces stay HyperOS; primary roles shift with the seed.
- **Prompt output** — Chinese, English, Japanese or Korean brief naming real Miuix composables (`OverlayDialog`, `SwitchPreference`, …). Target Compose Multiplatform (default), Android, or CMP Web.
- **Optional AI helper** — your own OpenAI / Claude / Gemini / DeepSeek key writes a part or screen note. The key stays in the browser.
- **Tidy, layers, guides, undo/redo**, 4dp grid, compressed share links, JSON and PNG.
- **Reset canvas** — replace the current design with the sample (undo brings it back).
- **Phone-friendly** — the side panels collapse into a bottom sheet under 900px.

## Keyboard

| Key | Action |
| --- | --- |
| `V` / `H` | Select / hand tool (hold `Space` to pan) |
| Wheel, `Ctrl` + wheel | Pan, zoom |
| `F` / `0` | Fit all screens in the viewport |
| Double-click canvas | Fit all, or center the screen you click |
| `1` | Zoom 100% |
| `C` | Center the selected part, or center the current screen |
| `Shift+C` / `Alt+C` | Center horizontally / vertically |
| `[` / `]` | Pin to 16dp left / right margins |
| `Shift+[` / `]` | Pin to top / bottom margins |
| `+` `-` | Zoom in / out |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / redo |
| `Ctrl+D` | Duplicate part |
| `Delete` | Delete part or screen |
| `P` | Preview |
| `?` | Shortcuts |
| `Esc` | Close preview, help, or sheets |

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npm test
```

The app is a static Next.js export. To host it under a sub-path (for example a GitHub Pages project site), set `NEXT_PUBLIC_BASE_PATH=/your-repo` at build time. `.github/workflows/deploy.yml` does this automatically and publishes `out/` to GitHub Pages on every push to `main`.

## See also

- [compose-miuix-ui/miuix](https://github.com/compose-miuix-ui/miuix) — the Compose Multiplatform library this canvas sketches for
- [lnkiai/m3e-canvas](https://github.com/lnkiai/m3e-canvas) — the Material 3 Expressive canvas that inspired the workflow

## License

MIT © LazyBonesLZY

Miuix itself is Apache-2.0. This project reimplements the look in the browser for sketching; it does not vendor the Kotlin sources.

---

## 中文

**在浏览器中拼装 [Miuix](https://github.com/compose-miuix-ui/miuix)（HyperOS 风格）界面，把屏幕连起来、点一点试试，然后直接变成给 AI 编程工具的提示词。**

工作流参考 [M3E Canvas](https://github.com/lnkiai/m3e-canvas)，但部件、配色和提示词都面向 Miuix，而不是 Material 3 Expressive。

在线版本：https://lazyboneslzy.github.io/miuix-canvas/

可配合 Cursor、Claude Code、Codex、Gemini CLI 等任何接受提示词的工具：复制提示词，贴进去，让它用 Miuix 把应用做出来。

### 功能

- 拖放完整 Miuix 基础部件（含 FloatingNavigationBar、RangeSlider、WindowDialog、RichTooltipBox、DropdownMenu 等）以及 Preference 行
- HyperOS 设置项可磁吸拼成一组 Card
- 手机 / 桌面互转时导航栏会变成 NavigationRail
- 点击、导航项、屏幕滑动都可以跳转；画布上有流程箭头
- 浅色 / 深色、种子色、Monet；可选填自己的 API key 写行为说明
- 中 / 英 / 日 / 韩提示词会写出真实的 Miuix composable 名
- `F` 适应画布，`C` 居中，`?` 看快捷键
- 整理、图层、对齐线、压缩分享链接、JSON、PNG；窄屏用底部面板

### 开发

```bash
npm install
npm run dev
npm run build
```

### 许可证

MIT © LazyBonesLZY
