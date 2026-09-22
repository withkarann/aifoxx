/**
 * Where each vendor stores data, as stated in its Trust & Security Report.
 * The text is long and only the tool page and comparisons show it, so it loads
 * on demand instead of with every page.
 */
export type TrustRegions = Record<string, string>;

let cache: TrustRegions | null = null;

export async function loadTrustRegions(): Promise<TrustRegions> {
  if (!cache) cache = (await import("@/data/trust-regions.json")).default as TrustRegions;
  return cache;
}

/** The stated region for a tool, or "" when none is recorded. */
export function regionFor(regions: TrustRegions | undefined, slug: string): string {
  if (!regions || !Object.prototype.hasOwnProperty.call(regions, slug)) return "";
  return regions[slug];
}

/** Regions for just these tools, small enough to embed in a published page. */
export async function loadRegionsFor(slugs: (string | undefined)[]): Promise<TrustRegions> {
  const all = await loadTrustRegions();
  const picked: TrustRegions = {};
  for (const slug of slugs) if (slug) picked[slug] = regionFor(all, slug);
  return picked;
}
