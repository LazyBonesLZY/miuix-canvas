# Miuix Canvas

Browser canvas for sketching [Miuix](https://github.com/compose-miuix-ui/miuix) (HyperOS-style Compose Multiplatform) screens and turning them into prompts for AI coding tools.

## Stack

- Next.js static export (`output: "export"`)
- React 19 + TypeScript
- Tailwind CSS 4
- No server. Documents live in `localStorage` (`miuix:doc`).

## Layout

- `lib/types.ts`, `lib/tokens.ts` — document model and part specs (every kind maps to a real Miuix composable)
- `lib/color.ts` — Miuix light/dark surfaces + seed-shifted primary
- `lib/layout.ts` — magnetic preference joins, guides, phone/desktop conversion
- `lib/prompt.ts` — natural-language export (zh / en)
- `lib/ai.ts` — optional browser-side helper (author's own key)
- `components/MiuixNode.tsx` — on-canvas HyperOS look
- `components/Editor.tsx` — canvas, history, IO

## Conventions

- Comments and code in English. UI strings go through `lib/i18n.ts` (zh / en / ja / ko).
- User-facing docs: `README.md` (English) and `README_CN.md` (Chinese).
- Parts must map to real Miuix composables (`Button`, `SwitchPreference`, …), not Material 3.
- Default seed is `#3482FF`. Cards and preferences sit on white `surfaceContainer` over gray `surface`.
