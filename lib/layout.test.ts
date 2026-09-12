import { describe, expect, it } from "vitest";
import { convertPreset, prefJoin, snapMove } from "./layout";
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
});
