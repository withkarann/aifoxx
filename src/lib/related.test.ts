import { describe, it, expect } from "vitest";
import { allTools, getRelatedTools } from "./tools";
import { vsPagePath, vsPagePaths } from "./compare-pairs";
import { normalizeQuery, MAX_QUERY_LENGTH } from "./query";

describe("getRelatedTools", () => {
  it("never suggests the tool itself or a tool from another category", () => {
    for (const tool of allTools) {
      for (const r of getRelatedTools(tool.slug, 3)) {
        expect(r.slug).not.toBe(tool.slug);
        expect(r.category).toBe(tool.category);
      }
    }
  });

  it("spreads suggestions across the catalog instead of repeating the same few", () => {
    const counts = new Map<string, number>();
    for (const tool of allTools) {
      for (const r of getRelatedTools(tool.slug, 3)) counts.set(r.slug, (counts.get(r.slug) ?? 0) + 1);
    }
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(10);
  });
});

describe("vsPagePath", () => {
  it("returns the same alphabetical address for either order", () => {
    const [first] = vsPagePaths();
    const [, a, , b] = first.split("/");
    expect(vsPagePath(a, b)).toBe(`/${first}`);
    expect(vsPagePath(b, a)).toBe(`/${first}`);
  });

  it("returns null for a pair without a page", () => {
    expect(vsPagePath("not-a-tool", "also-not")).toBeNull();
  });
});

describe("normalizeQuery", () => {
  it("trims and caps the search", () => {
    expect(normalizeQuery("  chatgpt  ")).toBe("chatgpt");
    expect(normalizeQuery("x".repeat(5000))).toHaveLength(MAX_QUERY_LENGTH);
    expect(normalizeQuery(null)).toBe("");
  });
});
