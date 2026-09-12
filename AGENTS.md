# Miuix Canvas

Browser canvas for sketching [Miuix](https://github.com/compose-miuix-ui/miuix) (HyperOS-style Compose Multiplatform) screens and turning them into prompts for AI coding tools.

## Stack

- Next.js static export (`output: "export"`)
- React 19 + TypeScript
- Tailwind CSS 4
- Compose Web/Wasm renderer (Kotlin 2.4.20, Compose 1.12.0)
- Published Miuix 0.9.4-rc01 libraries
- No server. Documents live in `localStorage` (`miuix:doc`).

## Layout

- `lib/types.ts`, `lib/tokens.ts` — document model and part specs
- `renderer/` — actual Miuix Compose Web/Wasm renderer
- `components/OfficialMiuixFrame.tsx` — live preview iframe
- `components/OfficialMiuixStills.tsx` — one Wasm iframe for editor stills
- `lib/color.ts` — editor chrome colors only; rendered screens use MiuixTheme
- `lib/layout.ts` — magnetic preference joins, guides, phone/desktop conversion
- `lib/prompt.ts` — natural-language export (zh / en)
- `lib/ai.ts` — optional browser-side helper (author's own key)
- `components/Editor.tsx` — canvas, history, IO

## Conventions

- Comments and code in English. UI strings go through `lib/i18n.ts` (zh / en / ja / ko).
- User-facing docs: `README.md` (English) and `README_CN.md` (Chinese).
- Parts must map to real Miuix composables (`Button`, `SwitchPreference`, …), not Material 3.
- Do not add React/CSS facsimiles of Miuix components. Renderer failures must be visible errors, not fallback sketches.
- Default seed is `#3482FF`. Cards and preferences sit on white `surfaceContainer` over gray `surface`.
