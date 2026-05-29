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
import { breadcrumbSchema, faqPageSchema, itemListSchema, absoluteUrl } from "@/lib/structuredData";
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

  // Canonical (unfiltered) category facts — used for visible copy + structured
  // data so the pre-rendered page describes the whole category, not a filtered view.
  const seo = useMemo(() => {
    if (!cat) return null;
    const inCategory = allTools.filter((t) => t.category === cat.name);
    const isFree = (p: string) => p === "Free" || p === "Freemium" || p === "Open Source";
    const freeCount = inCategory.filter((t) => isFree(t.pricing)).length;
    const complianceCount = (key: "soc2" | "iso27001" | "gdpr" | "hipaa") =>
      inCategory.filter((t) => t.compliance?.[key] === true).length;
    const topTools = [...inCategory]
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
      .slice(0, 20);
    const subList = cat.subcategories.slice(0, 6).join(", ");
    return {
      count: inCategory.length,
      freeCount,
      gdpr: complianceCount("gdpr"),
      soc2: complianceCount("soc2"),
      topNames: topTools.slice(0, 5).map((t) => t.name),
      topTools,
      subList,
    };
  }, [cat]);

  if (!cat || !seo) return <Navigate to="/" replace />;

  const color = getCategoryColor(cat.name);
  const activeSub = filters.subcategory || "";
  const hasSeoQueryParams = searchParams.toString().length > 0;
  const categoryUrl = `${absoluteUrl(`/category/${categoryKey}`)}`;

  const intro =
    `AIFOXX lists ${seo.count} ${cat.name} AI tools — ${seo.freeCount} with a free or freemium tier, ` +
    `${seo.soc2} marked SOC 2 and ${seo.gdpr} marked GDPR-ready. ` +
    `Compare real pricing, access methods, and compliance across ${cat.subcategories.length} subcategories` +
    (seo.subList ? ` (${seo.subList}).` : ".");

  const categoryFaq = [
    {
      q: `What are the best ${cat.name} AI tools?`,
      a: seo.topNames.length
        ? `Popular ${cat.name} AI tools on AIFOXX include ${seo.topNames.join(", ")}. Browse all ${seo.count} to compare pricing, access methods, and compliance.`
        : `AIFOXX lists ${seo.count} ${cat.name} AI tools you can compare by pricing, access method, and compliance.`,
    },
    {
      q: `How many ${cat.name} AI tools are free?`,
      a: `${seo.freeCount} of the ${seo.count} ${cat.name} tools in this directory offer a free, freemium, or open-source tier.`,
    },
    {
      q: `Which ${cat.name} AI tools are SOC 2 or GDPR compliant?`,
      a: `${seo.soc2} ${cat.name} tools are marked SOC 2 and ${seo.gdpr} are marked GDPR-ready in this directory. Compliance data is community-sourced — always verify it directly with the vendor before relying on it.`,
    },
    {
      q: `What does the ${cat.name} category include?`,
      a: `The ${cat.name} category spans ${cat.subcategories.length} subcategories${seo.subList ? `: ${seo.subList}` : ""}.`,
    },
  ];

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
        schema={itemListSchema(
          seo.topTools.map((t) => ({ name: t.name, url: absoluteUrl(`/ai/${t.slug}`) })),
          {
            name: `${cat.name} AI Tools`,
            url: categoryUrl,
            description: intro,
          }
        )}
      />
      <JsonLd
        id="category-breadcrumb"
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: `${cat.name} AI Tools`, url: `/category/${categoryKey}` },
        ])}
      />
      <JsonLd id="category-faq" schema={faqPageSchema(categoryFaq)} />
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
            <p className="font-mono text-sm text-text-secondary leading-relaxed mt-3 max-w-3xl">{intro}</p>
          </div>

          <div className="flex items-center gap-1.5 scroll-x pb-1">
            <button
              type="button"
              onClick={() => handleSubChange("")}
              className={cn("font-mono text-xs px-2.5 py-1 rounded-[4px] whitespace-nowrap transition-all duration-150", !activeSub ? "font-semibold" : "bg-bg-overlay border border-border-default text-text-secondary hover:text-text-primary")}
              style={!activeSub ? { color: color.text, background: color.bg, border: `1px solid ${color.border}` } : undefined}
            >
              ALL
            </button>
            {cat.subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
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
                        type="button"
                        onClick={() => setFilter("pricing", pricing)}
                        className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-border-default bg-bg-surface text-text-secondary hover:text-text-primary hover:border-[var(--cat-accent)] transition-colors duration-150"
                        style={{ "--cat-accent": color.accent } as React.CSSProperties}
                      >
                        {pricing} <span className="text-text-muted">· {count}</span>
                      </button>
                    ))}
                    <button
                      type="button"
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

          {/* FAQ — visible content backing the FAQPage structured data */}
          <section className="mt-10 space-y-4">
            <div className="h-px w-full" style={{ background: `linear-gradient(to right, ${color.accent}, transparent)` }} />
            <p className="font-mono text-xs text-text-muted tracking-widest">// FAQ</p>
            <div className="space-y-4">
              {categoryFaq.map(({ q, a }) => (
                <div key={q}>
                  <h2 className="font-display font-black text-sm text-text-primary">{q}</h2>
                  <p className="font-mono text-sm text-text-secondary leading-relaxed mt-1">{a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </PageWrapper>
    </>
  );
}
