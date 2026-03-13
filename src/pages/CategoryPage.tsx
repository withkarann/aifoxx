import { useParams, Navigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { CATEGORIES } from "@/types/category";
import { allTools } from "@/lib/tools";
import { useToolFilters } from "@/hooks/useToolFilters";
import { useFilteredTools } from "@/hooks/useFilteredTools";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { FilterBar } from "@/components/search/FilterBar";
import { ToolCard } from "@/components/tools/ToolCard";
import { cn } from "@/lib/utils";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const cat = CATEGORIES.find((c) => c.name.toLowerCase() === category?.toLowerCase());

  const { filters, setFilter, clearFilters, activeFilterCount } = useToolFilters();
  const [, setSearchParams] = useSearchParams();

  // Sync category param into filters
  useEffect(() => {
    if (cat && filters.category !== cat.name) {
      setFilter("category", cat.name);
    }
  }, [cat, filters.category, setFilter]);

  const filtersWithCategory = useMemo(() => ({
    ...filters,
    category: cat?.name || "",
  }), [filters, cat]);

  const { tools, total, isEmpty } = useFilteredTools(filtersWithCategory);

  useEffect(() => {
    document.title = cat ? `${cat.name} | ToolsAI` : "Category Not Found | ToolsAI";
    return () => { document.title = "ToolsAI"; };
  }, [cat]);

  if (!cat) return <Navigate to="/" replace />;

  const activeSub = filters.subcategory || "";

  const handleSubChange = (sub: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (sub) {
        next.set("subcategory", sub);
      } else {
        next.delete("subcategory");
      }
      return next;
    }, { replace: true });
  };

  return (
    <PageWrapper>
      <div className="space-y-5">
        <div>
          <h1 className="font-display font-black text-3xl text-accent-green">
            &gt; {cat.name.toUpperCase()}
          </h1>
          <p className="font-mono text-xs text-text-muted mt-1">
            {total} tools in this category
          </p>
        </div>

        {/* Subcategory tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => handleSubChange("")}
            className={cn(
              "font-mono text-xs px-2.5 py-1 rounded-[4px] whitespace-nowrap transition-all duration-150",
              !activeSub
                ? "bg-accent-green text-primary-foreground font-semibold"
                : "bg-bg-overlay border border-border-default text-text-secondary hover:text-text-primary"
            )}
          >
            ALL
          </button>
          {cat.subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => handleSubChange(sub)}
              className={cn(
                "font-mono text-xs px-2.5 py-1 rounded-[4px] whitespace-nowrap transition-all duration-150",
                activeSub === sub
                  ? "bg-accent-green text-primary-foreground font-semibold"
                  : "bg-bg-overlay border border-border-default text-text-secondary hover:text-text-primary"
              )}
            >
              {sub}
            </button>
          ))}
        </div>

        <FilterBar
          activePricing={filters.pricing}
          onPricingChange={(v) => setFilter("pricing", v)}
          activeFilterCount={activeFilterCount}
          onClearAll={clearFilters}
        />

        {isEmpty ? (
          <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 text-center">
            <p className="font-display text-accent-green font-black">&gt; NO_RESULTS_FOUND</p>
            <p className="font-mono text-text-secondary text-sm mt-2">No tools match these filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
