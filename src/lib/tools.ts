import { ToolSchema, type Tool } from "@/types/tool";
// Light catalog (generated from tools.json by scripts/split-tools.mjs). Heavy
// detail fields (use_cases, compliance, etc.) are loaded per tool page; they are
// optional on Tool, so listing/search/filter code reads this index directly.
import toolsData from "@/data/tools-index.json";

export interface CategoryTaxonomyItem {
  name: string;
  subcategories: string[];
}

export function normalizeTaxonomyValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function toSlug(name: string): string {
  return normalizeTaxonomyValue(name);
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

export const CATEGORIES: CategoryTaxonomyItem[] = Array.from(
  allTools.reduce((map, tool) => {
    if (!map.has(tool.category)) {
      map.set(tool.category, new Set<string>());
    }
    map.get(tool.category)?.add(tool.subcategory);
    return map;
  }, new Map<string, Set<string>>()).entries(),
  ([name, subcategories]) => ({
    name,
    subcategories: Array.from(subcategories).sort((a, b) => a.localeCompare(b)),
  })
).sort((a, b) => a.name.localeCompare(b.name));

export const TOOL_COUNTS = {
  total: allTools.length,
  categories: CATEGORIES.length,
  featured: allTools.filter((tool) => tool.featured).length,
  verified: allTools.filter((tool) => tool.last_verified).length,
};

export function matchesTaxonomyValue(candidate: string, selected: string): boolean {
  return normalizeTaxonomyValue(candidate) === normalizeTaxonomyValue(selected);
}

export function getCanonicalCategoryName(category: string): string | undefined {
  return CATEGORIES.find((item) => matchesTaxonomyValue(item.name, category))?.name;
}

export function getCanonicalSubcategoryName(category: string, subcategory: string): string | undefined {
  const categoryItem = CATEGORIES.find((item) => matchesTaxonomyValue(item.name, category));
  return categoryItem?.subcategories.find((item) => matchesTaxonomyValue(item, subcategory));
}

export function getToolBySlug(slug: string): Tool | undefined {
  return allTools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return allTools.filter((t) => matchesTaxonomyValue(t.category, category));
}

export function getRelatedTools(slug: string, limit = 4): Tool[] {
  const tool = getToolBySlug(slug);
  if (!tool) return [];
  // First: same subcategory
  const sameSubcat = allTools.filter(
    (t) => t.slug !== slug && matchesTaxonomyValue(t.subcategory, tool.subcategory)
  );
  if (sameSubcat.length >= limit) return sameSubcat.slice(0, limit);
  // Fill with same category (different subcategory)
  const sameCat = allTools.filter(
    (t) =>
      t.slug !== slug &&
      matchesTaxonomyValue(t.category, tool.category) &&
      !matchesTaxonomyValue(t.subcategory, tool.subcategory)
  );
  return [...sameSubcat, ...sameCat].slice(0, limit);
}
