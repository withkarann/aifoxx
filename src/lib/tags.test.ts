import { describe, it, expect } from "vitest";
import { countTags, linkableTags, tagPagePaths, hasTagPage, TAG_MIN_TOOLS } from "./tags";
import { allTools } from "./tools";

const tool = (...tags: string[]) => ({ tags });

describe("countTags", () => {
  it("counts how many tools carry each tag", () => {
    const counts = countTags([tool("video", "ai"), tool("video"), tool("ai")]);
    expect(counts.get("video")).toBe(2);
    expect(counts.get("ai")).toBe(2);
  });

  it("returns an empty map for no tools", () => {
    expect(countTags([]).size).toBe(0);
  });
});

describe("linkableTags", () => {
  it("keeps only tags at or above the threshold", () => {
    const tools = [
      ...Array.from({ length: TAG_MIN_TOOLS }, () => tool("popular")),
      tool("rare"),
    ];
    const linkable = linkableTags(tools);
    expect(linkable.has("popular")).toBe(true);
    expect(linkable.has("rare")).toBe(false);
  });
});

describe("tag pages match tag links", () => {
  it("builds one path per linkable tag", () => {
    expect(tagPagePaths()).toHaveLength(linkableTags(allTools).size);
  });

  it("percent-encodes tags so a path is a usable URL", () => {
    const paths = tagPagePaths();
    expect(paths.every((p) => !p.slice("tag/".length).includes(" "))).toBe(true);
  });

  it("reports a page for every tag that has one, and none for the rest", () => {
    for (const [tag, count] of countTags(allTools)) {
      expect(hasTagPage(tag)).toBe(count >= TAG_MIN_TOOLS);
    }
  });

  it("never reports a page for a tag no tool carries", () => {
    expect(hasTagPage("a tag that does not exist")).toBe(false);
  });
});
