import { z } from "zod";
import { HttpUrl } from "./primitives";

export const PricingEnum = z.enum([
  "Free", "Freemium", "Paid", "Open Source", "Usage Based", "Contact Sales", "Pay-as-you-go"
]);
export type Pricing = z.infer<typeof PricingEnum>;

export const StatusEnum = z.enum(["active", "beta", "sunset", "acquired"]);
export type Status = z.infer<typeof StatusEnum>;

export const ComplianceSchema = z.object({
  soc2: z.boolean().nullable(),
  iso27001: z.boolean().nullable(),
  gdpr: z.boolean().nullable(),
  hipaa: z.boolean().nullable(),
});

// Public, auditable source URL backing each verified fact (vendor trust /
// security / legal page). Covers the four compliance flags plus the
// data-handling facts (data residency region, whether the vendor trains on
// user data, and whether the tool can be self-hosted). Present only for facts
// that have been independently verified; absent means the value is unsourced
// and must be treated as a guess.
export const ComplianceSourcesSchema = z.object({
  soc2: HttpUrl.nullable().optional(),
  iso27001: HttpUrl.nullable().optional(),
  gdpr: HttpUrl.nullable().optional(),
  hipaa: HttpUrl.nullable().optional(),
  trains_on_data: HttpUrl.nullable().optional(),
  region: HttpUrl.nullable().optional(),
  self_hostable: HttpUrl.nullable().optional(),
});

export const DataStorageSchema = z.object({
  region: z.string().nullable(),
  trains_on_data: z.boolean().nullable(),
  self_hostable: z.boolean().nullable(),
});

export const PricingDetailSchema = z.object({
  free_tier: z.string().nullable(),
  paid_plans: z.string().nullable(),
  api_cost: z.string().nullable(),
});

export const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.string(),
  subcategory: z.string(),
  description: z.string(),
  url: HttpUrl,
  tags: z.array(z.string()),
  pricing: PricingEnum,
  logo_url: z.string().optional(),
  /** Editorial spotlight: shown as featured on the site. Kept deliberately small. */
  featured: z.boolean().optional(),
  /**
   * Widely used tool. Drives the head-to-head comparison pages, the compare
   * page's starting suggestions, and best-of ordering. Separate from `featured`
   * so the spotlight can change without rebuilding those pages.
   */
  popular: z.boolean().optional(),
  status: StatusEnum.optional(),
  last_verified: z.string().optional(),
  access_methods: z.array(z.string()).optional(),
  compliance: ComplianceSchema.optional(),
  compliance_sources: ComplianceSourcesSchema.optional(),
  data_storage: DataStorageSchema.optional(),
  pricing_detail: PricingDetailSchema.optional(),
  use_cases: z.array(z.string()).optional(),
  not_good_for: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
});

export type Tool = z.infer<typeof ToolSchema>;
