import { describe, expect, it } from "vitest";
import { centerItem, convertPreset, fitView, pinItem, prefJoin, previewScale, snapMove } from "./layout";
import type { Item, Screen } from "./types";

const pref = (id: string, y: number): Item => ({
  id,
  kind: "switchPref",
  x: 16,
  y,
  w: 380,
  h: 64,
  label: id,
});

describe("prefJoin", () => {
  it("joins stacked preference rows", () => {
    const items = [pref("a", 100), pref("b", 164)];
    expect(prefJoin(items, items[0])).toEqual({ top: false, bottom: true });
    expect(prefJoin(items, items[1])).toEqual({ top: true, bottom: false });
  });
});

describe("snapMove", () => {
  it("snaps a preference onto the row below", () => {
    const moving = pref("a", 40);
    const next = snapMove(moving, [pref("b", 164)], 18, 108);
    expect(next.y).toBe(164 - 64);
    expect(next.x).toBe(16);
  });
});

describe("convertPreset", () => {
  it("turns a phone navigation bar into a desktop rail", () => {
    const screen: Screen = {
      id: "s",
      name: "Home",
      x: 0,
      y: 0,
      preset: "phone",
      items: [{ id: "n", kind: "navigationBar", x: 0, y: 828, w: 412, h: 64, label: "", tabs: [] }],
    };
    const desk = convertPreset(screen, "desktop");
    expect(desk.preset).toBe("desktop");
    expect(desk.items[0].kind).toBe("navigationRail");
  });

  it("stretches a bottom sheet to the new width", () => {
    const screen: Screen = {
      id: "s",
      name: "Home",
      x: 0,
      y: 0,
      preset: "phone",
      items: [{ id: "b", kind: "bottomSheet", x: 0, y: 612, w: 412, h: 280, label: "More" }],
    };
    const desk = convertPreset(screen, "desktop");
    expect(desk.items[0].w).toBe(1280);
    expect(desk.items[0].y).toBe(800 - 280);
  });
});

describe("fitView", () => {
  it("scales phone frames into the viewport", () => {
    const screens: Screen[] = [{ id: "s", name: "Home", x: 0, y: 0, preset: "phone", items: [] }];
    const view = fitView(screens, 800, 600);
    expect(view.z).toBeGreaterThan(0);
    expect(view.z).toBeLessThanOrEqual(2.4);
    expect(412 * view.z).toBeLessThan(800);
  });
});

describe("centerItem", () => {
  it("centers a button in a phone frame", () => {
    const screen: Screen = { id: "s", name: "Home", x: 0, y: 0, preset: "phone", items: [] };
    const it: Item = { id: "i", kind: "button", x: 0, y: 0, w: 128, h: 50, label: "OK" };
    expect(centerItem(it, screen, "both")).toEqual({ x: Math.round((412 - 128) / 2), y: Math.round((892 - 50) / 2) });
  });

  it("keeps a top app bar on the top edge", () => {
    const screen: Screen = { id: "s", name: "Home", x: 0, y: 0, preset: "phone", items: [] };
    const it: Item = { id: "i", kind: "topAppBar", x: 0, y: 0, w: 412, h: 88, label: "Title" };
    expect(centerItem(it, screen, "both")).toEqual({ x: 0, y: 0 });
  });
});

describe("previewScale", () => {
  it("fits a phone frame into a short viewport", () => {
    expect(previewScale(412, 892, 800, 800)).toBeLessThan(1);
    expect(previewScale(412, 892, 800, 800)).toBeCloseTo((800 - 120) / 892);
  });
});

describe("pinItem", () => {
  it("pins to the 16dp left margin", () => {
    const screen: Screen = { id: "s", name: "Home", x: 0, y: 0, preset: "phone", items: [] };
    const it: Item = { id: "i", kind: "button", x: 80, y: 40, w: 128, h: 50, label: "OK" };
    expect(pinItem(it, screen, "left").x).toBe(16);
  });
});
