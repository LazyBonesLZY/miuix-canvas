# Miuix Canvas agent notes

You are drafting a HyperOS / Miuix UI sketch for https://github.com/LazyBonesLZY/miuix-canvas.

1. Read the user's description of the app.
2. Produce a Miuix Canvas document JSON (`version: 1`) with `title`, `platform` (`cmp` | `android` | `web`), `theme` (`mode`, `seed`, `monet`) and `screens`.
3. Each screen has `id`, `name`, `x`, `y`, `preset` (`phone` | `desktop`) and `items`.
4. Each item has `id`, `kind`, `x`, `y`, `w`, `h`, `label`, and optional `supporting`, `icon`, `variant`, `checked`, `value`, `tabs`, `selected`, `note`, `to`, `transition`.
5. Use Miuix kinds only: `button`, `iconButton`, `fab`, `floatingToolbar`, `topAppBar`, `smallTitle`, `navigationBar`, `navigationRail`, `tabRow`, `searchBar`, `breadcrumb`, `card`, `surface`, `divider`, `snackbar`, `dialog`, `textField`, `switch`, `checkbox`, `radio`, `slider`, `dropdown`, `numberPicker`, `text`, `image`, `badge`, `icon`, `progress`, `pullToRefresh`, `switchPref`, `checkboxPref`, `radioPref`, `sliderPref`, `dropdownPref`, `arrowPref`.
6. Phone frames are 412×892. Keep 16dp side margins. Group preference rows. TopAppBar at y=0, NavigationBar at the bottom.
7. Reply with a share link: `{origin}/#d={base64url JSON}` after encoding the document the same way the canvas `encodeShare` helper does (UTF-8 bytes → base64url).
8. Do not use Material 3 components in the sketch or in the later implementation prompt.
