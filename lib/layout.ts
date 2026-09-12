import { KIND_SPEC } from "./tokens";
import type { FramePreset, Guide, Item, Join, Screen } from "./types";
import { BEZEL, FRAME_LABEL_H, GESTURE_H, GUIDE_PX, MAGNET, MARGIN, STATUS_BAR_H, clamp, frameSize, isPref, onGrid, uid } from "./types";

export type CanvasView = { x: number; y: number; z: number };

export function canvasBounds(screens: Screen[]) {
  if (!screens.length) return { x: 0, y: 0, w: 412, h: 932 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const screen of screens) {
    const { w, h } = frameSize(screen.preset);
    const fw = w + BEZEL * 2;
    const fh = h + BEZEL * 2 + FRAME_LABEL_H;
    minX = Math.min(minX, screen.x);
    minY = Math.min(minY, screen.y);
    maxX = Math.max(maxX, screen.x + fw);
    maxY = Math.max(maxY, screen.y + fh);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function fitView(screens: Screen[], vw: number, vh: number, zMin = 0.2, zMax = 2.4, pad = 56): CanvasView {
  const b = canvasBounds(screens);
  const z = clamp(Math.min((vw - pad * 2) / Math.max(b.w, 1), (vh - pad * 2) / Math.max(b.h, 1)), zMin, zMax);
  return {
    x: (vw - b.w * z) / 2 - b.x * z,
    y: (vh - b.h * z) / 2 - b.y * z,
    z,
  };
}

export function zoomAt(view: CanvasView, z: number, cx: number, cy: number): CanvasView {
  const wx = (cx - view.x) / view.z;
  const wy = (cy - view.y) / view.z;
  return { z, x: cx - wx * z, y: cy - wy * z };
}

export function centerViewOnScreen(screen: Screen, vw: number, vh: number, z: number): CanvasView {
  const { w, h } = frameSize(screen.preset);
  const fw = w + BEZEL * 2;
  const fh = h + BEZEL * 2 + FRAME_LABEL_H;
  const cx = screen.x + fw / 2;
  const cy = screen.y + fh / 2;
  return { z, x: vw / 2 - cx * z, y: vh / 2 - cy * z };
}

export function centerItem(it: Item, screen: Screen, axis: "x" | "y" | "both"): { x: number; y: number } {
  const { w, h } = frameSize(screen.preset);
  const spec = KIND_SPEC[it.kind];
  let x = it.x;
  let y = it.y;
  if ((axis === "x" || axis === "both") && spec.edge !== "start") {
    x = spec.edge === "top" || spec.edge === "bottom" ? 0 : Math.round((w - it.w) / 2);
  }
  if ((axis === "y" || axis === "both") && spec.edge !== "top" && spec.edge !== "bottom") {
    y = Math.round((h - it.h) / 2);
  }
  return { x, y };
}

export function previewScale(w: number, h: number, vw: number, vh: number) {
  return Math.min(1, (vw - 48) / w, (vh - 120) / h);
}

export function pinItem(it: Item, screen: Screen, edge: "left" | "right" | "top" | "bottom"): { x: number; y: number } {
  const { w, h } = frameSize(screen.preset);
  const spec = KIND_SPEC[it.kind];
  let x = it.x;
  let y = it.y;
  if (edge === "left") x = spec.edge === "top" || spec.edge === "bottom" ? 0 : MARGIN;
  if (edge === "right") x = spec.edge === "top" || spec.edge === "bottom" ? 0 : w - it.w - MARGIN;
  if (edge === "top") y = spec.edge === "top" ? 0 : MARGIN + STATUS_BAR_H;
  if (edge === "bottom") y = spec.edge === "bottom" ? h - it.h : h - it.h - MARGIN - GESTURE_H;
  return { x, y };
}

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
    } else if (it.kind === "floatingNav") {
      next.x = Math.round((size.w - next.w) / 2);
      next.y = size.h - 64 - 16 - next.h;
    } else if (it.kind === "snackbar") {
      next.w = size.w - MARGIN * 2;
      next.x = MARGIN;
      next.y = size.h - 64 - MARGIN - next.h;
    } else if (it.kind === "dialog") {
      next.x = Math.round((size.w - next.w) / 2);
      next.y = Math.round((size.h - next.h) / 2);
    } else if (it.kind === "fab") {
      next.x = size.w - MARGIN - next.w;
      next.y = size.h - 64 - MARGIN - next.h;
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
