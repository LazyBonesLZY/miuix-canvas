import { KIND_SET } from "./tokens";
import type { Doc, FramePreset, Item, Screen } from "./types";
import { frameSize } from "./types";

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
    (value.version === 1 || value.version === 2 || value.version === 3) &&
    typeof value.title === "string" &&
    (value.platform === "cmp" || value.platform === "android" || value.platform === "web") &&
    isRecord(value.theme) &&
    Array.isArray(value.screens) &&
    value.screens.every(validScreen)
  );
}

function defaultSlot(it: Item): Item["slot"] {
  if (it.kind === "topAppBar") return "topBar";
  if (it.kind === "navigationBar" || it.kind === "floatingNav") return "bottomBar";
  if (it.kind === "fab") return "floatingActionButton";
  if (it.kind === "floatingToolbar") return "floatingToolbar";
  if (it.kind === "snackbar") return "snackbarHost";
  if (["dialog", "bottomSheet", "listPopup", "cascadingPopup", "dropdownMenu", "iconDropdownMenu", "iconCascadingMenu"].includes(it.kind)) return "overlay";
  return "content";
}

function migrateItem(it: Item, preset: FramePreset): Item {
  const base: Item = {
    ...it,
    label: typeof it.label === "string" ? it.label : "",
    variant: it.variant ?? undefined,
    enabled: it.enabled ?? true,
    show: it.show ?? true,
    slot: it.slot ?? defaultSlot(it),
  };
  if (
    it.kind === "floatingNav" &&
    (it.variant === "iosLike" || it.variant === "glass" || (!it.variant && it.h >= 90))
  ) {
    const size = frameSize(preset);
    return { ...base, variant: "iosLike", x: 0, y: size.h - 100, w: size.w, h: 100 };
  }
  if (it.kind === "navigationBar" && it.variant === "blur") {
    return { ...base, variant: "iconAndText", effect: "textureBlur" };
  }
  if ((it.kind === "navigationBar" || it.kind === "floatingNav") && it.variant === "textureBlur") {
    return {
      ...base,
      variant: it.kind === "navigationBar" ? "iconAndText" : "default",
      effect: "textureBlur",
    };
  }
  if (it.kind === "navigationBar" && (it.variant === "default" || !it.variant)) {
    return { ...base, variant: "iconAndText" };
  }
  return base;
}

export function migrateDoc(doc: Doc): Doc {
  const fromVersion = typeof doc.version === "number" ? doc.version : 1;
  return {
    ...doc,
    version: 3,
    theme: {
      ...doc.theme,
      monet: fromVersion >= 3 ? Boolean(doc.theme.monet) : false,
    },
    screens: doc.screens.map((screen) => ({
      ...screen,
      items: screen.items.filter((it) => KIND_SET.has(it.kind)).map((it) => migrateItem(it, screen.preset)),
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
