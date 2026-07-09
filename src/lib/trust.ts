import trustSlugs from "@/data/trust-slugs.json";
import type { TrustIndexEntry, TrustReport } from "@/types/trust";

/**
 * Light trust helpers safe to import anywhere (tool pages, routes). This module
 * deliberately imports ONLY the tiny slug list, never the 794 KB index or the
 * multi-MB full reports, so importing it never bloats a page's bundle.
 */

const slugSet = new Set<string>(trustSlugs as string[]);

export const TRUST_SLUGS = trustSlugs as string[];
export const TRUST_COUNT = slugSet.size;

export function hasTrustReport(slug: string | undefined | null): boolean {
  return slug != null && slugSet.has(slug);
}

/**
 * Canonical certifications used for filtering, badges, and FAQ generation. Each
 * matcher is intentionally narrow: an "ISO 27001" match must not be satisfied by
 * ISO 27017/27018/27701, which are graded as their own certs.
 */
export const CANONICAL_CERTS = [
  { key: "soc2", label: "SOC 2", match: (n: string) => /soc\s*2/i.test(n) },
  { key: "iso27001", label: "ISO 27001", match: (n: string) => /iso[/\s-]*(?:iec[/\s-]*)?27001/i.test(n) },
  { key: "iso42001", label: "ISO 42001", match: (n: string) => /iso[/\s-]*(?:iec[/\s-]*)?42001/i.test(n) },
  { key: "gdpr", label: "GDPR", match: (n: string) => /\bgdpr\b/i.test(n) },
  { key: "hipaa", label: "HIPAA", match: (n: string) => /\bhipaa\b/i.test(n) },
  { key: "pci", label: "PCI DSS", match: (n: string) => /\bpci\b/i.test(n) },
  { key: "fedramp", label: "FedRAMP", match: (n: string) => /fedramp/i.test(n) },
  { key: "ccpa", label: "CCPA", match: (n: string) => /\bccpa|cpra\b/i.test(n) },
] as const;

export type CanonicalCertKey = (typeof CANONICAL_CERTS)[number]["key"];

/** Which canonical certs a set of held-cert names satisfies. */
export function canonicalCertKeys(heldCertNames: string[]): Set<CanonicalCertKey> {
  const out = new Set<CanonicalCertKey>();
  for (const name of heldCertNames) {
    for (const c of CANONICAL_CERTS) {
      if (c.match(name)) out.add(c.key);
    }
  }
  return out;
}

/** Held-cert names from either a full report or a light index entry. */
export function heldCertNames(entry: Pick<TrustReport, "certifications"> | Pick<TrustIndexEntry, "certs_held">): string[] {
  if ("certs_held" in entry) return entry.certs_held;
  return (entry.certifications || []).filter((c) => c.held).map((c) => c.name);
}
