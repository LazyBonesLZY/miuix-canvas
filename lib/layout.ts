import { KIND_SPEC } from "./tokens";
import type { FramePreset, Guide, Item, Join, Screen } from "./types";
import { GUIDE_PX, MAGNET, frameSize, isPref, onGrid, uid } from "./types";

export function prefJoin(items: Item[], it: Item): Join {
  if (!isPref(it.kind)) return { top: false, bottom: false };
  const above = items.some((other) => other.id !== it.id && isPref(other.kind) && Math.abs(other.x - it.x) < 8 && Math.abs(other.y + other.h - it.y) < 4);
  const below = items.some((other) => other.id !== it.id && isPref(other.kind) && Math.abs(other.x - it.x) < 8 && Math.abs(it.y + it.h - other.y) < 4);
  return { top: above, bottom: below };
}

export function snapMove(moving: Item, others: Item[], x: number, y: number): { x: number; y: number; guide: Guide | null } {
  let nx = onGrid(x);
  let ny = onGrid(y);
  const guide: Guide = {};

  for (const other of others) {
    if (isPref(moving.kind) && isPref(other.kind)) {
      if (Math.abs(other.x - nx) < MAGNET) {
        nx = other.x;
        guide.gx = other.x;
      }
      if (Math.abs(other.y + other.h - ny) < MAGNET) {
        ny = other.y + other.h;
        nx = other.x;
        guide.gy = ny;
      }
      if (Math.abs(ny + moving.h - other.y) < MAGNET) {
        ny = other.y - moving.h;
        nx = other.x;
        guide.gy = other.y;
      }
    }
    if (Math.abs(other.x - nx) <= GUIDE_PX) {
      nx = other.x;
      guide.gx = other.x;
    }
    if (Math.abs(other.y - ny) <= GUIDE_PX) {
      ny = other.y;
      guide.gy = other.y;
    }
    if (Math.abs(other.x + other.w - (nx + moving.w)) <= GUIDE_PX) {
      nx = other.x + other.w - moving.w;
      guide.gx = other.x + other.w;
    }
  }

  const has = guide.gx !== undefined || guide.gy !== undefined;
  return { x: nx, y: ny, guide: has ? guide : null };
}

export function convertPreset(screen: Screen, preset: FramePreset): Screen {
  if (screen.preset === preset) return screen;
  const size = frameSize(preset);
  const items = screen.items.map((it) => {
    let next = { ...it };
    if (preset === "desktop" && it.kind === "navigationBar") {
      next = { ...next, kind: "navigationRail", w: 80, h: size.h - 88, x: 0, y: screen.items.find((x) => x.kind === "topAppBar")?.h ?? 0 };
    } else if (preset === "phone" && it.kind === "navigationRail") {
      next = { ...next, kind: "navigationBar", w: size.w, h: 64, x: 0, y: size.h - 64 };
    } else if (KIND_SPEC[it.kind].edge === "top" || KIND_SPEC[it.kind].edge === "bottom") {
      next.w = size.w;
      if (it.kind === "navigationBar" || it.kind === "bottomSheet") next.y = size.h - next.h;
    }
    return next;
  });
  return { ...screen, preset, items };
}

export function duplicateItem(it: Item): Item {
  return { ...it, id: uid(), x: it.x + 16, y: it.y + 16, tabs: it.tabs?.map((tab) => ({ ...tab })) };
}

export function moveLayer(items: Item[], id: string, dir: 1 | -1): Item[] {
  const i = items.findIndex((it) => it.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= items.length) return items;
  const next = [...items];
  const [row] = next.splice(i, 1);
  next.splice(j, 0, row);
  return next;
}

export type FlowLink = { from: string; to: string; label: string };

export function flowLinks(screen: Screen): FlowLink[] {
  const links: FlowLink[] = [];
  for (const it of screen.items) {
    if (it.to) links.push({ from: it.id, to: it.to, label: it.label || it.kind });
    for (const tab of it.tabs ?? []) {
      if (tab.to) links.push({ from: it.id, to: tab.to, label: tab.label || it.label });
    }
  }
  for (const [dir, to] of Object.entries(screen.swipe ?? {})) {
    if (to) links.push({ from: screen.id, to, label: dir });
  }
  return links;
}
