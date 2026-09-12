import { describe, expect, it } from "vitest";
import { parseRendererEvent, rendererBoot, renderRequest } from "./renderer";
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

  it("turns null labels into empty strings so Kotlin can decode the screen", () => {
    const doc = defaultDoc("en");
    const broken = {
      ...doc.screens[0],
      items: [{ ...doc.screens[0].items.at(-1)!, label: null as unknown as string, variant: null as unknown as string }],
    };
    const request = renderRequest(broken, doc.theme, "en", false);
    expect(request.screen.items[0].label).toBe("");
    expect(request.screen.items[0].variant).toBeUndefined();
    expect(JSON.stringify(request)).not.toContain('"label":null');
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

  it("drops null tabs so Kotlin can decode navigation rows", () => {
    const doc = defaultDoc("en");
    const broken = {
      ...doc.screens[0],
      items: [{ ...doc.screens[0].items.at(-1)!, tabs: [null, { icon: "home", label: "Home" }] as unknown as typeof doc.screens[0]["items"][number]["tabs"] }],
    };
    const request = renderRequest(broken, doc.theme, "en", false);
    expect(request.screen.items[0].tabs).toEqual([{ icon: "home", label: "Home" }]);
  });

  it("starts a deferred renderer as soon as the screen is selected", () => {
    expect(rendererBoot("", 900)).toBe("later");
    expect(rendererBoot("", 0)).toBe("now");
    expect(rendererBoot("/renderer/index.html", 0)).toBe("keep");
  });
});
