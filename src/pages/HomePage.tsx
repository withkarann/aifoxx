import { useEffect, useState } from "react";
import { allTools } from "@/lib/tools";
import { useToolFilters } from "@/hooks/useToolFilters";
import { useFilteredTools } from "@/hooks/useFilteredTools";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterBar } from "@/components/search/FilterBar";
import { ToolCard } from "@/components/tools/ToolCard";
import { ToolCardSkeleton } from "@/components/ui/ToolCardSkeleton";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageMeta } from "@/components/seo/PageMeta";

const featuredTools = allTools.filter((t) => t.featured);

const STATS = [
  { value: `${allTools.length}+`, label: "Tools" },
  { value: "8", label: "Categories" },
  { value: "100%", label: "Free" },
];

export default function HomePage() {
  const { filters, setFilter, clearFilters, activeFilterCount } = useToolFilters();
  const { tools, total, isEmpty } = useFilteredTools(filters);
  const hasActiveFilters = activeFilterCount > 0;

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <PageMeta
        title={`ToolsAI — ${allTools.length} AI Tools Directory`}
        description={`Browse ${allTools.length} AI tools by category, use case, and pricing. Open source directory.`}
        url="https://toolsai.dev"
      />

      {/* HERO */}
      <section className="py-16 text-center px-4">
        <p className="font-mono text-xs text-text-muted tracking-widest">
          // OPEN SOURCE AI TOOLS DIRECTORY
        </p>
        <h1 className="font-display font-black text-5xl md:text-6xl text-text-primary mt-4">
          <span className="text-accent-green">&gt; </span>DISCOVER AI TOOLS
        </h1>
        <p className="font-mono text-text-secondary text-sm mt-4 max-w-lg mx-auto">
          Browse {allTools.length} AI tools by category, use case, and pricing.
        </p>

        <div className="max-w-2xl mx-auto mt-8">
          <SearchBar
            value={filters.search}
            onChange={(v) => setFilter("search", v)}
          />
        </div>

        <div className="flex justify-center gap-6 mt-6">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="font-display font-black text-accent-green text-xl">{s.value}</span>
              <span className="font-mono text-xs text-text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <PageWrapper>
        <div className="space-y-4">
          <FilterBar
            activePricing={filters.pricing}
            onPricingChange={(v) => setFilter("pricing", v)}
            activeFilterCount={activeFilterCount}
            onClearAll={clearFilters}
          />

          {!hasActiveFilters && featuredTools.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-xs text-text-muted tracking-widest">// FEATURED</p>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                {featuredTools.map((tool) => (
                  <div key={tool.id} className="min-w-[280px] max-w-[320px] shrink-0">
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="font-mono text-xs text-text-muted tracking-wider">
            // SHOWING {total} RESULTS
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ToolCardSkeleton key={i} />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 text-center">
              <p className="font-display text-accent-green font-black">&gt; NO_RESULTS_FOUND</p>
              <p className="font-mono text-text-secondary text-sm mt-2">Try different keywords or clear filters</p>
              <button onClick={clearFilters} className="font-mono text-xs text-accent-green hover:underline mt-3">
                CLEAR_FILTERS
              </button>
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
    </>
  );
}
