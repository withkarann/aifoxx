import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

export interface ToolFilters {
  search: string;
  category: string;
  subcategory: string;
  pricing: string;
  tags: string[];
}

export function useToolFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: ToolFilters = useMemo(() => ({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    subcategory: searchParams.get("subcategory") || "",
    pricing: searchParams.get("pricing") || "",
    tags: searchParams.getAll("tag"),
  }), [searchParams]);

  const setFilter = useCallback(
    (key: string, value: string | string[]) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (key === "tags") {
          next.delete("tag");
          (value as string[]).forEach((t) => next.append("tag", t));
        } else if (!value || (typeof value === "string" && !value.trim())) {
          next.delete(key);
        } else {
          next.set(key, value as string);
        }
        // Reset subcategory when category changes
        if (key === "category") next.delete("subcategory");
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.subcategory) count++;
    if (filters.pricing) count++;
    count += filters.tags.length;
    return count;
  }, [filters]);

  return { filters, setFilter, clearFilters, activeFilterCount };
}
