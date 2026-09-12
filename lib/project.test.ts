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
});
