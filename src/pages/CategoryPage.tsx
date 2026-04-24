import { useParams, Navigate, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { useToolFilters } from "@/hooks/useToolFilters";
import { useFilteredTools } from "@/hooks/useFilteredTools";
import { allTools } from "@/lib/tools";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { FilterBar } from "@/components/search/FilterBar";
import { ToolCard } from "@/components/tools/ToolCard";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategoryColor } from "@/lib/categoryColors";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { CATEGORIES, matchesTaxonomyValue, normalizeTaxonomyValue } from "@/lib/tools";
import { cn } from "@/lib/utils";
import Brand from "@/lib/brand";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const categoryKey = category ? normalizeTaxonomyValue(category) : "";
  const cat = CATEGORIES.find((c) => matchesTaxonomyValue(c.name, categoryKey));

  const { filters, setFilter, clearFilters, activeFilterCount } = useToolFilters();
  const [searchParams, setSearchParams] = useSearchParams();

  const filtersWithCategory = useMemo(() => ({
    ...filters,
    category: cat?.name || "",
  }), [filters, cat]);

  const { tools, total, isEmpty } = useFilteredTools(filtersWithCategory);

  const pricingBreakdown = useMemo(() => {
    if (!cat) return [] as { pricing: string; count: number }[];
    const inCategory = allTools.filter((t) => {
      if (t.category !== cat.name) return false;
      if (filters.subcategory && !matchesTaxonomyValue(t.subcategory, filters.subcategory)) return false;
      return true;
    });
    const buckets = new Map<string, number>();
    for (const t of inCategory) buckets.set(t.pricing, (buckets.get(t.pricing) ?? 0) + 1);
    return [...buckets.entries()]
      .map(([pricing, count]) => ({ pricing, count }))
      .sort((a, b) => b.count - a.count);
  }, [cat, filters.subcategory]);

  if (!cat) return <Navigate to="/" replace />;

  const color = getCategoryColor(cat.name);
  const activeSub = filters.subcategory || "";
  const hasSeoQueryParams = searchParams.toString().length > 0;

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
        title={`${cat.name} AI Tools | ${Brand.product.name_styled}`}
        description={`Browse ${total} AI tools in the ${cat.name} category. Filter by subcategory and pricing.`}
        url={`https://${Brand.product.domain}/category/${categoryKey}`}
        robots={hasSeoQueryParams ? "noindex, follow" : undefined}
      />
      <JsonLd
        id="collection-page"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${cat.name} AI Tools`,
          "description": `Browse ${total} AI tools in the ${cat.name} category on AIFOXX.`,
          "url": `https://${Brand.product.domain}/category/${categoryKey}`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": tools.length,
            "itemListElement": tools.slice(0, 50).map((tool, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `https://${Brand.product.domain}/ai/${tool.slug}`,
              "name": tool.name,
            })),
          },
        }}
      />
      <JsonLd
        id="breadcrumb"
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `https://${Brand.product.domain}` },
            { "@type": "ListItem", "position": 2, "name": cat.name, "item": `https://${Brand.product.domain}/category/${categoryKey}` },
          ],
        }}
      />
      <PageWrapper>
        <div className="space-y-5">
          <div>
            <h1 className="font-display font-black text-3xl" style={{ color: color.accent }}>
              <span className="inline-flex items-center gap-1">
                {(() => {
                  const Icon = getCategoryIcon(cat.name);
                  return Icon ? (
                    <Icon size={20} weight="duotone" style={{ color: color.accent, filter: `drop-shadow(0 0 8px ${color.accent}66)` }} />
                  ) : (
                    <span>{color.emoji}</span>
                  );
                })()}
                <span className="truncate">{cat.name.toUpperCase()}</span>
              </span>
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
                className={cn("font-mono text-xs px-2.5 py-1 rounded-[4px] whitespace-nowrap transition-all duration-150", !matchesTaxonomyValue(activeSub, sub) && "bg-bg-overlay border border-border-default text-text-secondary hover:text-text-primary")}
                style={matchesTaxonomyValue(activeSub, sub) ? { color: color.text, background: color.bg, border: `1px solid ${color.border}` } : undefined}
              >
                {sub}
              </button>
            ))}
          </div>

          <FilterBar activePricing={filters.pricing} onPricingChange={(v) => setFilter("pricing", v)} activeFilterCount={activeFilterCount} onClearAll={clearFilters} />

          {isEmpty ? (
            <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 text-center">
              <p className="font-display font-black" style={{ color: color.accent }}>&gt; NO_RESULTS_FOUND</p>
              <p className="font-mono text-text-secondary text-sm mt-2">
                {filters.pricing && pricingBreakdown.length > 0
                  ? `No ${filters.pricing} tools in ${cat.name}${activeSub ? ` / ${activeSub}` : ""}.`
                  : "No tools match these filters"}
              </p>
              {filters.pricing && pricingBreakdown.length > 0 && (
                <>
                  <p className="font-mono text-xs text-text-muted mt-4 tracking-widest">AVAILABLE PRICING</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {pricingBreakdown.map(({ pricing, count }) => (
                      <button
                        key={pricing}
                        onClick={() => setFilter("pricing", pricing)}
                        className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-border-default bg-bg-surface text-text-secondary hover:text-text-primary hover:border-[var(--cat-accent)] transition-colors duration-150"
                        style={{ "--cat-accent": color.accent } as React.CSSProperties}
                      >
                        {pricing} <span className="text-text-muted">· {count}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setFilter("pricing", "")}
                      className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-dashed border-border-dim text-text-muted hover:text-text-primary hover:border-border-default transition-colors duration-150"
                    >
                      Clear filter
                    </button>
                  </div>
                </>
              )}
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
