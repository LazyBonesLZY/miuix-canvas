# Miuix Canvas

Sketch [Miuix](https://github.com/compose-miuix-ui/miuix) (HyperOS-style Compose Multiplatform) screens in the browser, link them, tap through them, and copy a prompt for your AI coding tool.

Inspired by [M3E Canvas](https://github.com/lnkiai/m3e-canvas), but the parts, colors, and generated prompts are Miuix — not Material 3 Expressive.

**中文说明：** [README_CN.md](./README_CN.md)

**Open the app:** https://lazyboneslzy.github.io/miuix-canvas/

> **Heads-up:** This is a vibe implementation. Please go easy.

Works with any AI coding tool that takes a prompt, such as Cursor, Claude Code, Codex or Gemini CLI: copy the prompt, paste it into the tool, and ask for the app.

## What it does

- **Drag-and-drop Miuix parts** — Button, IconButton, FAB, FloatingToolbar, TopAppBar, SmallTitle, NavigationBar (`IconAndText` / `IconOnly` / `IconWithSelectedLabel`), FloatingNavigationBar (`default` / example `iosLike` liquid glass); `textureBlur` and `progressiveTextureBlur` are real modifier effects, NavigationRail, TabRow / TabRowWithContour, SearchBar, BreadcrumbBar, Card, Surface, HorizontalDivider / VerticalDivider, Snackbar, OverlayDialog / WindowDialog, OverlayBottomSheet / WindowBottomSheet, OverlayListPopup / WindowListPopup, OverlayCascadingListPopup / WindowCascadingListPopup, OverlayDropdownMenu / WindowDropdownMenu, OverlayIconDropdownMenu / WindowIconDropdownMenu, OverlayIconCascadingDropdownMenu / WindowIconCascadingDropdownMenu, Tooltip / RichTooltipBox, TextField, Switch, Checkbox, RadioButton, Slider / VerticalSlider / stepped / disabled, RangeSlider, Dropdown, NumberPicker, ColorPicker, ColorPalette, Text, Image, Badge, Icon, Linear / Circular / Infinite ProgressIndicator, PullToRefresh, Vertical / Horizontal ScrollBar. Glass comes from `miuix-blur` (`Modifier.textureBlur`, `Highlight.GlassStroke*`, and the example `IosLiquidGlassNavigationBar`).
- **Preference rows** — BasicComponent, SwitchPreference, CheckboxPreference, RadioButtonPreference, SliderPreference, RangeSliderPreference, OverlayDropdownPreference / WindowDropdownPreference, OverlaySpinnerPreference / WindowSpinnerPreference, ArrowPreference. Adjacent rows magnetically join into one HyperOS Card.
- **Phone and desktop screens** — 412×892 phone and 1280×800 desktop. Switching size converts NavigationBar ↔ NavigationRail.
- **Editor chrome on three sizes** — phone uses a bottom bar and sheet; tablet uses a left rail and one docked panel; desktop keeps parts and inspector on both sides. Safe areas, compact toolbars, and preview scaling follow the viewport.
- **HyperOS look** — sketches use official Miuix sizes and colors (gray TextButton, 49×28 Switch, check-only RadioButton, 16dp Card, no Material icon wells). The sample home follows the official jsCanvas demo sections.
- **Live sketches** — Switch, Checkbox, Radio, Slider, tabs, SearchBar, NumberPicker, ColorPalette, ColorPicker, menus and preference rows respond in preview. On the canvas, click a selected part to toggle or drag a selected slider. Infinite progress and PullToRefresh keep spinning.
- **Tap and swipe to navigate** — parts, nav destinations and screen swipes can open another screen. Preview uses official `miuix-nav` (`NavDisplay` / `NavTransitions.MiuixDefault` or `Modal`); canvas arrows show the flow.
- **Theme** — light / dark uses official HyperOS `lightColorScheme()` / `darkColorScheme()`. Monet is optional Material dynamic color (default `ThemeController` Monet palette), off by default. Seed color applies when Monet is on.
- **Prompt output** — Chinese, English, Japanese or Korean brief naming real Miuix composables (`OverlayDialog`, `SwitchPreference`, …). Target Compose Multiplatform (default), Android, or CMP Web.
- **Optional AI helper** — OpenAI, Claude, Gemini, DeepSeek, or a custom OpenAI / Claude-compatible endpoint writes a part or screen note. The key stays in the browser.
- **Tidy, layers, guides, undo/redo**, 4dp grid, compressed share links, JSON and PNG.
- **Reset canvas** — replace the current design with the sample (undo brings it back).

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

JDK 21 and Node.js 22+ are required. The build compiles the Compose Wasm renderer first, then exports the Next.js editor.

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

Miuix itself is Apache-2.0. The renderer links the published Miuix libraries and includes the attributed, Apache-2.0 liquid-glass example sources listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
