import trustBadges from "@/data/trust-badges.json";

/**
 * Compact per-tool compliance summary derived from the verified trust
 * assessments, so the tool detail page shows the SAME certifications and
 * data-handling posture as the full /trust/:slug report (one source of truth).
 *
 * This is the only trust data imported by the tool detail page. It is kept small
 * (names + flags, no per-cert sources) so it doesn't meaningfully grow the
 * shared bundle; the sourced proof lives on the linked report page.
 */

export interface TrustBadges {
  /** Names of certifications graded held=true, in report order. */
  certs: string[];
  /** Whether the product trains AI on customer data (null when not stated). */
  trains: boolean | null;
  data_region: string;
  self_hostable: boolean | null;
  dpa: boolean | null;
}

interface RawBadges {
  certs: string[];
  trains: boolean | null;
  region: string;
  self_hostable: boolean | null;
  dpa: boolean | null;
}

const badges = trustBadges as Record<string, RawBadges>;

export function getTrustBadges(slug: string | undefined): TrustBadges | undefined {
  if (!slug) return undefined;
  const b = badges[slug];
  if (!b) return undefined;
  return {
    certs: b.certs || [],
    trains: b.trains ?? null,
    data_region: b.region || "",
    self_hostable: b.self_hostable ?? null,
    dpa: b.dpa ?? null,
  };
}
