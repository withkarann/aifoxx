import { z } from "zod";

/**
 * Public shape of a vendor Trust & Security Report: certifications, privacy and
 * AI-training posture, security controls, and the sourced proof quotes shown on
 * the /trust/:slug pages. Report data lives in src/data/trust/<slug>.json.
 */

/**
 * Where a fact came from. It must be a single web address and nothing else:
 * an address with a second address, a page name or an aside appended cannot be
 * opened, which means the fact behind it can never be checked again. Anything
 * that is not an address belongs in the note, and any further addresses belong
 * in the list beside it.
 */
const SourceUrl = z
  .string()
  .default("")
  .refine((value) => value === "" || /^https?:\/\/[^\s"'<>]+$/.test(value), {
    message: "source must be a single http(s) address with nothing appended",
  });

export const CertificationSchema = z.object({
  name: z.string(),
  held: z.boolean(),
  proof_quote: z.string().default(""),
  source: SourceUrl,
  /** Any further addresses that back the same fact. */
  source_urls: z.array(SourceUrl).default([]),
  /** Wording that came with the source, such as which part of the page to read. */
  source_note: z.string().default(""),
});
export type Certification = z.infer<typeof CertificationSchema>;

export const PrivacySchema = z.object({
  privacy_policy_url: z.string().default(""),
  terms_url: z.string().default(""),
  dpa: z.boolean().nullable().optional(),
  trains_on_customer_data: z.boolean().nullable().optional(),
  ai_training_note: z.string().default(""),
  data_region: z.string().default(""),
  sources: z.array(z.string()).default([]),
});
export type Privacy = z.infer<typeof PrivacySchema>;

export const SecurityItemSchema = z.object({
  name: z.string(),
  value: z.string().default(""),
  source: SourceUrl,
  source_urls: z.array(SourceUrl).default([]),
  source_note: z.string().default(""),
});
export type SecurityItem = z.infer<typeof SecurityItemSchema>;

export const ProductSchema = z.object({
  name: z.string(),
  category: z.string().default(""),
  data_scope: z.string().default(""),
  notes: z.string().default(""),
});
export type Product = z.infer<typeof ProductSchema>;

export const CompareSchema = z.object({
  pricing_model: z.string().default(""),
  self_hostable: z.boolean().nullable().optional(),
  data_residency: z.string().default(""),
  trains_on_data: z.boolean().nullable().optional(),
  top_certs: z.array(z.string()).default([]),
});
export type Compare = z.infer<typeof CompareSchema>;

// maturity/confidence are tolerant strings: the data occasionally uses a value
// outside the canonical set (e.g. "medium-high"), and a listing must never fail
// to render over a label mismatch.
export const TrustReportSchema = z.object({
  slug: z.string(),
  vendor: z.string(),
  product_family: z.string().default(""),
  last_verified: z.string().default(""),
  maturity: z.string().default("unknown"),
  has_trust_center: z.boolean().default(false),
  trust_center_url: z.string().default(""),
  certifications: z.array(CertificationSchema).default([]),
  privacy: PrivacySchema,
  security: z.array(SecurityItemSchema).default([]),
  products: z.array(ProductSchema).default([]),
  compare: CompareSchema,
  confidence: z.string().default("medium"),
  flags: z.array(z.string()).default([]),
});
export type TrustReport = z.infer<typeof TrustReportSchema>;

/** Light per-vendor entry for the hub, tool-page card, and cross-linking. */
export interface TrustIndexEntry {
  slug: string;
  vendor: string;
  product_family: string;
  maturity: string;
  has_trust_center: boolean;
  last_verified: string;
  certs_held: string[];
  top_certs: string[];
  certs_held_count: number;
  trains_on_customer_data: boolean | null;
  self_hostable: boolean | null;
  /** Whether the vendor documents a data processing agreement (GDPR contract). */
  dpa: boolean | null;
  flags_count: number;
  confidence: string;
}

/** A comparable vendor linked from the bottom of a trust report. */
export interface TrustRelatedVendor {
  slug: string;
  name: string;
}
