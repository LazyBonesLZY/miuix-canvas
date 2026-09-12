import { KIND_SET } from "./tokens";
import type { Doc, Item, Screen } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const validItem = (value: unknown): value is Item =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.kind === "string" &&
  typeof value.label === "string" &&
  Number.isFinite(value.x) &&
  Number.isFinite(value.y) &&
  Number.isFinite(value.w) &&
  Number.isFinite(value.h);

const validScreen = (value: unknown): value is Screen =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  Number.isFinite(value.x) &&
  Number.isFinite(value.y) &&
  (value.preset === "phone" || value.preset === "desktop") &&
  Array.isArray(value.items) &&
  value.items.every(validItem);

export function isProject(value: unknown): value is Doc {
  return (
    isRecord(value) &&
    value.version === 1 &&
    typeof value.title === "string" &&
    (value.platform === "cmp" || value.platform === "android" || value.platform === "web") &&
    isRecord(value.theme) &&
    Array.isArray(value.screens) &&
    value.screens.every(validScreen)
  );
}

function migrateItem(it: Item): Item {
  if (it.kind === "floatingNav" && (it.variant === "glass" || it.h === 64)) {
    return { ...it, variant: undefined, w: 280, h: 52, x: it.w === 364 || it.w === 380 ? Math.round(it.x + (it.w - 280) / 2) : it.x };
  }
  if (it.kind === "navigationBar" && (it.variant === "blur" || it.variant === "default" || !it.variant)) {
    return { ...it, variant: "iconAndText" };
  }
  return it;
}

export function migrateDoc(doc: Doc): Doc {
  return {
    ...doc,
    screens: doc.screens.map((screen) => ({
      ...screen,
      items: screen.items.filter((it) => KIND_SET.has(it.kind)).map(migrateItem),
    })),
  };
}

export function projectFileName(doc: Doc) {
  const name = doc.title
    .trim()
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return name ? `miuix-canvas ${name}.json` : "miuix-canvas.json";
}

export function saveProject(doc: Doc) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = projectFileName(doc);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function readProject(file: File): Promise<Doc | null> {
  try {
    const next: unknown = JSON.parse(await file.text());
    return isProject(next) ? migrateDoc(next) : null;
  } catch {
    return null;
  }
}
