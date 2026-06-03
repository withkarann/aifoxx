import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  getNewsByCategory,
  NEWS_COUNTS,
  formatAbsoluteDate,
  getLatestNewsDate,
  groupNewsByDate,
} from "@/lib/news";
import { type NewsCategory } from "@/types/news";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import Brand from "@/lib/brand";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

// Display labels for known sources; unknown sources fall back to capitalised id
const SOURCE_LABELS: Record<string, string> = {
  // news
  hn: "HN",
  techcrunch: "TechCrunch",
  venturebeat: "VentureBeat",
  "mit-techreview": "MIT Tech Review",
  zdnet: "ZDNet",
  huggingface: "Hugging Face",
  theverge: "The Verge",
  arstechnica: "Ars Technica",
  "tldr-ai": "TLDR AI",
  analyticsvidhya: "Analytics Vidhya",
  towardsdatascience: "Towards Data Science",
  thesequence: "The Sequence",
  aisnakeoil: "AI Snake Oil",
  // new tools
  "rundown-ai": "The Rundown AI",
  neuron: "The Neuron",
  "import-ai": "Import AI",
  lastweekinai: "Last Week in AI",
  "launch-hn": "Launch HN",
};

const SOURCE_COLORS: Record<string, string> = {
  hn: "text-orange-400",
  techcrunch: "text-accent-green",
  venturebeat: "text-blue-400",
  "mit-techreview": "text-red-400",
  huggingface: "text-amber-400",
  "tldr-ai": "text-indigo-400",
  thesequence: "text-violet-400",
  // new tools
  "rundown-ai": "text-cyan-400",
  neuron: "text-pink-400",
  "import-ai": "text-purple-400",
  lastweekinai: "text-blue-400",
  "launch-hn": "text-orange-400",
};

function sourceLabel(id: string) {
  return SOURCE_LABELS[id] ?? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function sourceColor(id: string) {
  return SOURCE_COLORS[id] ?? "text-text-muted";
}

// Only allow http/https URLs — prevents javascript: protocol XSS via RSS feed data
function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : "#";
  } catch {
    return "#";
  }
}

type Tab = "all" | NewsCategory;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "news", label: "News" },
  { id: "new-tool", label: "New Tools" },
];

export default function NewsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [source, setSource] = useState("");
  const allItems = useMemo(() => getNewsByCategory("all"), []);
  const latestDate = useMemo(() => getLatestNewsDate(), []);

  const newsSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Today in AI",
    "description": `Latest AI news and new tools from ${NEWS_COUNTS.total} curated stories on AIFOXX.`,
    "url": `https://${Brand.product.domain}/news`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": allItems.slice(0, 30).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.title,
        "url": item.url,
      })),
    },
  }), [allItems]);

  const baseItems = useMemo(() => getNewsByCategory(tab === "all" ? "all" : tab), [tab]);

  const sourceOptions = useMemo(
    () =>
      Array.from(new Set(baseItems.map((i) => i.source))).sort((a, b) =>
        sourceLabel(a).localeCompare(sourceLabel(b))
      ),
    [baseItems]
  );

  const filteredItems = useMemo(
    () => (source ? baseItems.filter((i) => i.source === source) : baseItems),
    [baseItems, source]
  );

  const shown = useMemo(() => filteredItems.slice(0, visible), [filteredItems, visible]);
  // Group relative to the newest story's date (see groupNewsByDate).
  const groups = useMemo(() => groupNewsByDate(shown), [shown]);
  const hasMore = visible < filteredItems.length;

  function handleTabChange(next: Tab) {
    setTab(next);
    setSource("");
    setVisible(PAGE_SIZE);
  }

  function handleSourceChange(next: string) {
    setSource(next);
    setVisible(PAGE_SIZE);
  }

  return (
    <>
      <PageMeta
        title={`AI News — Today in AI | ${Brand.product.name_styled}`}
        description={`Latest AI news and new tool releases. Curated daily from ${NEWS_COUNTS.total} stories across HN, VentureBeat, TechCrunch, Wired and more.`}
        url={`https://${Brand.product.domain}/news`}
        keywords={["AI news", "new AI tools", "AI releases", "today in AI"]}
      />
      <JsonLd schema={newsSchema} id="news-collection" />

      {/* Hero */}
      <section className="py-14 text-center px-4 border-b border-border-muted/30 bg-bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-accent-green border border-accent-green/30 px-3 py-1 rounded-[3px]">
            AI UPDATES
          </span>
          <h1 className="font-display font-black text-4xl md:text-5xl text-text-primary tracking-tight">
            Today in AI
          </h1>
          <p className="font-mono text-sm text-text-secondary max-w-lg">
            AI news updates and AI tool releases.
          </p>
          {latestDate && (
            <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase mt-1">
              Last updated {formatAbsoluteDate(latestDate)}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Tab strip */}
        <div className="flex items-center gap-1 mb-6 border-b border-border-dim">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTabChange(id)}
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

        {/* Source filter */}
        {sourceOptions.length > 1 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="font-mono text-[10px] tracking-widest text-text-muted">SOURCE:</span>
            <select
              value={source}
              onChange={(e) => handleSourceChange(e.target.value)}
              aria-label="Filter stories by source"
              className="bg-bg-overlay border border-border-default rounded-[4px] px-2.5 py-1 font-mono text-xs text-text-primary"
            >
              <option value="">ALL SOURCES</option>
              {sourceOptions.map((s) => (
                <option key={s} value={s}>{sourceLabel(s)}</option>
              ))}
            </select>
            {source && (
              <button
                type="button"
                onClick={() => handleSourceChange("")}
                className="font-mono text-[10px] text-accent-green hover:underline"
              >
                CLEAR
              </button>
            )}
          </div>
        )}

        {/* News list */}
        {filteredItems.length === 0 ? (
          <div className="bg-bg-elevated border-2 border-dashed border-border-dim rounded-[8px] py-20 text-center">
            <p className="font-display text-accent-red text-3xl font-black tracking-tight">
              NO STORIES
            </p>
            <p className="font-mono text-text-secondary text-sm mt-3">
              Fresh stories are on the way — check back soon.
            </p>
          </div>
        ) : (
          <>
            {(() => {
              let runningOffset = 0;
              return groups.map((group, groupIdx) => {
                const offset = runningOffset;
                runningOffset += group.items.length;
                return (
                  <div key={group.label}>
                    <h2 className={cn(
                      "font-mono text-[10px] tracking-widest text-text-muted uppercase mt-5 mb-2 pb-1 border-b border-border-dim/50",
                      groupIdx === 0 && "mt-0"
                    )}>
                      {group.label}
                    </h2>
                    <ol className="space-y-0">
                      {group.items.map((item, localIdx) => {
                        const displayNumber = offset + localIdx + 1;
                        return (
                          <li
                            key={item.id}
                            className="flex items-baseline gap-3 py-2.5 border-b border-border-dim/50 group"
                          >
                            {/* Number — continuous across all groups */}
                            <span className="font-mono text-xs text-text-muted w-6 shrink-0 text-right select-none">
                              {displayNumber}.
                            </span>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <a
                                href={safeUrl(item.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-sm text-text-primary hover:text-accent-green transition-colors duration-100 leading-snug inline"
                              >
                                {item.title}
                              </a>
                              <span className="font-mono text-xs text-text-muted ml-1.5">
                                ({item.domain})
                              </span>

                              {/* Metadata row */}
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn("font-mono text-[10px]", sourceColor(item.source))}>
                                  {sourceLabel(item.source)}
                                </span>
                                <span className="font-mono text-[10px] text-text-muted">·</span>
                                <span
                                  className="font-mono text-[10px] text-text-muted"
                                  title={formatAbsoluteDate(item.date)}
                                >
                                  {formatAbsoluteDate(item.date)}
                                </span>
                                {item.points !== undefined && (
                                  <>
                                    <span className="font-mono text-[10px] text-text-muted">·</span>
                                    <span className="font-mono text-[10px] text-text-muted">
                                      {item.points} pts
                                    </span>
                                  </>
                                )}
                                <a
                                  href={safeUrl(item.url)}
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
                        );
                      })}
                    </ol>
                  </div>
                );
              });
            })()}

            {/* Show more / count */}
            <div className="mt-6 flex items-center justify-between">
              <span className="font-mono text-xs text-text-muted">
                Showing {shown.length} of {filteredItems.length}
              </span>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="font-mono text-xs text-accent-green hover:bg-accent-green hover:text-primary-foreground border border-accent-green px-4 py-1.5 rounded-[4px] transition-all duration-150"
                >
                  SHOW MORE
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
