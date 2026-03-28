import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { allNews, getNewsByCategory, NEWS_COUNTS } from "@/lib/news";
import { type NewsCategory, type NewsSource } from "@/types/news";
import { PageMeta } from "@/components/seo/PageMeta";
import Brand from "@/lib/brand";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<NewsSource, string> = {
  hn: "HN",
  producthunt: "Product Hunt",
  techcrunch: "TechCrunch",
};

const SOURCE_COLORS: Record<NewsSource, string> = {
  hn: "text-orange-400",
  producthunt: "text-rose-400",
  techcrunch: "text-accent-green",
};

type Tab = "all" | NewsCategory;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "news", label: "News" },
  { id: "new-tool", label: "New Tools" },
];

export default function NewsPage() {
  const [tab, setTab] = useState<Tab>("all");

  const items = getNewsByCategory(tab === "all" ? "all" : tab);

  return (
    <>
      <PageMeta
        title={`AI News — Today in AI | ${Brand.product.name_styled}`}
        description={`Latest AI news and new tool releases. Curated daily from Hacker News, Product Hunt, and TechCrunch.`}
        url={`https://${Brand.product.domain}/news`}
      />

      {/* Hero */}
      <section className="py-14 text-center px-4 border-b border-border-muted/30 bg-bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-accent-green border border-accent-green/30 px-3 py-1 rounded-[3px]">
            AI NEWS
          </span>
          <h1 className="font-display font-black text-4xl md:text-5xl text-text-primary tracking-tight">
            Today in AI
          </h1>
          <p className="font-mono text-sm text-text-secondary max-w-lg">
            {NEWS_COUNTS.total} stories — curated daily from HN, Product Hunt &amp; TechCrunch.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Tab strip */}
        <div className="flex items-center gap-1 mb-6 border-b border-border-dim">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "font-mono text-xs tracking-widest px-4 py-2 -mb-px border-b-2 transition-colors duration-150",
                tab === id
                  ? "border-accent-green text-accent-green"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* News list */}
        {items.length === 0 ? (
          <div className="bg-bg-elevated border-2 border-dashed border-border-dim rounded-[8px] py-20 text-center">
            <p className="font-display text-accent-red text-3xl font-black tracking-tight">
              NO STORIES
            </p>
            <p className="font-mono text-text-secondary text-sm mt-3">
              The daily scrape hasn&apos;t run yet. Check back soon.
            </p>
          </div>
        ) : (
          <ol className="space-y-0">
            {items.map((item, idx) => (
              <li
                key={item.id}
                className="flex items-baseline gap-3 py-2.5 border-b border-border-dim/50 group"
              >
                {/* Number */}
                <span className="font-mono text-xs text-text-muted w-6 shrink-0 text-right select-none">
                  {idx + 1}.
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-text-primary hover:text-accent-green transition-colors duration-100 leading-snug inline"
                  >
                    {item.title}
                  </a>
                  <span className="font-mono text-xs text-text-muted ml-1.5 whitespace-nowrap">
                    ({item.domain})
                  </span>

                  {/* Metadata row */}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("font-mono text-[10px]", SOURCE_COLORS[item.source])}>
                      {SOURCE_LABELS[item.source]}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">·</span>
                    <span className="font-mono text-[10px] text-text-muted">{item.age}</span>
                    {item.points !== undefined && (
                      <>
                        <span className="font-mono text-[10px] text-text-muted">·</span>
                        <span className="font-mono text-[10px] text-text-muted">
                          {item.points} pts
                        </span>
                      </>
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-text-muted hover:text-accent-green"
                      aria-label="Open link"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
