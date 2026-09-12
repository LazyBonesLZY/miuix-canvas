import { describe, expect, it } from "vitest";
import { isProject, migrateDoc } from "./project";
import type { Doc } from "./types";

const base = {
  version: 1 as const,
  title: "App",
  platform: "cmp" as const,
  theme: { mode: "light" as const, seed: "#3482FF", monet: true },
};

describe("migrateDoc", () => {
  it("loads a file that contains an unknown part and drops only that part", () => {
    const raw = {
      ...base,
      screens: [
        {
          id: "s",
          name: "Home",
          x: 0,
          y: 0,
          preset: "phone" as const,
          items: [
            { id: "a", kind: "button", x: 0, y: 0, w: 80, h: 40, label: "OK" },
            { id: "b", kind: "futureWidget", x: 0, y: 50, w: 80, h: 40, label: "X" },
          ],
        },
      ],
    };
    expect(isProject(raw)).toBe(true);
    const next = migrateDoc(raw as Doc);
    expect(next.screens[0].items.map((it) => it.kind)).toEqual(["button"]);
  });

  it("maps old glass/blur names onto official example styles", () => {
    const raw = {
      ...base,
      screens: [
        {
          id: "s",
          name: "Home",
          x: 0,
          y: 0,
          preset: "phone" as const,
          items: [
            { id: "a", kind: "floatingNav", x: 24, y: 760, w: 364, h: 64, label: "", variant: "glass" },
            { id: "b", kind: "navigationBar", x: 0, y: 828, w: 412, h: 64, label: "", variant: "blur" },
          ],
        },
      ],
    };
    const next = migrateDoc(raw as Doc);
    expect(next.screens[0].items[0]).toMatchObject({ kind: "floatingNav", w: 364, h: 64, variant: "iosLike" });
    expect(next.screens[0].items[1]).toMatchObject({ kind: "navigationBar", variant: "textureBlur" });
  });
});
