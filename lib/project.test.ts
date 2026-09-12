import { describe, expect, it } from "vitest";
import { defaultDoc } from "./doc";
import { isProject, migrateDoc } from "./project";
import { DEFAULT_THEME } from "./tokens";
import type { Doc } from "./types";
import { frameSize } from "./types";

const base = {
  version: 1 as const,
  title: "App",
  platform: "cmp" as const,
  theme: { mode: "light" as const, seed: "#3482FF", monet: true },
};

describe("official theme defaults", () => {
  it("starts from HyperOS Light, not Material Monet", () => {
    expect(DEFAULT_THEME.monet).toBe(false);
    expect(defaultDoc("zh").theme.monet).toBe(false);
    expect(defaultDoc("zh").version).toBe(3);
  });

  it("keeps the sample inside the phone and leaves room for titles", () => {
    for (const lang of ["zh", "en", "ja", "ko"] as const) {
      for (const screen of defaultDoc(lang).screens) {
        const { w, h } = frameSize(screen.preset);
        for (const it of screen.items) {
          expect(it.x, `${screen.name} ${it.kind}`).toBeGreaterThanOrEqual(0);
          expect(it.y, `${screen.name} ${it.kind}`).toBeGreaterThanOrEqual(0);
          expect(it.x + it.w, `${screen.name} ${it.kind}`).toBeLessThanOrEqual(w);
          expect(it.y + it.h, `${screen.name} ${it.kind}`).toBeLessThanOrEqual(h);
          if (it.kind === "switchPref" || it.kind === "arrowPref") expect(it.h).toBeGreaterThanOrEqual(64);
          if (it.kind === "smallTitle") expect(it.h).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });
});

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
    const next = migrateDoc(raw as unknown as Doc);
    expect(next.version).toBe(3);
    expect(next.theme.monet).toBe(false);
    expect(next.screens[0].items.map((it) => it.kind)).toEqual(["button"]);
    expect(next.screens[0].items[0]).toMatchObject({ enabled: true, show: true, slot: "content" });
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
    const next = migrateDoc(raw as unknown as Doc);
    expect(next.screens[0].items[0]).toMatchObject({ kind: "floatingNav", x: 0, y: 792, w: 412, h: 100, variant: "iosLike" });
    expect(next.screens[0].items[1]).toMatchObject({ kind: "navigationBar", variant: "iconAndText", effect: "textureBlur" });
  });

  it("restores liquid-glass floating nav when variant was wiped", () => {
    const raw = {
      ...base,
      screens: [
        {
          id: "s",
          name: "Home",
          x: 0,
          y: 0,
          preset: "phone" as const,
          items: [{ id: "a", kind: "floatingNav", x: 0, y: 792, w: 412, h: 100, label: "" }],
        },
      ],
    };
    const next = migrateDoc(raw as unknown as Doc);
    expect(next.screens[0].items[0]).toMatchObject({ variant: "iosLike", h: 100 });
  });

  it("turns off Monet once when upgrading drafts that used the old default", () => {
    const raw = {
      ...base,
      version: 2 as const,
      screens: [
        {
          id: "s",
          name: "Home",
          x: 0,
          y: 0,
          preset: "phone" as const,
          items: [{ id: "a", kind: "button", x: 0, y: 0, w: 80, h: 40, label: "OK" }],
        },
      ],
    };
    expect(isProject(raw)).toBe(true);
    expect(migrateDoc(raw as unknown as Doc).theme.monet).toBe(false);
  });

  it("keeps Monet after the official HyperOS default is in place", () => {
    const raw = {
      ...base,
      version: 3 as const,
      theme: { mode: "light" as const, seed: "#3482FF", monet: true },
      screens: [
        {
          id: "s",
          name: "Home",
          x: 0,
          y: 0,
          preset: "phone" as const,
          items: [{ id: "a", kind: "button", x: 0, y: 0, w: 80, h: 40, label: "OK" }],
        },
      ],
    };
    expect(isProject(raw)).toBe(true);
    expect(migrateDoc(raw as unknown as Doc).theme.monet).toBe(true);
  });
});
