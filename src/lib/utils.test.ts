import { describe, it, expect } from "vitest";
import { isSafeHttpUrl } from "./utils";

describe("isSafeHttpUrl", () => {
  it("accepts absolute http(s) URLs, including valid special characters", () => {
    for (const u of [
      "https://trust.railway.com",
      "http://example.com",
      "https://x.com/path(1)+a,b?q=1&r=2#h",
      "https://sub.domain.co/legal/dpa",
    ]) {
      expect(isSafeHttpUrl(u)).toBe(true);
    }
  });

  it("rejects non-http(s) schemes and empty/nullish values", () => {
    for (const u of ["javascript:alert(1)", "data:text/html,x", "file:///etc", "mailto:a@b.c", "", null, undefined]) {
      expect(isSafeHttpUrl(u as string)).toBe(false);
    }
  });

  // The load-bearing case: Node's URL parser and the browser's disagree on
  // strings containing whitespace (Node throws, the browser parses). If this
  // returned true anywhere, a link would render on only one side and break
  // hydration on the pre-rendered trust pages (React #418 -> "Application
  // error"). It must reject every whitespace-bearing string, in every runtime.
  it("rejects any URL containing whitespace (deterministic across environments)", () => {
    for (const u of [
      "https://railway.com (product page)",
      "https://railway.com/legal/dpa; https://trust.railway.com",
      "https://trust.railway.com; https://railway.com/enterprise",
      "https://x.com/a b",
      " https://x.com",
      "https://x.com\t",
      "https://x.com\n",
    ]) {
      expect(isSafeHttpUrl(u)).toBe(false);
    }
  });
});
