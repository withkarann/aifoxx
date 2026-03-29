import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { allTools } from "@/lib/tools";
import { useToolFilters } from "@/hooks/useToolFilters";
import { useFilteredTools } from "@/hooks/useFilteredTools";
import { searchTools } from "@/lib/search";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterBar } from "@/components/search/FilterBar";
import { ToolCard } from "@/components/tools/ToolCard";
import { ToolCardSkeleton } from "@/components/ui/ToolCardSkeleton";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import Brand from "@/lib/brand";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AIFOXX",
  "url": `https://${Brand.product.domain}`,
  "description": Brand.product.description,
  "potentialAction": {
    "@type": "SearchAction",
    "target": `https://${Brand.product.domain}/?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": Brand.product.name_styled,
  "url": `https://${Brand.product.domain}`,
  "sameAs": [Brand.product.repo],
};

const featuredTools = allTools.filter((t) => t.featured);
const TOOLS_PER_PAGE = 12;

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilter, clearFilters, activeFilterCount } = useToolFilters();
  const nonSearchFilters = useMemo(
    () => ({ ...filters, search: "" }),
    [filters]
  );
  const { tools: filteredTools } = useFilteredTools(nonSearchFilters);
  const tools = searchTools(filters.search, filteredTools);
  const total = tools.length;
  const isEmpty = total === 0;
  const hasActiveFilters = activeFilterCount > 0;

  const [loading, setLoading] = useState(true);
  const [displayText, setDisplayText] = useState("");
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const fullText = Brand.product.name_styled;
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const previousFilterSignatureRef = useRef("");

  const currentPage = useMemo(() => {
    const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
    if (Number.isNaN(rawPage) || rawPage < 1) return 1;
    return rawPage;
  }, [searchParams]);

  const totalPages = Math.max(1, Math.ceil(total / TOOLS_PER_PAGE));

  const hasSeoQueryParams = useMemo(() => {
    const seoParams = ["search", "category", "subcategory", "pricing", "tag", "page"];
    return seoParams.some((key) => searchParams.has(key));
  }, [searchParams]);

  const setPage = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, page);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextPage === 1) {
            next.delete("page");
          } else {
            next.set("page", String(nextPage));
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const filterSignature = useMemo(
    () =>
      JSON.stringify({
        search: filters.search,
        category: filters.category,
        subcategory: filters.subcategory,
        pricing: filters.pricing,
        tags: [...filters.tags].sort(),
      }),
    [filters.category, filters.pricing, filters.search, filters.subcategory, filters.tags]
  );

  const currentPageSafe = Math.min(currentPage, totalPages);

  const paginatedTools = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * TOOLS_PER_PAGE;
    return tools.slice(startIndex, startIndex + TOOLS_PER_PAGE);
  }, [currentPageSafe, tools]);

  const visibleStart = total === 0 ? 0 : (currentPageSafe - 1) * TOOLS_PER_PAGE + 1;
  const visibleEnd = Math.min(currentPageSafe * TOOLS_PER_PAGE, total);

  const pageItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items: Array<number | "ellipsis"> = [1];
    const left = Math.max(2, currentPageSafe - 1);
    const right = Math.min(totalPages - 1, currentPageSafe + 1);

    if (left > 2) items.push("ellipsis");
    for (let page = left; page <= right; page++) items.push(page);
    if (right < totalPages - 1) items.push("ellipsis");

    items.push(totalPages);
    return items;
  }, [currentPageSafe, totalPages]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [fullText]);

  useEffect(() => {
    if (previousFilterSignatureRef.current && previousFilterSignatureRef.current !== filterSignature) {
      setPage(1);
    }
    previousFilterSignatureRef.current = filterSignature;
  }, [filterSignature, setPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [currentPage, setPage, totalPages]);

  const goToPage = useCallback(
    (page: number) => {
      const nextPage = Math.min(totalPages, Math.max(1, page));
      if (nextPage === currentPageSafe) return;
      setPage(nextPage);
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [currentPageSafe, setPage, totalPages]
  );

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: nx, y: ny });
  };

  const resetHeroParallax = () => setParallax({ x: 0, y: 0 });

  return (
    <>
      <PageMeta
        title={`${Brand.product.name_styled} — 1000+ AI Tools Directory`}
        description={`Browse 1000+ AI tools by category, use case, and pricing. Open source directory.`}
        url={`https://${Brand.product.domain}`}
        robots={hasSeoQueryParams ? "noindex, follow" : undefined}
        keywords={[
          "AI tools directory",
          "best AI tools",
          "AI software comparison",
          "AI tools pricing",
          "AI compliance",
        ]}
      />
      <JsonLd schema={websiteSchema} id="website" />
      <JsonLd schema={organizationSchema} id="organization" />

      {/* HERO */}
      <section
        className="hero-shell py-20 text-center px-4 border-b border-border-muted/30 relative overflow-hidden"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={resetHeroParallax}
      >
        <div className="hero-grid" />
        <div className="hero-sweep" />
        <div
          className="hero-orb"
          style={{
            transform: `translate3d(${parallax.x * 16}px, ${parallax.y * 12}px, 0)`,
          }}
        />

        <div
          className="flex flex-col items-center justify-center gap-6 relative z-10"
          style={{
            transform: `translate3d(${parallax.x * 8}px, ${parallax.y * 6}px, 0)`,
          }}
        >
          <img 
            src="/aifoxx.png" 
            alt="AIFOXX Logo" 
            className="hero-logo w-24 h-24 md:w-32 md:h-32 drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] select-none pointer-events-none" 
          />
          <h1 className="hero-title font-display font-mono font-black text-5xl md:text-7xl text-text-primary tracking-widest min-h-[1.2em]">
            {displayText}
          </h1>
        </div>
        
        <div
          className="max-w-xl mx-auto mt-10 relative z-10"
          style={{
            transform: `translate3d(${parallax.x * 5}px, ${parallax.y * 4}px, 0)`,
          }}
        >
          <SearchBar
            value={filters.search}
            onChange={(v) => setFilter("search", v)}
          />
        </div>
      </section>

      {/* MAIN CONTENT */}
      <PageWrapper>
        <div className="space-y-4" ref={resultsRef}>
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
            // SHOWING {visibleStart}-{visibleEnd} OF {total} RESULTS
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ToolCardSkeleton key={i} />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="bg-bg-elevated border-2 border-dashed border-border-dim rounded-[8px] py-20 text-center relative overflow-hidden group">
              {/* Retro background decoration */}
              <div className="absolute inset-0 opacity-5 pointer-events-none font-mono text-[80px] font-black leading-none break-all select-none">
                00 11 00 11 00 11 00 11 00 11 00 11 00 11 00 11
              </div>
              
              <div className="relative z-10">
                <p className="font-display text-accent-red text-4xl md:text-5xl font-black tracking-tighter">
                  [! ERROR: NO_TOOLS_FOUND]
                </p>
                <div className="w-16 h-1 bg-accent-red mx-auto my-6 animate-pulse" />
                <p className="font-mono text-text-secondary text-sm max-w-md mx-auto px-4">
                  No tools match your current search and filters. Try another keyword or reset filters to view all tools.
                </p>
                <p className="font-mono text-accent-red text-xs mt-4 uppercase animate-pulse">
                  No matching tools found.
                </p>
                <button 
                  onClick={clearFilters} 
                  className="mt-8 font-mono text-xs text-accent-green hover:bg-accent-green hover:text-bg-base border border-accent-green px-4 py-2 rounded-sm transition-all duration-150"
                >
                  &gt; RESET_FILTERS (SHOW ALL TOOLS)
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}

          {!loading && !isEmpty && totalPages > 1 && (
            <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap">
              <button
                onClick={() => goToPage(currentPageSafe - 1)}
                disabled={currentPageSafe <= 1}
                className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                PREV
              </button>

              {pageItems.map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="font-mono text-xs text-text-muted px-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item)}
                    className={`font-mono text-xs min-w-8 px-2 py-1.5 rounded-[4px] border transition-all ${
                      item === currentPageSafe
                        ? "bg-accent-green text-primary-foreground border-accent-green"
                        : "border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
                    }`}
                    aria-current={item === currentPageSafe ? "page" : undefined}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPageSafe + 1)}
                disabled={currentPageSafe >= totalPages}
                className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
