import type { Tool } from "@/types/tool";

/** Heavy fields split out of the catalog and loaded only on the tool page. */
export type ToolDetail = Pick<
  Tool,
  "use_cases" | "not_good_for" | "industries" | "compliance" | "compliance_sources" | "data_storage"
>;

/**
 * One lazily-loaded chunk per tool, so opening a tool page fetches only that
 * tool's detail fields. The tool route's loader awaits this at build time (so
 * the detail is pre-rendered into static HTML) and on navigation.
 */
const modules = import.meta.glob("../data/tools/*.json");

export async function loadToolDetail(slug: string | undefined): Promise<ToolDetail> {
  if (!slug) return {};
  const load = modules[`../data/tools/${slug}.json`];
  if (!load) return {};
  const mod = (await load()) as { default: ToolDetail };
  return mod.default || {};
}
