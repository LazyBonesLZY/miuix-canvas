import { describe, expect, it } from "vitest";
import { MIUIX_BLUE, schemeFromSeed } from "./color";

describe("schemeFromSeed", () => {
  it("keeps official HyperOS light surfaces at the Miuix blue seed", () => {
    const p = schemeFromSeed(MIUIX_BLUE, false);
    expect(p.primary).toBe("#3482FF");
    expect(p.tertiaryContainer).toBe("#EAF2FF");
    expect(p.surface).toBe("#F7F7F7");
    expect(p.surfaceContainer).toBe("#FFFFFF");
    expect(p.secondary).toBe("#E6E6E6");
    expect(p.secondaryVariant).toBe("#F0F0F0");
    expect(p.secondaryContainer).toBe("#F0F0F0");
    expect(p.surfaceContainerHigh).toBe("#E8E8E8");
    expect(p.outline).toBe("#D9D9D9");
    expect(p.dividerLine).toBe("#E0E0E0");
    expect(p.windowDimming).toBe("rgba(0,0,0,0.3)");
  });

  it("keeps official HyperOS dark surfaces", () => {
    const p = schemeFromSeed(MIUIX_BLUE, true);
    expect(p.surface).toBe("#000000");
    expect(p.surfaceContainer).toBe("#242424");
    expect(p.surfaceContainerHighest).toBe("#2D2D2D");
    expect(p.secondaryVariant).toBe("#434343");
    expect(p.primary).toBe("#277AF7");
    expect(p.windowDimming).toBe("rgba(0,0,0,0.6)");
  });
});
