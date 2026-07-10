import trustIndexData from "@/data/trust-index.json";
import type { TrustIndexEntry } from "@/types/trust";
import { CANONICAL_CERTS, complianceKeys, type CanonicalCertKey } from "@/lib/trust";

/**
 * The trust hub's data source: the full 980-vendor light index (~794 KB). Only
 * the /trust hub page imports this, so the weight stays off every other page.
 */

export const trustIndex = trustIndexData as TrustIndexEntry[];

const bySlug = new Map(trustIndex.map((e) => [e.slug, e]));

export function getTrustIndexEntry(slug: string): TrustIndexEntry | undefined {
  return bySlug.get(slug);
}

export interface CertFacet {
  key: CanonicalCertKey;
  label: string;
  count: number;
}

/** Aggregate stats for the hub header, computed once at module load. */
export const TRUST_STATS = (() => {
  let trustCenters = 0;
  let noTrainVendors = 0;
  const certCounts = new Map<CanonicalCertKey, number>();
  for (const e of trustIndex) {
    if (e.has_trust_center) trustCenters += 1;
    if (e.trains_on_customer_data === false) noTrainVendors += 1;
    for (const key of complianceKeys(e.certs_held, e.dpa)) {
      certCounts.set(key, (certCounts.get(key) || 0) + 1);
    }
  }
  const certFacets: CertFacet[] = CANONICAL_CERTS.map((c) => ({
    key: c.key,
    label: c.label,
    count: certCounts.get(c.key) || 0,
  })).filter((f) => f.count > 0);
  return {
    total: trustIndex.length,
    trustCenters,
    noTrainVendors,
    certFacets,
  };
})();

export interface TrustFilter {
  query: string;
  certs: CanonicalCertKey[];
  noTrain: boolean;
}

/**
 * Filter + rank the index for the hub. Cert filters are ANDed (a vendor must
 * hold every selected cert); text matches vendor name or product family.
 */
export function filterTrustIndex({ query, certs, noTrain }: TrustFilter): TrustIndexEntry[] {
  const q = query.trim().toLowerCase().slice(0, 200);
  const wantCerts = new Set(certs);

  const results = trustIndex.filter((e) => {
    if (noTrain && e.trains_on_customer_data !== false) return false;
    if (wantCerts.size > 0) {
      const held = complianceKeys(e.certs_held, e.dpa);
      for (const key of wantCerts) {
        if (!held.has(key)) return false;
      }
    }
    if (q) {
      const hay = `${e.vendor} ${e.slug} ${e.product_family}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Rank: most certifications first, trust-center holders ahead, then A-Z.
  return results.sort((a, b) => {
    if (b.certs_held_count !== a.certs_held_count) return b.certs_held_count - a.certs_held_count;
    if (a.has_trust_center !== b.has_trust_center) return a.has_trust_center ? -1 : 1;
    return a.vendor.localeCompare(b.vendor);
  });
}
