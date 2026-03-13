import { z } from "zod";

export const PricingEnum = z.enum([
  "Free", "Freemium", "Paid", "Open Source", "Usage Based", "Contact Sales"
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
  url: z.string().url(),
  tags: z.array(z.string()),
  pricing: PricingEnum,
  logo_url: z.string().optional(),
  featured: z.boolean().optional(),
  status: StatusEnum.optional(),
  last_verified: z.string().optional(),
  access_methods: z.array(z.string()).optional(),
  compliance: ComplianceSchema.optional(),
  data_storage: DataStorageSchema.optional(),
  pricing_detail: PricingDetailSchema.optional(),
  use_cases: z.array(z.string()).optional(),
  not_good_for: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
});

export type Tool = z.infer<typeof ToolSchema>;
