import { useMemo } from "react";
import { allTools, getCanonicalCategoryName, getCanonicalSubcategoryName, matchesTaxonomyValue } from "@/lib/tools";
import { useDebounce } from "./useDebounce";
import type { ToolFilters } from "./useToolFilters";

export function useFilteredTools(filters: ToolFilters) {
  const debouncedSearch = useDebounce(filters.search, 300);
  const canonicalCategory = filters.category ? getCanonicalCategoryName(filters.category) ?? filters.category : "";
  const canonicalSubcategory = filters.subcategory && canonicalCategory
    ? getCanonicalSubcategoryName(canonicalCategory, filters.subcategory) ?? filters.subcategory
    : filters.subcategory;

  const tools = useMemo(() => {
    return allTools.filter((tool) => {
      // Search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matches =
          tool.name.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q) ||
          tool.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (canonicalCategory && !matchesTaxonomyValue(tool.category, canonicalCategory)) return false;
      if (canonicalSubcategory && !matchesTaxonomyValue(tool.subcategory, canonicalSubcategory)) return false;
      if (filters.pricing) {
        if (filters.pricing === "Free") {
          const freeTierText = tool.pricing_detail?.free_tier?.trim() ?? "";
          const hasFreeTier =
            freeTierText.length > 0 &&
            !/^(none|no free tier|n\/a)$/i.test(freeTierText);
          const inherentlyFree = tool.pricing === "Free" || tool.pricing === "Open Source";

          if (!inherentlyFree && !hasFreeTier) return false;
        } else if (filters.pricing === "Paid") {
          // "Paid" matches any tool that costs money somewhere: Paid, Freemium
          // (has paid tiers), Usage Based, Pay-as-you-go, Contact Sales.
          // Exclude only purely-free options.
          if (tool.pricing === "Free" || tool.pricing === "Open Source") return false;
          if (tool.pricing === "Freemium") {
            const paidText = tool.pricing_detail?.paid_plans?.trim() ?? "";
            const hasPaidPlans =
              paidText.length > 0 && !/^(none|no paid|n\/a)$/i.test(paidText);
            if (!hasPaidPlans) return false;
          }
        } else if (tool.pricing !== filters.pricing) {
          return false;
        }
      }

      // Tags: tool must include ALL selected tags
      if (filters.tags.length > 0) {
        if (!filters.tags.every((tag) => tool.tags.includes(tag))) return false;
      }

      return true;
    });
  }, [canonicalCategory, canonicalSubcategory, debouncedSearch, filters.pricing, filters.tags]);

  return {
    tools,
    total: tools.length,
    isEmpty: tools.length === 0,
  };
}
