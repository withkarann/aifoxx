import { ToolSchema, type Tool } from "@/types/tool";
import toolsData from "@/data/tools.json";

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function validateTools(): Tool[] {
  const tools = toolsData.map((t) => ToolSchema.parse(t));

  const slugs = new Set<string>();
  for (const tool of tools) {
    if (slugs.has(tool.slug)) {
      throw new Error(`Duplicate slug found: "${tool.slug}"`);
    }
    slugs.add(tool.slug);
  }

  return tools;
}

export const allTools: Tool[] = validateTools();

export function getToolBySlug(slug: string): Tool | undefined {
  return allTools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return allTools.filter((t) => t.category === category);
}

export function getRelatedTools(slug: string, limit = 4): Tool[] {
  const tool = getToolBySlug(slug);
  if (!tool) return [];
  return allTools
    .filter((t) => t.slug !== slug && t.category === tool.category)
    .slice(0, limit);
}
