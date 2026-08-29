import { TrustReportSchema } from "@/types/trust";
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
  const mod = (await load()) as { default: unknown };

  // Checked, not assumed. The pages read these fields directly, so a value of
  // the wrong type renders rather than failing: a yes/no field holding text
  // counts as yes wherever it is checked. Parsing here means a report that does
  // not match its shape stops the build instead of publishing a wrong answer.
  const parsed = TrustReportSchema.safeParse(mod.default);
  if (!parsed.success) {
    const faults = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Trust report "${slug}" does not match the expected shape. ${faults}`);
  }
  return { report: parsed.data as TrustReport, related: await loadRelated(slug) };
}
