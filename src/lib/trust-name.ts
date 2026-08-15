import { getToolBySlug } from "@/lib/tools";

/**
 * Naming for trust report pages.
 *
 * Reports are keyed by the vendor's legal entity, and one entity can operate
 * many listed products: Microsoft Corporation covers Power BI, Microsoft
 * Copilot, Bing Image Creator, and more. Naming each page after the entity
 * makes those pages indistinguishable to readers and to search engines, so a
 * report is named after the product it actually covers.
 *
 * This module reads the tool catalog and is therefore kept out of `trust.ts`,
 * which is documented as safe to import from anywhere.
 */

/** Strips case and punctuation so "Notion Labs, Inc." compares as "notionlabsinc". */
function comparable(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * The product a trust report covers, taken from the catalog listing that shares
 * its slug. Catalog names are unique, so this gives every report a distinct
 * name. Falls back to the vendor when a report has no catalog entry.
 */
export function trustProductName(slug: string, vendor: string): string {
  return getToolBySlug(slug)?.name || vendor;
}

/**
 * The company to credit alongside the product, or nothing when the vendor is
 * just the product name carrying legal wording ("Ably Realtime (UK Limited)"),
 * where repeating it would only add noise.
 */
export function trustOperator(product: string, vendor: string): string | undefined {
  const p = comparable(product);
  const v = comparable(vendor);
  if (!p || !v) return undefined;
  return v.startsWith(p) ? undefined : vendor;
}
