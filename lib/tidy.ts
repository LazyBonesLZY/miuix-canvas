import { KIND_SPEC } from "./tokens";
import type { Item, Screen } from "./types";
import { MARGIN, frameSize, isPref } from "./types";

export function tidyScreen(screen: Screen): Screen {
  const { w, h } = frameSize(screen.preset);
  const items = screen.items.map((it) => ({ ...it }));
  const used = new Set<string>();

  const placeEdge = (kind: Item["kind"], x: number, y: number, width?: number) => {
    const it = items.find((i) => i.kind === kind && !used.has(i.id));
    if (!it) return;
    it.x = x;
    it.y = y;
    if (width !== undefined) it.w = width;
    used.add(it.id);
  };

  placeEdge("topAppBar", 0, 0, w);
  const top = items.find((i) => i.kind === "topAppBar");
  let y = (top ? top.h : 28) + 8;
  placeEdge("searchBar", MARGIN, y, w - MARGIN * 2);
  const search = items.find((i) => i.kind === "searchBar");
  if (search) y = search.y + search.h + 12;

  placeEdge("navigationBar", 0, h - 64, w);
  const nav = items.find((i) => i.kind === "navigationBar");
  const fab = items.find((i) => i.kind === "fab");
  if (fab) {
    fab.x = w - MARGIN - fab.w;
    fab.y = (nav ? nav.y : h) - MARGIN - fab.h;
    used.add(fab.id);
  }
  const snack = items.find((i) => i.kind === "snackbar");
  if (snack) {
    snack.x = MARGIN;
    snack.y = (nav ? nav.y : h) - MARGIN - snack.h;
    snack.w = w - MARGIN * 2;
    used.add(snack.id);
  }
  const dialog = items.find((i) => i.kind === "dialog");
  if (dialog) {
    dialog.x = Math.round((w - dialog.w) / 2);
    dialog.y = Math.round((h - dialog.h) / 2);
    used.add(dialog.id);
  }
  const rail = items.find((i) => i.kind === "navigationRail");
  if (rail) {
    rail.x = 0;
    rail.y = top ? top.h : 0;
    rail.h = (nav ? nav.y : h) - rail.y;
    used.add(rail.id);
  }

  const rest = items
    .filter((i) => !used.has(i.id) && i.kind !== "badge")
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const left = rail ? rail.w + 8 : MARGIN;
  const width = w - left - MARGIN;
  for (const it of rest) {
    const spec = KIND_SPEC[it.kind];
    const hang = spec.w === KIND_SPEC.button.w || it.kind === "iconButton" || it.kind === "switch" || it.kind === "checkbox" || it.kind === "radio" || it.kind === "icon" || it.kind === "pullToRefresh";
    if (!hang) {
      it.x = left;
      if (isPref(it.kind) || it.kind === "card" || it.kind === "textField" || it.kind === "dropdown" || it.kind === "tabRow" || it.kind === "smallTitle" || it.kind === "slider" || it.kind === "progress" || it.kind === "image" || it.kind === "surface" || it.kind === "divider" || it.kind === "breadcrumb" || it.kind === "text") {
        it.w = width;
      }
    }
    it.y = y;
    y += it.h + (it.kind === "smallTitle" ? 4 : isPref(it.kind) ? 0 : 12);
  }

  return { ...screen, items };
}
