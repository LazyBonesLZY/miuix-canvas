# Miuix Canvas agent notes

You are drafting a HyperOS / Miuix UI sketch for https://github.com/LazyBonesLZY/miuix-canvas.

1. Read the user's description of the app.
2. Produce a Miuix Canvas document JSON (`version: 1`) with `title`, `platform` (`cmp` | `android` | `web`), `theme` (`mode`, `seed`, `monet`) and `screens`.
3. Each screen has `id`, `name`, `x`, `y`, `preset` (`phone` | `desktop`), optional `swipe` (`left`/`right`/`up`/`down` → screen id), and `items`.
4. Each item has `id`, `kind`, `x`, `y`, `w`, `h`, `label`, and optional `supporting`, `icon`, `variant`, `checked`, `value`, `tabs`, `selected`, `note`, `to`, `transition`.
5. Tabs may include `to` and `transition` for destination screens.
6. Use Miuix kinds only: `button`, `iconButton`, `fab`, `floatingToolbar`, `topAppBar`, `smallTitle`, `navigationBar`, `navigationRail`, `tabRow`, `searchBar`, `breadcrumb`, `card`, `surface`, `divider`, `snackbar`, `dialog`, `bottomSheet`, `listPopup`, `tooltip`, `textField`, `switch`, `checkbox`, `radio`, `slider`, `dropdown`, `numberPicker`, `colorPicker`, `colorPalette`, `text`, `image`, `badge`, `icon`, `progress`, `pullToRefresh`, `scrollBar`, `switchPref`, `checkboxPref`, `radioPref`, `sliderPref`, `dropdownPref`, `arrowPref`.
7. Phone frames are 412×892. Keep 16dp side margins. Stack preference rows so they join into one Card. TopAppBar at y=0, NavigationBar at the bottom.
8. Reply with a share link after encoding with deflate-raw + base64url as `#dz=...` (see `lib/share.ts`).
9. Do not use Material 3 components in the sketch or in the later implementation prompt. Dialogs are OverlayDialog, sheets are OverlayBottomSheet.
