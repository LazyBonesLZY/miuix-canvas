import type { Item, Screen } from "./types";
import { MARGIN, frameSize, isPref } from "./types";

export function tidyScreen(screen: Screen): Screen {
  const { w, h } = frameSize(screen.preset);
  const items = screen.items.map((it) => ({ ...it }));
  const used = new Set<string>();

  const place = (kind: Item["kind"], x: number, y: number, width?: number) => {
    const it = items.find((i) => i.kind === kind && !used.has(i.id));
    if (!it) return;
    it.x = x;
    it.y = y;
    if (width !== undefined) it.w = width;
    used.add(it.id);
  };

  place("topAppBar", 0, 0, w);
  const top = items.find((i) => i.kind === "topAppBar");
  let y = (top ? top.h : 28) + 8;
  place("searchBar", MARGIN, y, w - MARGIN * 2);
  const search = items.find((i) => i.kind === "searchBar");
  if (search) y = search.y + search.h + 12;

  place("navigationBar", 0, h - 64, w);
  const nav = items.find((i) => i.kind === "navigationBar");
  const rail = items.find((i) => i.kind === "navigationRail");
  if (rail) {
    rail.x = 0;
    rail.y = top ? top.h : 0;
    rail.h = (nav ? nav.y : h) - rail.y;
    used.add(rail.id);
  }
  const fab = items.find((i) => i.kind === "fab");
  if (fab) {
    fab.x = w - MARGIN - fab.w;
    fab.y = (nav ? nav.y : h) - MARGIN - fab.h;
    used.add(fab.id);
  }
  const floating = items.find((i) => i.kind === "floatingNav");
  if (floating) {
    floating.x = Math.round((w - floating.w) / 2);
    floating.y = (nav ? nav.y : h) - MARGIN - floating.h;
    used.add(floating.id);
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
  const sheet = items.find((i) => i.kind === "bottomSheet");
  if (sheet) {
    sheet.x = 0;
    sheet.w = w;
    sheet.y = h - sheet.h;
    used.add(sheet.id);
  }
  const bar = items.find((i) => i.kind === "scrollBar");
  if (bar) {
    bar.x = w - 14;
    bar.y = (top ? top.h : 40) + 16;
    used.add(bar.id);
  }

  const rest = items
    .filter((i) => !used.has(i.id) && i.kind !== "badge")
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const left = rail ? rail.w + 8 : MARGIN;
  const width = w - left - MARGIN;
  const hang = new Set(["button", "iconButton", "switch", "checkbox", "radio", "icon", "pullToRefresh", "tooltip", "listPopup", "cascadingPopup", "dropdownMenu", "floatingToolbar"]);
  const stretch = (it: Item) =>
    isPref(it.kind) ||
    ["card", "textField", "dropdown", "tabRow", "smallTitle", "slider", "rangeSlider", "progress", "image", "surface", "divider", "breadcrumb", "text", "colorPicker", "colorPalette"].includes(it.kind);
  for (const it of rest) {
    if (!hang.has(it.kind)) {
      it.x = left;
      if (stretch(it) && it.variant !== "vertical" && it.variant !== "circular" && it.variant !== "infinite") {
        it.w = width;
      }
    }
    it.y = y;
    y += it.h + (it.kind === "smallTitle" ? 4 : isPref(it.kind) ? 0 : 12);
  }
  return { ...screen, items };
}
