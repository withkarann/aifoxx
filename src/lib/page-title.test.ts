import { describe, it, expect } from "vitest";
import { fitTitle } from "./page-title";

describe("fitTitle", () => {
  it("keeps the most specific title that fits", () => {
    expect(fitTitle(["a".repeat(70), "short title", "x"])).toBe("short title");
  });

  it("falls back to the last option when nothing fits", () => {
    expect(fitTitle(["a".repeat(70), "b".repeat(65)])).toBe("b".repeat(65));
  });
});
