import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bestData from "@/data/best-categories.json";
const bestCategories = bestData.categories;
import { allTools } from "@/lib/tools";
import { useToolFilters } from "@/hooks/useToolFilters";
import { useFilteredTools } from "@/hooks/useFilteredTools";
import { searchTools } from "@/lib/search";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterBar } from "@/components/search/FilterBar";
import { ToolCard } from "@/components/tools/ToolCard";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import Brand from "@/lib/brand";

// Organization + WebSite JSON-LD are emitted globally from index.html so every SSG'd page carries them.

const featuredTools = allTools.filter((t) => t.featured);
const TOOLS_PER_PAGE = 24;

const categoryCount = new Set(allTools.map((t) => t.category)).size;
const freeToolCount = allTools.filter(
  (t) => t.pricing === "Free" || t.pricing === "Freemium" || t.pricing === "Open Source"
).length;

const homeFaq = [
  {
    q: "What is AIFOXX?",
    a: `AIFOXX is an open-source directory of ${allTools.length}+ AI tools with real pricing, compliance data (SOC 2, ISO 27001, GDPR, HIPAA), data-storage details, and access-method comparison across ${categoryCount} categories.`,
  },
  {
    q: "How many AI tools are listed on AIFOXX?",
    a: `AIFOXX catalogs ${allTools.length} AI tools, of which ${freeToolCount} offer a free, freemium, or open-source tier.`,
  },
  {
    q: "Is AIFOXX free to use?",
    a: "Yes. AIFOXX is completely free to browse and is open source under the MIT license. The full tool dataset is public on GitHub.",
  },
  {
    q: "Is the compliance data on AIFOXX verified?",
    a: "Compliance flags (SOC 2, ISO 27001, GDPR, HIPAA) are community-sourced and may be incomplete or out of date. Treat them as a starting point and always verify certifications directly with the vendor's trust or security page before relying on them.",
  },
];
const homeFaqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

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

  const [displayText, setDisplayText] = useState("");
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const fullText = Brand.product.name_styled;
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const previousFilterSignatureRef = useRef("");

  // Featured carousel: track scroll position so edge fades and arrows only show
  // when there's actually more content to reach in that direction.
  const featuredScrollRef = useRef<HTMLDivElement | null>(null);
  const [featuredCanScrollLeft, setFeaturedCanScrollLeft] = useState(false);
  const [featuredCanScrollRight, setFeaturedCanScrollRight] = useState(false);

  const updateFeaturedEdges = useCallback(() => {
    const el = featuredScrollRef.current;
    if (!el) return;
    setFeaturedCanScrollLeft(el.scrollLeft > 4);
    setFeaturedCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollFeatured = useCallback((direction: 1 | -1) => {
    const el = featuredScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  }, []);

  useEffect(() => {
    updateFeaturedEdges();
    window.addEventListener("resize", updateFeaturedEdges);
    return () => window.removeEventListener("resize", updateFeaturedEdges);
  }, [updateFeaturedEdges]);

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
        title={`Best AI Tools 2026 | ${allTools.length.toLocaleString()} Curated AI Tools Directory | ${Brand.product.name_styled}`}
        description={`Discover the best AI tools for coding, writing, design, marketing, video & more. ${allTools.length.toLocaleString()} curated AI tools with real pricing, compliance & reviews. Updated daily.`}
        url={`https://${Brand.product.domain}`}
        robots={hasSeoQueryParams ? "noindex, follow" : undefined}
        keywords={[
          "best ai tools",
          "best ai tools 2026",
          "ai tools directory",
          "ai software comparison",
          "ai tools pricing",
        ]}
      />
      {!hasSeoQueryParams && <JsonLd schema={homeFaqLd} id="home-faq" />}
      {/* HERO: compact logo + wordmark + value prop + search, sized so the
          category sidebar and first tool cards stay above the fold on desktop */}
      <section
        className="hero-shell py-6 md:py-10 text-center px-4 border-b border-border-muted/30 relative overflow-hidden"
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
          className="flex flex-col items-center justify-center gap-3 md:gap-4 relative z-10"
          style={{
            transform: `translate3d(${parallax.x * 8}px, ${parallax.y * 6}px, 0)`,
          }}
        >
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <img
              src="/aifoxx.png"
              alt="AIFOXX AI Tools Directory Logo"
              className="hero-logo w-12 h-12 md:w-20 md:h-20 drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] select-none pointer-events-none"
            />
            <h1 className="hero-title font-display font-mono font-black text-3xl md:text-6xl text-text-primary tracking-widest min-h-[1.2em]">
              <span className="sr-only">AIFOXX: AI Tools Directory</span>
              <span aria-hidden="true">{displayText}</span>
            </h1>
          </div>
          <p className="font-display font-black text-base md:text-2xl text-text-primary max-w-2xl leading-tight">
            Verified compliance, real pricing &amp; data-privacy facts for {allTools.length.toLocaleString()} AI tools
          </p>
          <p className="font-mono text-xs md:text-sm text-text-secondary max-w-xl">
            {Brand.product.tagline}
          </p>
        </div>

        <div
          className="max-w-xl mx-auto mt-4 md:mt-6 relative z-10"
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
        <div className="flex flex-col gap-4" ref={resultsRef}>
          <div className="order-1">
            <FilterBar
              activePricing={filters.pricing}
              onPricingChange={(v) => setFilter("pricing", v)}
              activeFilterCount={activeFilterCount}
              onClearAll={clearFilters}
            />
          </div>

          {!hasActiveFilters && (
            <section className="order-3 md:order-2 space-y-3" aria-labelledby="best-by-cat-heading">
              <h2 id="best-by-cat-heading" className="font-mono text-xs text-text-muted tracking-widest">
                // BEST AI TOOLS BY CATEGORY
              </h2>
              <p className="hidden md:block font-sans text-sm text-text-secondary leading-relaxed max-w-3xl">
                AIFOXX curates the best AI tools across every major category, from AI coding assistants
                to image generators, marketing platforms, and writing tools. Browse our hand-picked guides
                below, or search 900+ tools above.
              </p>
              <div className="flex gap-2 overflow-x-auto flex-nowrap md:flex-wrap pb-1 -mx-1 px-1 scrollbar-thin">
                {bestCategories.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/best/${c.slug}`}
                    className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-border-default text-text-secondary hover:text-accent-green hover:border-accent-green/60 transition-colors shrink-0 whitespace-nowrap"
                  >
                    {c.headline}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!hasActiveFilters && featuredTools.length > 0 && (
            <section className="order-4 md:order-3 space-y-3" aria-labelledby="featured-heading">
              <h2 id="featured-heading" className="font-mono text-xs text-text-muted tracking-widest">// FEATURED AI TOOLS</h2>
              <div className="relative group/carousel">
                <div
                  ref={featuredScrollRef}
                  onScroll={updateFeaturedEdges}
                  className="flex gap-4 overflow-x-auto pb-2 px-1 scroll-smooth scroll-x"
                >
                  {featuredTools.map((tool) => (
                    <div key={tool.id} className="w-[280px] sm:w-[300px] shrink-0">
                      <ToolCard tool={tool} />
                    </div>
                  ))}
                </div>

                {/* Edge fades signal more cards off-screen */}
                {featuredCanScrollLeft && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-bg-base to-transparent" aria-hidden="true" />
                )}
                {featuredCanScrollRight && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-bg-base to-transparent" aria-hidden="true" />
                )}

                {/* Scroll arrows (desktop only; touch users swipe) */}
                {featuredCanScrollLeft && (
                  <button
                    type="button"
                    onClick={() => scrollFeatured(-1)}
                    aria-label="Scroll featured tools left"
                    className="hidden md:flex items-center justify-center absolute left-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary hover:border-accent-green/60 transition-colors duration-150 shadow-lg z-10"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                {featuredCanScrollRight && (
                  <button
                    type="button"
                    onClick={() => scrollFeatured(1)}
                    aria-label="Scroll featured tools right"
                    className="hidden md:flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary hover:border-accent-green/60 transition-colors duration-150 shadow-lg z-10"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </section>
          )}

          <div className="order-2 md:order-4 flex flex-col gap-4">
            <h2 className="font-mono text-xs text-text-muted tracking-wider">
              // SHOWING {visibleStart}-{visibleEnd} OF {total} RESULTS
            </h2>

            {isEmpty ? (
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
                    type="button"
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

            {!isEmpty && totalPages > 1 && (
              <nav className="pt-2 flex flex-col items-center gap-2" aria-label="Pagination">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPageSafe - 1)}
                    disabled={currentPageSafe <= 1}
                    className="font-mono text-xs px-4 min-h-11 inline-flex items-center rounded-[4px] border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                        type="button"
                        key={item}
                        onClick={() => goToPage(item)}
                        className={`font-mono text-xs min-w-11 min-h-11 inline-flex items-center justify-center px-2 rounded-[4px] border transition-all ${
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
                    type="button"
                    onClick={() => goToPage(currentPageSafe + 1)}
                    disabled={currentPageSafe >= totalPages}
                    className="font-mono text-xs px-4 min-h-11 inline-flex items-center rounded-[4px] border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    NEXT
                  </button>
                </div>
                <p className="font-mono text-xs text-text-muted" aria-live="polite">
                  Page {currentPageSafe} of {totalPages}
                </p>
              </nav>
            )}
          </div>

          {/* FAQ: visible content backing the FAQPage structured data */}
          {!hasActiveFilters && (
            <section className="order-5 space-y-4" aria-labelledby="home-faq-heading">
              <div className="h-px w-full bg-gradient-to-r from-accent-green to-transparent" />
              <h2 id="home-faq-heading" className="font-mono text-xs text-text-muted tracking-widest">// FAQ</h2>
              <div className="space-y-4">
                {homeFaq.map(({ q, a }) => (
                  <div key={q}>
                    <h3 className="font-display font-black text-sm text-text-primary">{q}</h3>
                    <p className="font-sans text-sm text-text-secondary leading-relaxed mt-1">{a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
