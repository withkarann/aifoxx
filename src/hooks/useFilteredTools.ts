import { useMemo } from "react";
import { allTools, getCanonicalCategoryName, getCanonicalSubcategoryName, matchesTaxonomyValue } from "@/lib/tools";
import { matchesPricingFilters } from "@/lib/tool-filters";
import { searchTools } from "@/lib/search";
import { useDebounce } from "./useDebounce";
import type { ToolFilters } from "./useToolFilters";

export function useFilteredTools(filters: ToolFilters) {
  const debouncedSearch = useDebounce(filters.search, 300);
  const canonicalCategory = filters.category ? getCanonicalCategoryName(filters.category) ?? filters.category : "";
  const canonicalSubcategory = filters.subcategory && canonicalCategory
    ? getCanonicalSubcategoryName(canonicalCategory, filters.subcategory) ?? filters.subcategory
    : filters.subcategory;

  const tools = useMemo(() => {
    const matching = allTools.filter((tool) => {
      if (canonicalCategory && !matchesTaxonomyValue(tool.category, canonicalCategory)) return false;
      if (canonicalSubcategory && !matchesTaxonomyValue(tool.subcategory, canonicalSubcategory)) return false;

      if (!matchesPricingFilters(tool, {
        pricing: filters.pricing,
        freeTierOnly: filters.freeTierOnly,
      })) {
        return false;
      }

      // Tags: tool must include ALL selected tags
      if (filters.tags.length > 0) {
        if (!filters.tags.every((tag) => tool.tags.includes(tag))) return false;
      }

      return true;
    });
    // Same ranked search as the home page, so a query gives the same tools everywhere.
    return searchTools(debouncedSearch, matching);
  }, [
    canonicalCategory,
    canonicalSubcategory,
    debouncedSearch,
    filters.pricing,
    filters.freeTierOnly,
    filters.tags,
  ]);

  return {
    tools,
    total: tools.length,
    isEmpty: tools.length === 0,
  };
}
