import { describe, expect, it } from "vitest";
import type { Tool } from "@/types/tool";
import {
  getAvailablePricingOptions,
  hasUsableFreeTier,
  matchesPricing,
  matchesPricingFilters,
} from "./tool-filters";

function makeTool(overrides: Partial<Tool> & { pricing: string }): Tool {
  return {
    id: "1",
    name: "Test Tool",
    slug: "test-tool",
    category: "Coding",
    subcategory: "IDE Assistant",
    description: "A tool.",
    url: "https://example.com",
    tags: [],
    featured: false,
    status: "active",
    ...overrides,
  } as Tool;
}

describe("getAvailablePricingOptions", () => {
  it("returns only values present in the catalog", () => {
    const tools = [
      makeTool({ pricing: "Freemium" }),
      makeTool({ pricing: "Paid" }),
      makeTool({ pricing: "Freemium" }),
    ];

    expect(getAvailablePricingOptions(tools)).toEqual(["Freemium", "Paid"]);
  });

  it("never offers a value the catalog does not contain", () => {
    // Guards the original defect: chips were built from the Pricing type, so
    // "Usage Based" and "Contact Sales" were offered while matching no tools.
    const tools = [makeTool({ pricing: "Free" })];

    const options = getAvailablePricingOptions(tools);

    expect(options).not.toContain("Usage Based");
    expect(options).not.toContain("Contact Sales");
  });

  it("orders by frequency so the most common model comes first", () => {
    const tools = [
      makeTool({ pricing: "Paid" }),
      makeTool({ pricing: "Freemium" }),
      makeTool({ pricing: "Freemium" }),
    ];

    expect(getAvailablePricingOptions(tools)[0]).toBe("Freemium");
  });

  it("ignores blank pricing values", () => {
    const tools = [makeTool({ pricing: "Free" }), makeTool({ pricing: "   " })];

    expect(getAvailablePricingOptions(tools)).toEqual(["Free"]);
  });
});

describe("matchesPricing", () => {
  const paid = makeTool({ pricing: "Paid" });

  it("keeps every tool when nothing is selected", () => {
    expect(matchesPricing(paid, [])).toBe(true);
  });

  it("matches the exact pricing model only", () => {
    expect(matchesPricing(paid, ["Paid"])).toBe(true);
    expect(matchesPricing(paid, ["Free"])).toBe(false);
  });

  it("does not sweep in other models that merely cost money", () => {
    // The old "Paid" filter also matched Freemium, which put 875 of 988 tools
    // behind one chip.
    const freemium = makeTool({
      pricing: "Freemium",
      pricing_detail: { free_tier: "Basic", paid_plans: "Pro $10/mo", api_cost: null },
    });

    expect(matchesPricing(freemium, ["Paid"])).toBe(false);
  });

  it("combines multiple selections with OR", () => {
    const free = makeTool({ pricing: "Free" });

    expect(matchesPricing(free, ["Free", "Freemium"])).toBe(true);
    expect(matchesPricing(paid, ["Free", "Freemium"])).toBe(false);
  });
});

describe("hasUsableFreeTier", () => {
  it("treats Free and Open Source as free regardless of tier text", () => {
    expect(hasUsableFreeTier(makeTool({ pricing: "Free" }))).toBe(true);
    expect(hasUsableFreeTier(makeTool({ pricing: "Open Source" }))).toBe(true);
  });

  it("detects a published free tier on a paid tool", () => {
    const tool = makeTool({
      pricing: "Paid",
      pricing_detail: { free_tier: "14-day trial", paid_plans: "$20/mo", api_cost: null },
    });

    expect(hasUsableFreeTier(tool)).toBe(true);
  });

  it("returns false when there is no free tier", () => {
    const tool = makeTool({
      pricing: "Paid",
      pricing_detail: { free_tier: null, paid_plans: "$20/mo", api_cost: null },
    });

    expect(hasUsableFreeTier(tool)).toBe(false);
  });

  it.each(["none", "None", "no free tier", "n/a", "-", "  "])(
    "treats %j as no free tier",
    (value) => {
      const tool = makeTool({
        pricing: "Paid",
        pricing_detail: { free_tier: value, paid_plans: "$20/mo", api_cost: null },
      });

      expect(hasUsableFreeTier(tool)).toBe(false);
    }
  );
});

describe("matchesPricingFilters", () => {
  const paidWithTrial = makeTool({
    pricing: "Paid",
    pricing_detail: { free_tier: "14-day trial", paid_plans: "$20/mo", api_cost: null },
  });
  const paidNoTrial = makeTool({
    pricing: "Paid",
    pricing_detail: { free_tier: null, paid_plans: "$20/mo", api_cost: null },
  });

  it("applies the two filters independently", () => {
    expect(matchesPricingFilters(paidWithTrial, { pricing: ["Paid"], freeTierOnly: true })).toBe(true);
    expect(matchesPricingFilters(paidNoTrial, { pricing: ["Paid"], freeTierOnly: true })).toBe(false);
  });

  it("keeps a tool out of both Free and Paid at once", () => {
    // 601 tools previously matched the Free chip and the Paid chip
    // simultaneously, which made the two look interchangeable.
    const inFree = matchesPricingFilters(paidWithTrial, { pricing: ["Free"] });
    const inPaid = matchesPricingFilters(paidWithTrial, { pricing: ["Paid"] });

    expect(inFree && inPaid).toBe(false);
  });

  it("returns everything when no price filter is set", () => {
    expect(matchesPricingFilters(paidNoTrial, {})).toBe(true);
  });
});
