import { describe, expect, it } from "vitest";
import { parseRendererEvent, renderRequest } from "./renderer";
import { defaultDoc } from "./doc";

describe("renderer bridge", () => {
  it("serializes a screen for the official Miuix renderer", () => {
    const doc = defaultDoc("zh");
    const request = renderRequest(doc.screens[0], doc.theme, "zh", true, doc.screens);
    expect(request).toMatchObject({
      type: "render",
      interactive: true,
      lang: "zh",
      screen: { id: doc.screens[0].id },
      currentScreenId: doc.screens[0].id,
    });
    expect(request.screens?.map((screen) => screen.id)).toEqual(doc.screens.map((screen) => screen.id));
  });

  it("replaces non-finite geometry before the Wasm decoder sees it", () => {
    const doc = defaultDoc("en");
    const broken = {
      ...doc.screens[0],
      x: Number.NaN,
      items: [{ ...doc.screens[0].items[0], w: Number.POSITIVE_INFINITY, value: Number.NaN }],
    };
    const request = renderRequest(broken, doc.theme, "en", false);
    expect(Number.isFinite(request.screen.x)).toBe(true);
    expect(request.screen.items[0].w).toBe(1);
    expect(request.screen.items[0].value).toBe(0);
  });

  it("accepts only JSON renderer events", () => {
    expect(parseRendererEvent('{"type":"patch","itemId":"a","checked":true}')).toEqual({
      type: "patch",
      itemId: "a",
      checked: true,
    });
    expect(parseRendererEvent({ type: "patch" })).toBeNull();
    expect(parseRendererEvent("not json")).toBeNull();
  });
});
