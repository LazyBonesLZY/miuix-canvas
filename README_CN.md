# Miuix Canvas

在浏览器中拼装 [Miuix](https://github.com/compose-miuix-ui/miuix)（HyperOS 风格 Compose Multiplatform）界面，把屏幕连起来、点一点试试，然后直接变成给 AI 编程工具的提示词。

工作流参考 [M3E Canvas](https://github.com/lnkiai/m3e-canvas)，但部件、配色和提示词都面向 Miuix，而不是 Material 3 Expressive。

**English:** [README.md](./README.md)

**在线版本：** https://lazyboneslzy.github.io/miuix-canvas/

可配合 Cursor、Claude Code、Codex、Gemini CLI 等任何接受提示词的工具：复制提示词，贴进去，让它用 Miuix 把应用做出来。

## 功能

- **拖放 Miuix 部件** — Button、IconButton、FAB、FloatingToolbar、TopAppBar、SmallTitle、NavigationBar、FloatingNavigationBar、NavigationRail、TabRow / TabRowWithContour、SearchBar、BreadcrumbBar、Card、Surface、HorizontalDivider / VerticalDivider、Snackbar、OverlayDialog / WindowDialog、OverlayBottomSheet / WindowBottomSheet、OverlayListPopup / WindowListPopup、OverlayCascadingListPopup / WindowCascadingListPopup、OverlayDropdownMenu / WindowDropdownMenu、OverlayIconDropdownMenu / WindowIconDropdownMenu、OverlayIconCascadingDropdownMenu / WindowIconCascadingDropdownMenu、Tooltip / RichTooltipBox、TextField、Switch、Checkbox、RadioButton、Slider / VerticalSlider、RangeSlider、Dropdown、NumberPicker、ColorPicker、ColorPalette、Text、Image、Badge、Icon、Linear / Circular / Infinite ProgressIndicator、PullToRefresh、Vertical / Horizontal ScrollBar。
- **Preference 行** — BasicComponent、SwitchPreference、CheckboxPreference、RadioButtonPreference、SliderPreference、RangeSliderPreference、OverlayDropdownPreference / WindowDropdownPreference、OverlaySpinnerPreference / WindowSpinnerPreference、ArrowPreference。相邻行会磁吸拼成一张 HyperOS Card。
- **手机和桌面屏幕** — 412×892 手机、1280×800 桌面。切换尺寸时 NavigationBar 会和 NavigationRail 互转。
- **编辑器三端适配** — 手机用底栏 + 底部面板；平板用左侧图标轨 + 一块停靠面板；电脑左右分栏。安全区、紧凑工具栏和预览缩放会跟着视口走。
- **点击和滑动跳转** — 部件、导航项、屏幕滑动都可以打开另一屏。预览会播过渡；画布上有流程箭头。
- **主题** — 浅色 / 深色、种子色（默认 `#3482FF`）、Monet。表面色保持 HyperOS，主色随种子色偏移。
- **提示词** — 中 / 英 / 日 / 韩，会写出真实的 Miuix composable 名（`OverlayDialog`、`SwitchPreference` 等）。目标可以是 Compose Multiplatform（默认）、Android 或 CMP Web。
- **可选 AI 辅助** — 填自己的 OpenAI / Claude / Gemini / DeepSeek 密钥写行为说明。密钥只留在浏览器里。
- **整理、图层、对齐线、撤销/重做**，4dp 网格，压缩分享链接，JSON 和 PNG。
- **重置画布** — 换成示例稿（可用撤销找回）。

## 快捷键

| 按键 | 作用 |
| --- | --- |
| `V` / `H` | 选择 / 抓手（按住 `Space` 平移） |
| 滚轮、`Ctrl` + 滚轮 | 平移、缩放 |
| `F` / `0` | 适应全部屏幕 |
| 双击画布 | 适应全部，或居中你点到的屏幕 |
| `1` | 缩放 100% |
| `C` | 居中选中部件，或居中当前屏幕 |
| `Shift+C` / `Alt+C` | 水平 / 垂直居中 |
| `[` / `]` | 吸到 16dp 左右边距 |
| `Shift+[` / `]` | 吸到上下边距 |
| `+` `-` | 放大 / 缩小 |
| `Ctrl+Z` / `Ctrl+Shift+Z` | 撤销 / 重做 |
| `Ctrl+D` | 复制部件 |
| `Delete` | 删除部件或屏幕 |
| `P` | 预览 |
| `?` | 快捷键说明 |
| `Esc` | 关闭预览、帮助或面板 |

## 开发

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 静态导出到 ./out
npm test
```

应用是 Next.js 静态导出。如果要挂在子路径下（例如 GitHub Pages 项目站），构建时设置 `NEXT_PUBLIC_BASE_PATH=/your-repo`。`.github/workflows/deploy.yml` 会在每次推送到 `main` 时自动带上这个变量，并把 `out/` 发布到 GitHub Pages。

## 另见

- [compose-miuix-ui/miuix](https://github.com/compose-miuix-ui/miuix) — 这套画板所对应的 Compose Multiplatform 组件库
- [lnkiai/m3e-canvas](https://github.com/lnkiai/m3e-canvas) — 启发工作流的 Material 3 Expressive 画板

## 许可证

MIT © LazyBonesLZY

Miuix 本身是 Apache-2.0。本项目只在浏览器里重做外观供草图使用，不内嵌 Kotlin 源码。
