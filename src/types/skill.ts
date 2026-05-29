import { z } from "zod";
import { HttpUrl } from "./primitives";

export const SkillTypeEnum = z.enum(["mcp-server", "claude-code-skill"]);
export type SkillType = z.infer<typeof SkillTypeEnum>;

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  github_url: HttpUrl,
  stars: z.number().int().min(0),
  topics: z.array(z.string()),
  tool_slug: z.string().nullable(),
  tool_name: z.string(),
  category: z.string(),
  skill_type: SkillTypeEnum,
  last_updated: z.string(),
  is_official: z.boolean().optional(),
});

export type Skill = z.infer<typeof SkillSchema>;
