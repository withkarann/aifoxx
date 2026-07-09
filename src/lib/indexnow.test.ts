import { describe, it, expect } from "vitest";
import { parseSitemapLocs, buildIndexNowPayload } from "./indexnow";

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
