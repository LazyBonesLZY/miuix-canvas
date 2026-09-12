import { describe, expect, it } from "vitest";
import { clamp01, fillLengthCalc, rangeFillWidthCalc, rangeStart, thumbCenterCalc } from "./slider";

describe("official slider geometry", () => {
  it("keeps the thumb inside the 28dp capsule", () => {
    expect(thumbCenterCalc(0)).toBe("calc(14px + 0 * (100% - 28px))");
    expect(thumbCenterCalc(1)).toBe("calc(14px + 1 * (100% - 28px))");
  });

  it("grows the fill with a round cap through the thumb", () => {
    expect(fillLengthCalc(0)).toBe("calc(28px + 0 * (100% - 28px))");
    expect(fillLengthCalc(1)).toBe("calc(28px + 1 * (100% - 28px))");
  });

  it("draws range fill between two thumbs", () => {
    expect(rangeFillWidthCalc(0.2, 0.8)).toContain("(100% - 28px) + 28px");
  });

  it("reads a stored range start", () => {
    expect(rangeStart({ from: 0.2, value: 0.8 })).toBeCloseTo(0.2);
    expect(clamp01(1.4)).toBe(1);
  });
});
