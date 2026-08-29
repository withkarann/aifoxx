import type { TrustReport, TrustRelatedVendor } from "@/types/trust";

/**
 * Per-vendor report data. Vite turns this glob into one lazily-loaded chunk per
 * vendor, so opening a report downloads only that vendor's data (a few KB), not
 * every vendor's. The report route's data loader awaits this at build time (so
 * the full report is still pre-rendered into static HTML) and on navigation.
 */
const modules = import.meta.glob("../data/trust/*.json");

/** Comparable vendors, kept per slug so the list adds no weight to the page. */
const relatedModules = import.meta.glob("../data/trust-related/*.json");

export interface TrustReportData {
  report: TrustReport;
  related: TrustRelatedVendor[];
}

async function loadRelated(slug: string): Promise<TrustRelatedVendor[]> {
  const load = relatedModules[`../data/trust-related/${slug}.json`];
  if (!load) return [];
  const mod = (await load()) as { default: TrustRelatedVendor[] };
  return mod.default ?? [];
}

export async function loadTrustReport(
  slug: string | undefined
): Promise<TrustReportData | undefined> {
  if (!slug) return undefined;
  const load = modules[`../data/trust/${slug}.json`];
  if (!load) return undefined;
  const mod = (await load()) as { default: TrustReport };
  return { report: mod.default, related: await loadRelated(slug) };
}
