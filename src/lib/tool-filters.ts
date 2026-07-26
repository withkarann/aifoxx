import type { Tool } from "@/types/tool";

/**
 * Pricing filtering for the catalog.
 *
 * Two separate questions get asked about price, and they are not the same:
 *
 *   1. "What pricing model is this tool on?"  -> Free, Freemium, Paid, ...
 *   2. "Can I try it without paying?"         -> does it offer a free tier?
 *
 * A Paid tool can still offer a free tier, so answering both with one control
 * makes the results incoherent: a single "Free" chip that also matched free
 * tiers returned most of the catalog, including tools that cost money. These
 * are modelled as two independent filters so each one means exactly one thing.
 */

/** Free-tier strings that mean "there is no free tier". */
const EMPTY_FREE_TIER = /^(none|no free tier|not available|n\/a|-)$/i;

/**
 * Pricing models that never cost anything, regardless of tier text.
 */
const ALWAYS_FREE: ReadonlySet<string> = new Set(["Free", "Open Source"]);

/**
 * The pricing values actually present in the catalog, in a stable display
 * order, most common first.
 *
 * Derived from the data rather than from the Pricing type: the type lists
 * values the catalog may never use, and offering a chip that matches nothing
 * gives the user a filter that can only ever return an empty page.
 */
export function getAvailablePricingOptions(tools: readonly Tool[]): string[] {
  const counts = new Map<string, number>();

  for (const tool of tools) {
    const value = tool.pricing?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value]) => value);
}

/**
 * True when the tool can be used at some level without paying.
 *
 * Covers both tools that are free outright and paid tools that publish a
 * usable free tier.
 */
export function hasUsableFreeTier(tool: Tool): boolean {
  if (ALWAYS_FREE.has(tool.pricing)) return true;

  const freeTier = tool.pricing_detail?.free_tier?.trim() ?? "";
  return freeTier.length > 0 && !EMPTY_FREE_TIER.test(freeTier);
}

/**
 * True when the tool is on one of the selected pricing models.
 *
 * An empty selection means "no pricing constraint". Multiple selections are
 * combined with OR, so Free plus Freemium returns both.
 */
export function matchesPricing(tool: Tool, selected: readonly string[]): boolean {
  if (selected.length === 0) return true;
  return selected.includes(tool.pricing);
}

export interface PricingFilterCriteria {
  /** Pricing models to include. Empty means all. */
  pricing?: readonly string[];
  /** When true, keep only tools usable without paying. */
  freeTierOnly?: boolean;
}

/**
 * Apply both price-related filters. Each is independent, so selecting
 * "Paid" together with the free-tier toggle correctly returns paid tools
 * that let you try before buying.
 */
export function matchesPricingFilters(tool: Tool, criteria: PricingFilterCriteria): boolean {
  if (!matchesPricing(tool, criteria.pricing ?? [])) return false;
  if (criteria.freeTierOnly && !hasUsableFreeTier(tool)) return false;
  return true;
}
