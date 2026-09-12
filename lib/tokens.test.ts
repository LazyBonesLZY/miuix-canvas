import { describe, expect, it } from "vitest";
import { LANGS } from "./types";
import { KIND_TEXT } from "./i18n";
import { KIND_ORDER, KIND_SPEC, KIND_SET, composableOf, makeItem } from "./tokens";

describe("KIND_SPEC coverage", () => {
  it("has a spec, localized name, and composable for every kind", () => {
    for (const kind of KIND_ORDER) {
      expect(KIND_SPEC[kind].kind).toBe(kind);
      expect(KIND_SPEC[kind].composable.length).toBeGreaterThan(0);
      for (const { key } of LANGS) {
        expect(KIND_TEXT[key][kind].length).toBeGreaterThan(0);
      }
    }
    expect(KIND_SET.size).toBe(KIND_ORDER.length);
  });

  it("uses official Miuix default sizes", () => {
    expect(KIND_SPEC.switch).toMatchObject({ w: expect.any(Function), h: 28 });
    expect(KIND_SPEC.switch.w("phone")).toBe(49);
    expect(KIND_SPEC.checkbox.h).toBe(26);
    expect(KIND_SPEC.radio.h).toBe(26);
    expect(KIND_SPEC.fab.h).toBe(60);
    expect(KIND_SPEC.iconButton.h).toBe(40);
    expect(KIND_SPEC.searchBar.h).toBe(45);
    expect(KIND_SPEC.tabRow.h).toBe(42);
    expect(KIND_SPEC.slider.h).toBe(28);
    expect(KIND_SPEC.button.variants?.[0]).toBe("secondary");
  });

  it("maps variants to the real composable names", () => {
    expect(composableOf({ kind: "dialog", variant: "window" })).toBe("WindowDialog");
    expect(composableOf({ kind: "dialog", variant: "overlay" })).toBe("OverlayDialog");
    expect(composableOf({ kind: "tabRow", variant: "contour" })).toBe("TabRowWithContour");
    expect(composableOf({ kind: "slider", variant: "vertical" })).toBe("VerticalSlider");
    expect(composableOf({ kind: "progress", variant: "infinite" })).toBe("InfiniteProgressIndicator");
  });

  it("creates a gray default Button like Miuix ButtonDefaults.buttonColors()", () => {
    const item = makeItem("button", "phone", "zh", 0, 0);
    expect(item.variant).toBe("secondary");
    expect(item.h).toBe(50);
  });
});
