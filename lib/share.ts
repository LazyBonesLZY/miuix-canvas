import { isProject } from "./project";
import type { Doc } from "./types";

const DOC = "d";
const DOCZ = "dz";

const toBase64Url = (bytes: Uint8Array) => {
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (raw: string) => {
  const pad = raw.length % 4 === 0 ? "" : "=".repeat(4 - (raw.length % 4));
  const bin = atob(raw.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function pipe(bytes: Uint8Array, stream: { readable: ReadableStream; writable: WritableStream }) {
  const writer = stream.writable.getWriter();
  writer.write(bytes).catch(() => {});
  writer.close().catch(() => {});
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

export function encodeShare(doc: Doc): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(doc)));
}

export function decodeShare(raw: string): Doc | null {
  try {
    const json = new TextDecoder().decode(fromBase64Url(raw));
    const doc = JSON.parse(json) as unknown;
    return isProject(doc) ? doc : null;
  } catch {
    return null;
  }
}

export function hasShareHash(hash = typeof location === "undefined" ? "" : location.hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return params.has(DOCZ) || params.has(DOC) || hash.includes("d=");
}

export async function readShareHash(hash = typeof location === "undefined" ? "" : location.hash): Promise<Doc | null> {
  const raw = hash.replace(/^#/, "");
  const params = new URLSearchParams(raw);
  try {
    const packed = params.get(DOCZ);
    if (packed && typeof DecompressionStream !== "undefined") {
      const bytes = await pipe(fromBase64Url(packed), new DecompressionStream("deflate-raw"));
      const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
      return isProject(value) ? value : null;
    }
    const plain = params.get(DOC);
    if (plain) {
      const value: unknown = JSON.parse(plain.startsWith("{") ? plain : decodeURIComponent(plain));
      return isProject(value) ? value : null;
    }
    const legacy = raw.split("&").find((part) => part.startsWith("d=") && !part.startsWith("dz="));
    if (legacy) return decodeShare(legacy.slice(2));
  } catch {
    /* ignore */
  }
  return null;
}

export async function shareUrl(doc: Doc) {
  const base = `${location.origin}${location.pathname}`;
  const json = JSON.stringify(doc);
  if (typeof CompressionStream !== "undefined") {
    const packed = await pipe(new TextEncoder().encode(json), new CompressionStream("deflate-raw"));
    return `${base}#${DOCZ}=${toBase64Url(packed)}`;
  }
  return `${base}#${DOC}=${encodeShare(doc)}`;
}

export function consumeShareHash() {
  if (typeof history === "undefined") return;
  history.replaceState(null, "", `${location.pathname}${location.search}`);
}
