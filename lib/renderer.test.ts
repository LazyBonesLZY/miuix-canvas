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
