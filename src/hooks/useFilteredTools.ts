import { useMemo } from "react";
import { allTools } from "@/lib/tools";
import { useDebounce } from "./useDebounce";
import type { ToolFilters } from "./useToolFilters";

export function useFilteredTools(filters: ToolFilters) {
  const debouncedSearch = useDebounce(filters.search, 300);

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

      if (filters.category && tool.category !== filters.category) return false;
      if (filters.subcategory && tool.subcategory !== filters.subcategory) return false;
      if (filters.pricing && tool.pricing !== filters.pricing) return false;

      // Tags: tool must include ALL selected tags
      if (filters.tags.length > 0) {
        if (!filters.tags.every((tag) => tool.tags.includes(tag))) return false;
      }

      return true;
    });
  }, [debouncedSearch, filters.category, filters.subcategory, filters.pricing, filters.tags]);

  return {
    tools,
    total: tools.length,
    isEmpty: tools.length === 0,
  };
}
