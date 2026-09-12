import { describe, expect, it } from "vitest";
import { layoutModeOf } from "./viewport";

describe("layoutModeOf", () => {
  it("treats phones and compact portrait as phone", () => {
    expect(layoutModeOf(390)).toBe("phone");
    expect(layoutModeOf(430)).toBe("phone");
    expect(layoutModeOf(767)).toBe("phone");
  });

  it("treats iPad and landscape phones as tablet", () => {
    expect(layoutModeOf(768)).toBe("tablet");
    expect(layoutModeOf(834)).toBe("tablet");
    expect(layoutModeOf(1024)).toBe("tablet");
    expect(layoutModeOf(1199)).toBe("tablet");
  });

  it("treats laptop widths as desktop", () => {
    expect(layoutModeOf(1200)).toBe("desktop");
    expect(layoutModeOf(1440)).toBe("desktop");
  });
});
