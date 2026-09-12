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
    expect(defaultDoc("zh").screens).toHaveLength(1);
  });

  it("ships a single sample phone", () => {
    const doc = defaultDoc("zh");
    expect(doc.screens.map((screen) => screen.name)).toEqual(["首页"]);
    expect(doc.screens[0].items.some((it) => it.kind === "card")).toBe(true);
    expect(doc.screens[0].items.filter((it) => it.kind === "switchPref")).toHaveLength(2);
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
          if (it.kind === "switchPref" || it.kind === "arrowPref") {
            expect(it.h, `${screen.name} ${it.kind}`).toBeGreaterThanOrEqual(it.supporting ? 80 : 56);
          }
          if (it.kind === "sliderPref" || it.kind === "rangeSliderPref") {
            expect(it.h, `${screen.name} ${it.kind}`).toBeGreaterThanOrEqual(96);
          }
          if (it.kind === "smallTitle") expect(it.h).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });

  it("does not stack sample parts on top of each other", () => {
    for (const screen of defaultDoc("zh").screens) {
      const items = screen.items;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          const overlap = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
          expect(overlap, `${screen.name}: ${a.kind}@${a.y} vs ${b.kind}@${b.y}`).toBe(false);
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

  it("grows short preference rows so title and summary are not clipped", () => {
    const raw = {
      ...base,
      version: 3 as const,
      theme: { mode: "light" as const, seed: "#3482FF", monet: false },
      screens: [
        {
          id: "s",
          name: "Home",
          x: 0,
          y: 0,
          preset: "phone" as const,
          items: [
            { id: "a", kind: "switchPref", x: 16, y: 80, w: 380, h: 64, label: "Dark", supporting: "Follow system" },
            { id: "b", kind: "switch", x: 16, y: 160, w: 20, h: 20, label: "" },
          ],
        },
      ],
    };
    const next = migrateDoc(raw as unknown as Doc);
    expect(next.screens[0].items[0].h).toBe(80);
    expect(next.screens[0].items[1]).toMatchObject({ w: 49, h: 28 });
  });

  it("pushes the following row down when a preference grows", () => {
    const raw = {
      ...base,
      version: 3 as const,
      theme: { mode: "light" as const, seed: "#3482FF", monet: false },
      screens: [
        {
          id: "s",
          name: "Home",
          x: 0,
          y: 0,
          preset: "phone" as const,
          items: [
            { id: "a", kind: "switchPref", x: 16, y: 100, w: 380, h: 64, label: "A", supporting: "one" },
            { id: "b", kind: "switchPref", x: 16, y: 164, w: 380, h: 64, label: "B", supporting: "two" },
          ],
        },
      ],
    };
    const next = migrateDoc(raw as unknown as Doc);
    const [first, second] = next.screens[0].items;
    expect(first.h).toBe(80);
    expect(second.h).toBe(80);
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.h);
  });
});
