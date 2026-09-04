import { describe, it, expect } from "vitest";
import { parseSitemapLocs, parseSitemapEntries, buildIndexNowPayload, changedSince, windowStart } from "./indexnow";

describe("indexnow", () => {
  it("extracts loc URLs from sitemap xml", () => {
    const xml =
      `<urlset><url><loc>https://aifoxx.com/</loc></url>` +
      `<url><loc>https://aifoxx.com/ai/chatgpt</loc></url></urlset>`;
    expect(parseSitemapLocs(xml)).toEqual([
      "https://aifoxx.com/",
      "https://aifoxx.com/ai/chatgpt",
    ]);
  });

  it("builds a payload with host, key, keyLocation, and urlList", () => {
    const p = buildIndexNowPayload(["https://aifoxx.com/"], "abc123");
    expect(p.host).toBe("aifoxx.com");
    expect(p.key).toBe("abc123");
    expect(p.keyLocation).toBe("https://aifoxx.com/abc123.txt");
    expect(p.urlList).toEqual(["https://aifoxx.com/"]);
  });
});

describe("changedSince", () => {
  const entries = [
    { loc: "https://aifoxx.com/a", lastmod: "2026-08-20" },
    { loc: "https://aifoxx.com/b", lastmod: "2026-06-01" },
    { loc: "https://aifoxx.com/c" },
    { loc: "https://aifoxx.com/d", lastmod: "not a date" },
  ];

  it("keeps only entries dated on or after the cutoff", () => {
    expect(changedSince(entries, new Date("2026-08-15"))).toEqual(["https://aifoxx.com/a"]);
  });

  it("keeps an entry dated exactly on the cutoff", () => {
    expect(changedSince(entries, new Date("2026-08-20"))).toContain("https://aifoxx.com/a");
  });

  it("drops entries with a missing or unreadable date", () => {
    const kept = changedSince(entries, new Date("1970-01-01"));
    expect(kept).not.toContain("https://aifoxx.com/c");
    expect(kept).not.toContain("https://aifoxx.com/d");
  });

  it("returns nothing when no page changed in the window", () => {
    expect(changedSince(entries, new Date("2026-09-01"))).toEqual([]);
  });
});

describe("parseSitemapEntries", () => {
  it("reads the date alongside each URL", () => {
    const xml =
      `<urlset><url><loc>https://aifoxx.com/</loc><lastmod>2026-08-20</lastmod></url>` +
      `<url><loc>https://aifoxx.com/x</loc></url></urlset>`;
    expect(parseSitemapEntries(xml)).toEqual([
      { loc: "https://aifoxx.com/", lastmod: "2026-08-20" },
      { loc: "https://aifoxx.com/x" },
    ]);
  });
});

describe("windowStart", () => {
  it("looks back far enough to cover a missed run", () => {
    const start = windowStart(new Date("2026-08-20T00:00:00Z"));
    expect(start.toISOString().slice(0, 10)).toBe("2026-08-13");
  });
});
