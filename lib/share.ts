import type { Doc } from "./types";

const PREFIX = "d=";

export function encodeShare(doc: Doc): string {
  const json = JSON.stringify(doc);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShare(raw: string): Doc | null {
  try {
    const pad = raw.length % 4 === 0 ? "" : "=".repeat(4 - (raw.length % 4));
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const doc = JSON.parse(json) as Doc;
    if (doc?.version === 1 && Array.isArray(doc.screens)) return doc;
  } catch {
    /* ignore */
  }
  return null;
}

export function hasShareHash() {
  if (typeof location === "undefined") return false;
  return location.hash.includes(PREFIX);
}

export function readShareHash(): Doc | null {
  if (typeof location === "undefined") return null;
  const hash = location.hash.replace(/^#/, "");
  const part = hash.split("&").find((p) => p.startsWith(PREFIX));
  if (!part) return null;
  return decodeShare(part.slice(PREFIX.length));
}

export function shareUrl(doc: Doc) {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#${PREFIX}${encodeShare(doc)}`;
}
