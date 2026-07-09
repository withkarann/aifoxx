import { describe, it, expect } from "vitest";
import { hasToolIcon, toolIconUrl } from "./tool-icons";
import iconSlugs from "@/data/tool-icons.json";

describe("tool-icons", () => {
  it("reports true for a slug present in the manifest", () => {
    const known = (iconSlugs as string[])[0];
    expect(hasToolIcon(known)).toBe(true);
  });

  it("reports false for a slug not in the manifest", () => {
    expect(hasToolIcon("definitely-not-a-real-slug-xyz")).toBe(false);
  });

  it("builds a local webp path from a slug", () => {
    expect(toolIconUrl("chatgpt")).toBe("/icons/chatgpt.webp");
  });
});
