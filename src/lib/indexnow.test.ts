import { describe, it, expect } from "vitest";
import { parseSitemapLocs, buildIndexNowPayload, sitemapChanges, changedToolSlugs } from "./indexnow";

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

describe("changed-page detection", () => {
  const sitemap = (entries: [string, string][]) =>
    `<urlset>${entries.map(([loc, lastmod]) => `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`).join("")}</urlset>`;

  it("reports new URLs and URLs whose lastmod moved, not unchanged ones", () => {
    const prev = sitemap([["https://aifoxx.com/a", "2026-01-01"], ["https://aifoxx.com/b", "2026-01-01"]]);
    const next = sitemap([
      ["https://aifoxx.com/a", "2026-01-01"],
      ["https://aifoxx.com/b", "2026-02-01"],
      ["https://aifoxx.com/c", "2026-02-01"],
    ]);
    expect(sitemapChanges(prev, next)).toEqual(["https://aifoxx.com/b", "https://aifoxx.com/c"]);
  });

  it("finds added, edited and removed tools", () => {
    const prev = [{ slug: "a", name: "A" }, { slug: "b", name: "B" }, { slug: "gone", name: "G" }];
    const next = [{ slug: "a", name: "A" }, { slug: "b", name: "B2" }, { slug: "new", name: "N" }];
    expect(changedToolSlugs(prev, next)).toEqual(["b", "gone", "new"]);
  });
});
