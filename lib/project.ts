import type { Doc } from "./types";

export function isProject(value: unknown): value is Doc {
  if (!value || typeof value !== "object") return false;
  const v = value as Doc;
  return v.version === 1 && Array.isArray(v.screens);
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
    return isProject(next) ? next : null;
  } catch {
    return null;
  }
}
