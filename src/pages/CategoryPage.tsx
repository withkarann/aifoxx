import { useParams, Navigate, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { CATEGORIES } from "@/types/category";
import { useToolFilters } from "@/hooks/useToolFilters";
import { useFilteredTools } from "@/hooks/useFilteredTools";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { FilterBar } from "@/components/search/FilterBar";
import { ToolCard } from "@/components/tools/ToolCard";
import { PageMeta } from "@/components/seo/PageMeta";
import { getCategoryColor } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const cat = CATEGORIES.find((c) => c.name.toLowerCase().replace(/\s+/g, "-") === category?.toLowerCase() || c.name.toLowerCase() === category?.toLowerCase());

  const { filters, setFilter, clearFilters, activeFilterCount } = useToolFilters();
  const [, setSearchParams] = useSearchParams();

  const filtersWithCategory = useMemo(() => ({
    ...filters,
    category: cat?.name || "",
  }), [filters, cat]);

  const { tools, total, isEmpty } = useFilteredTools(filtersWithCategory);

  if (!cat) return <Navigate to="/" replace />;

  const color = getCategoryColor(cat.name);
  const activeSub = filters.subcategory || "";

  const handleSubChange = (sub: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (sub) { next.set("subcategory", sub); } else { next.delete("subcategory"); }
      return next;
    }, { replace: true });
  };

  return (
    <>
      <PageMeta
        title={`${cat.name} AI Tools | ToolsAI`}
        description={`Browse ${total} AI tools in the ${cat.name} category. Filter by subcategory and pricing.`}
        url={`https://toolsai.dev/category/${category}`}
      />
      <PageWrapper>
        <div className="space-y-5">
          <div>
            <h1 className="font-display font-black text-3xl" style={{ color: color.accent }}>
              {color.emoji} &gt; {cat.name.toUpperCase()}
            </h1>
            <p className="font-mono text-xs text-text-muted mt-1">{total} tools in this category</p>
            <div className="h-[2px] w-24 mt-2 rounded-full" style={{ background: color.accent, boxShadow: color.glow }} />
          </div>

          <div className="flex items-center gap-1.5 scroll-x pb-1">
            <button
              onClick={() => handleSubChange("")}
              className={cn("font-mono text-xs px-2.5 py-1 rounded-[4px] whitespace-nowrap transition-all duration-150", !activeSub ? "font-semibold" : "bg-bg-overlay border border-border-default text-text-secondary hover:text-text-primary")}
              style={!activeSub ? { color: color.text, background: color.bg, border: `1px solid ${color.border}` } : undefined}
            >
              ALL
            </button>
            {cat.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => handleSubChange(sub)}
                className={cn("font-mono text-xs px-2.5 py-1 rounded-[4px] whitespace-nowrap transition-all duration-150", activeSub !== sub && "bg-bg-overlay border border-border-default text-text-secondary hover:text-text-primary")}
                style={activeSub === sub ? { color: color.text, background: color.bg, border: `1px solid ${color.border}` } : undefined}
              >
                {sub}
              </button>
            ))}
          </div>

          <FilterBar activePricing={filters.pricing} onPricingChange={(v) => setFilter("pricing", v)} activeFilterCount={activeFilterCount} onClearAll={clearFilters} />

          {isEmpty ? (
            <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 text-center">
              <p className="font-display font-black" style={{ color: color.accent }}>&gt; NO_RESULTS_FOUND</p>
              <p className="font-mono text-text-secondary text-sm mt-2">No tools match these filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool) => (<ToolCard key={tool.id} tool={tool} />))}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
