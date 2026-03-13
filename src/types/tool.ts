import { z } from "zod";

export const PricingEnum = z.enum(["Free", "Freemium", "Paid", "Open Source"]);
export type Pricing = z.infer<typeof PricingEnum>;

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
});

export type Tool = z.infer<typeof ToolSchema>;
