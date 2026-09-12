import { describe, expect, it } from "vitest";
import { defaultDoc } from "./doc";
import { buildPrompt } from "./prompt";

describe("buildPrompt", () => {
  it("mentions Miuix and screens in Chinese", () => {
    const text = buildPrompt(defaultDoc("zh"), "zh");
    expect(text).toContain("Miuix");
    expect(text).toContain("屏幕「首页」");
    expect(text).toContain("SwitchPreference");
    expect(text).toContain("不要用 Material 3");
  });

  it("can describe a single screen", () => {
    const doc = defaultDoc("en");
    const text = buildPrompt(doc, "en", doc.screens[2].id);
    expect(text).toContain("About");
    expect(text).not.toContain("Screen “Home”");
  });
});
