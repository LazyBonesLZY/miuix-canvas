import { describe, expect, it } from "vitest";
import { livePatch } from "./interact";
import type { Item } from "./types";

const base = (patch: Partial<Item>): Item => ({
  id: "i",
  kind: "switch",
  x: 0,
  y: 0,
  w: 49,
  h: 28,
  label: "",
  ...patch,
});

describe("livePatch", () => {
  it("toggles a switch", () => {
    expect(livePatch(base({ checked: false }), 0.5, 0.5)).toEqual({ checked: true });
  });

  it("sets a horizontal slider from the tap position", () => {
    expect(livePatch(base({ kind: "slider", value: 0.2 }), 0.8, 0.5)?.value).toBeCloseTo(0.8);
  });

  it("picks a tab from the x position", () => {
    const it = base({
      kind: "tabRow",
      tabs: [{ icon: "", label: "A" }, { icon: "", label: "B" }, { icon: "", label: "C" }],
    });
    expect(livePatch(it, 0.8, 0.5)).toEqual({ selected: 2 });
  });

  it("steps a number picker", () => {
    expect(livePatch(base({ kind: "numberPicker", label: "12" }), 0.5, 0.2)).toEqual({ label: "13" });
    expect(livePatch(base({ kind: "numberPicker", label: "12" }), 0.5, 0.9)).toEqual({ label: "11" });
  });

  it("picks a color swatch", () => {
    expect(livePatch(base({ kind: "colorPalette" }), 0.99, 0)).toEqual({ selected: 12 });
    expect(livePatch(base({ kind: "colorPalette" }), 0, 0.99)).toEqual({ selected: 78 });
  });

  it("moves the nearer RangeSlider thumb", () => {
    const it = base({ kind: "rangeSlider", from: 0.2, value: 0.8 });
    expect(livePatch(it, 0.1, 0.5)).toEqual({ from: 0.1 });
    expect(livePatch(it, 0.9, 0.5)?.value).toBeCloseTo(0.9);
  });

  it("cycles a dropdown from its tabs", () => {
    const it = base({
      kind: "dropdownPref",
      selected: 0,
      tabs: [{ icon: "", label: "A" }, { icon: "", label: "B" }],
    });
    expect(livePatch(it, 0.5, 0.5)).toEqual({ selected: 1, supporting: "B" });
  });
});
