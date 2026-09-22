import { describe, it, expect } from "vitest";
import { HttpUrl, Slug } from "./primitives";
import { SLUG_RE } from "../../scripts/slug.mjs";

describe("Slug", () => {
  it("accepts lowercase slugs joined by single hyphens", () => {
    for (const s of ["chatgpt", "github-copilot", "gpt-4o", "a1"]) {
      expect(Slug.safeParse(s).success).toBe(true);
    }
  });

  it("rejects anything that could leave its folder or collide by case", () => {
    for (const s of ["", "../package", "a/b", "Foo", "double--hyphen", "-lead", "trail-", "a.json", "/abs"]) {
      expect(Slug.safeParse(s).success).toBe(false);
    }
  });

  it("agrees with the rule the build scripts use", () => {
    for (const s of ["chatgpt", "gpt-4o", "", "../x", "Foo", "a--b"]) {
      expect(Slug.safeParse(s).success).toBe(SLUG_RE.test(s));
    }
  });
});

describe("HttpUrl", () => {
  it("rejects non-http schemes", () => {
    for (const u of ["javascript:alert(1)", "data:image/svg+xml,<svg/>", "file:///etc/passwd"]) {
      expect(HttpUrl.safeParse(u).success).toBe(false);
    }
    expect(HttpUrl.safeParse("https://example.com/logo.png").success).toBe(true);
  });
});
