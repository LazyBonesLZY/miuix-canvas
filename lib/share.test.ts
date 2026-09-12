import { describe, expect, it } from "vitest";
import { defaultDoc } from "./doc";
import { decodeShare, encodeShare } from "./share";

describe("share", () => {
  it("round-trips a document", () => {
    const doc = defaultDoc("zh");
    const again = decodeShare(encodeShare(doc));
    expect(again?.title).toBe(doc.title);
    expect(again?.screens.length).toBe(doc.screens.length);
  });
});
