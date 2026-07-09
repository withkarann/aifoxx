import type { TrustReport } from "@/types/trust";

/**
 * Per-vendor report data. Vite turns this glob into one lazily-loaded chunk per
 * vendor, so opening a report downloads only that vendor's data (a few KB), not
 * every vendor's. The report route's data loader awaits this at build time (so
 * the full report is still pre-rendered into static HTML) and on navigation.
 */
const modules = import.meta.glob("../data/trust/*.json");

export async function loadTrustReport(
  slug: string | undefined
): Promise<TrustReport | undefined> {
  if (!slug) return undefined;
  const load = modules[`../data/trust/${slug}.json`];
  if (!load) return undefined;
  const mod = (await load()) as { default: TrustReport };
  return mod.default;
}
