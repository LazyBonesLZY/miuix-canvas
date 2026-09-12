# Miuix Canvas

Browser canvas for sketching [Miuix](https://github.com/compose-miuix-ui/miuix) (HyperOS-style Compose Multiplatform) screens and turning them into prompts for AI coding tools.

## Stack

- Next.js static export (`output: "export"`)
- React 19 + TypeScript
- Tailwind CSS 4
- No server. Documents live in `localStorage` (`miuix:doc`).

## Layout

- `lib/types.ts`, `lib/tokens.ts` — document model and part specs
- `lib/color.ts` — Miuix light/dark surfaces + seed-shifted primary
- `lib/prompt.ts` — natural-language export (zh / en)
- `components/MiuixNode.tsx` — on-canvas HyperOS look
- `components/Editor.tsx` — canvas, history, IO

## Conventions

- Comments and code in English. UI strings go through `lib/i18n.ts` (zh + en).
- Parts must map to real Miuix composables (`Button`, `SwitchPreference`, …), not Material 3.
- Default seed is `#3482FF`. Cards and preferences sit on white `surfaceContainer` over gray `surface`.
