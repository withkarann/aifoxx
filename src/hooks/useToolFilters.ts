import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { normalizeQuery } from "@/lib/query";
import { allTools } from "@/lib/tools";
import { getAvailablePricingOptions } from "@/lib/tool-filters";
import { useHydrated } from "./useHydrated";

const PRICING_OPTIONS = getAvailablePricingOptions(allTools);

/** Map a pricing value from the URL to the catalog's spelling, ignoring case.
 *  Unknown values are dropped so they cannot silently empty the results. */
function canonicalPricing(value: string): string | null {
  const lower = value.trim().toLowerCase();
  return PRICING_OPTIONS.find((p) => p.toLowerCase() === lower) ?? null;
}

export interface ToolFilters {
  search: string;
  category: string;
  subcategory: string;
  /** Pricing models to include. Empty means no pricing constraint. */
  pricing: string[];
  /** Keep only tools that can be used without paying. */
  freeTierOnly: boolean;
  tags: string[];
}

type ToolFilterKey = keyof ToolFilters;

const EMPTY_PARAMS = new URLSearchParams();

export function useToolFilters() {
  const [liveParams, setSearchParams] = useSearchParams();
  const hydrated = useHydrated();
  const searchParams = hydrated ? liveParams : EMPTY_PARAMS;

  const filters: ToolFilters = useMemo(() => ({
    search: normalizeQuery(searchParams.get("search")),
    category: searchParams.get("category") || "",
    subcategory: searchParams.get("subcategory") || "",
    // getAll keeps older single-value links such as ?pricing=Free working
    // while allowing several models to be selected at once.
    pricing: [...new Set(
      searchParams.getAll("pricing").map(canonicalPricing).filter((p): p is string => Boolean(p))
    )],
    freeTierOnly: searchParams.get("freeTier") === "1",
    tags: searchParams.getAll("tag"),
  }), [searchParams]);

  const setFilters = useCallback(
    (updates: Partial<ToolFilters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        const applyValue = (key: ToolFilterKey, value: string | string[] | boolean) => {
          if (key === "tags") {
            next.delete("tag");
            (value as string[]).forEach((tag) => next.append("tag", tag));
            return;
          }

          if (key === "pricing") {
            next.delete("pricing");
            (value as string[]).forEach((p) => next.append("pricing", p));
            return;
          }

          if (key === "freeTierOnly") {
            if (value) next.set("freeTier", "1");
            else next.delete("freeTier");
            return;
          }

          if (!value || (typeof value === "string" && !value.trim())) {
            next.delete(key);
            return;
          }

          next.set(key, value as string);
        };

        for (const [key, value] of Object.entries(updates) as [
          ToolFilterKey,
          string | string[] | boolean,
        ][]) {
          applyValue(key, value);
        }

        if (Object.prototype.hasOwnProperty.call(updates, "category") && !Object.prototype.hasOwnProperty.call(updates, "subcategory")) {
          next.delete("subcategory");
        }

        if (!next.get("category")) {
          next.delete("subcategory");
        }

        // Any change to what is shown starts again from the first page.
        next.delete("page");

        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setFilter = useCallback(
    (key: ToolFilterKey, value: string | string[] | boolean) => {
      setFilters({ [key]: value } as Partial<ToolFilters>);
    },
    [setFilters]
  );

  /** Add or remove one pricing model, leaving the others selected. */
  const togglePricing = useCallback(
    (value: string) => {
      const current = filters.pricing;
      const next = current.includes(value)
        ? current.filter((p) => p !== value)
        : [...current, value];
      setFilters({ pricing: next });
    },
    [filters.pricing, setFilters]
  );

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.subcategory) count++;
    count += filters.pricing.length;
    if (filters.freeTierOnly) count++;
    count += filters.tags.length;
    return count;
  }, [filters]);

  return { filters, setFilter, setFilters, togglePricing, clearFilters, activeFilterCount };
}
