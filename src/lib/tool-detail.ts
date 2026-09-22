import type { Tool } from "@/types/tool";
import { loadRegionsFor } from "./trust-regions";

/**
 * In the browser the data only comes with a published page, so when it is
 * missing (the visitor arrived on a page that was not pre-rendered) the
 * published page is opened in full instead of rendering without its data.
 */
export function openPublishedPage(path: string) {
  if (typeof window === "undefined" || import.meta.env.SSR || import.meta.env.DEV) return;
  if (import.meta.env.MODE === "test") return;
  window.location.assign(path);
}

/** Heavy fields split out of the catalog and loaded only on the tool page. */
export type ToolDetail = Pick<
  Tool,
  "use_cases" | "not_good_for" | "industries" | "compliance" | "compliance_sources" | "data_storage"
> & {
  /** Data region from the vendor's Trust & Security Report, "" when not stated. */
  trust_region?: string;
};

/**
 * One lazily-loaded chunk per tool, so opening a tool page fetches only that
 * tool's detail fields. The tool route's loader awaits this at build time (so
 * the detail is pre-rendered into static HTML) and on navigation.
 */
//
// Published pages read this data from the pre-rendered page data instead, so
// the browser build leaves the lookup table out entirely: it would otherwise
// add a reference to every tool's file to the code every visitor downloads.
const modules: Record<string, () => Promise<unknown>> =
  import.meta.env.SSR || import.meta.env.DEV || import.meta.env.MODE === "test"
    ? import.meta.glob("../data/tools/*.json")
    : {};

export async function loadToolDetail(slug: string | undefined): Promise<ToolDetail> {
  if (!slug) return {};
  const load = modules[`../data/tools/${slug}.json`];
  if (!load) {
    openPublishedPage(`/ai/${slug}`);
    return {};
  }
  const mod = (await load()) as { default: ToolDetail };
  const regions = await loadRegionsFor([slug]);
  return { ...(mod.default || {}), trust_region: regions[slug] };
}
