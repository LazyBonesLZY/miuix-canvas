import { describe, expect, it } from "vitest";
import { defaultDoc } from "./doc";
import { decodeShare, encodeShare, readShareHash } from "./share";

describe("share", () => {
  it("round-trips a document", () => {
    const doc = defaultDoc("zh");
    const again = decodeShare(encodeShare(doc));
    expect(again?.title).toBe(doc.title);
    expect(again?.screens.length).toBe(doc.screens.length);
  });

  it("reads an uncompressed #d= base64 hash", async () => {
    const doc = defaultDoc("en");
    const again = await readShareHash(`#d=${encodeShare(doc)}`);
    expect(again?.title).toBe(doc.title);
    expect(again?.screens.length).toBe(doc.screens.length);
  });
});
