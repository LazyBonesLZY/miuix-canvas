# Miuix Canvas

Sketch [Miuix](https://github.com/compose-miuix-ui/miuix) (HyperOS-style Compose Multiplatform) screens in the browser, link them, tap through them, and copy a prompt for your AI coding tool.

Inspired by [M3E Canvas](https://github.com/lnkiai/m3e-canvas), but the parts, colors, and generated prompts are Miuix — not Material 3 Expressive.

**Open the app:** https://lazyboneslzy.github.io/miuix-canvas/

Works with any AI coding tool that takes a prompt, such as Cursor, Claude Code, Codex or Gemini CLI: copy the prompt, paste it into the tool, and ask for the app.

## What it does

- **Drag-and-drop Miuix parts** — Button, IconButton, FAB, FloatingToolbar, TopAppBar, SmallTitle, NavigationBar, NavigationRail, TabRow, SearchBar, BreadcrumbBar, Card, Surface, Divider, Snackbar, SuperDialog, TextField, Switch, Checkbox, RadioButton, Slider, Dropdown, NumberPicker, Text, Image, Badge, Icon, ProgressIndicator, PullToRefresh.
- **Preference rows** — SwitchPreference, CheckboxPreference, RadioButtonPreference, SliderPreference, SpinnerPreference, ArrowPreference. These are the HyperOS settings look: white rows on a gray surface.
- **Phone and desktop screens** — 412×892 phone and 1280×800 desktop. Switch a screen from its label; bars stretch, a navigation bar can sit as a rail on desktop.
- **Tap to navigate** — give a part a target screen (or back) and a transition. Preview lets you tap through the flow.
- **Theme** — light / dark, a seed color (default `#3482FF`, the Miuix primary), Monet dynamic-color flag. Surfaces stay HyperOS; primary roles shift with the seed.
- **Prompt output** — the design becomes a concise brief in Chinese or English. Target Compose Multiplatform (default), Android, or CMP Web. The prompt asks for `top.yukonga.miuix.kmp` and forbids Material 3.
- **Tidy** — snaps bars to the edges, FAB to the corner, and stacks the rest on 16dp margins.
- **Export** — copy the prompt, save JSON, share a link, or export a screen as PNG.
- **Undo / redo**, alignment to a 4dp grid, and automatic save in `localStorage`.

## Keyboard

| Key | Action |
| --- | --- |
| `V` / `H` | Select / hand tool (hold `Space` to pan) |
| Wheel, `Ctrl` + wheel | Pan, zoom |
| `+` `-` `0` | Zoom in, zoom out, reset |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / redo |
| `Delete` | Delete part or screen |
| `P` | Preview |
| `Esc` | Leave preview |

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

- 拖放 Miuix 基础部件（按钮、顶栏、导航栏、卡片、输入、进度等）
- HyperOS 设置项：Switch / Checkbox / Radio / Slider / Spinner / Arrow Preference
- 手机 412×892 与桌面 1280×800，同一设计里可混用
- 点击跳转 + 预览过渡
- 浅色 / 深色、种子色（默认 `#3482FF`）、Monet 动态取色标记
- 中 / 英提示词，目标可选 Compose Multiplatform、Android、CMP Web
- 整理、JSON、分享链接、PNG、撤销重做；内容保存在浏览器

### 开发

```bash
npm install
npm run dev
npm run build
```

### 许可证

MIT © LazyBonesLZY
