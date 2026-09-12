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
    expect(text).toContain("Scaffold");
    expect(text).toContain("TextButton");
    expect(text).toContain("Overlay");
    expect(text).toContain("MiuixTheme");
    expect(text).toContain("ThemeController(ColorSchemeMode.Light)");
    expect(text).not.toContain("Monet");
    expect(text).toContain("OverlayDropdownPreference");
    expect(text).not.toMatch(/组件 Dropdown[^P]/);
  });

  it("can describe a single screen", () => {
    const doc = defaultDoc("en");
    const text = buildPrompt(doc, "en", doc.screens[2].id);
    expect(text).toContain("About");
    expect(text).not.toContain("Screen “Home”");
  });

  it("writes Japanese without Material 3", () => {
    const text = buildPrompt(defaultDoc("ja"), "ja");
    expect(text).toContain("画面「ホーム」");
    expect(text).toContain("Material 3 は使わない");
  });
});
