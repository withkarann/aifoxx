import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { allTools, getToolBySlug } from "@/lib/tools";
import { searchTools } from "@/lib/search";
import type { Tool } from "@/types/tool";
import { PageMeta } from "@/components/seo/PageMeta";
import { ComparisonView } from "@/components/tools/ComparisonView";
import { useCompare } from "@/contexts/CompareContext";
import Brand from "@/lib/brand";

// Starting suggestions for an empty comparison, drawn from widely used tools
// so the shortcuts are names people recognise.
const popularTools = allTools.filter((t) => t.popular);

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selected, setSelected, max } = useCompare();
  const [query, setQuery] = useState("");

  // Keep the URL in sync with the tray so comparisons are shareable.
  const writeUrl = (slugs: string[]) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (slugs.length) params.set("tools", slugs.join(","));
        else params.delete("tools");
        return params;
      },
      { replace: true }
    );
  };

  // One-time seed: a shared ?tools= link wins and populates the tray; otherwise
  // an existing tray (from browsing) populates the URL for sharing. Ref-guarded
  // so it runs once; the deps it reads are intentionally not re-subscribed.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const raw = searchParams.get("tools");
    if (raw) {
      const urlSlugs = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, max);
      setSelected(urlSlugs);
    } else if (selected.length) {
      writeUrl(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time seed; ref-guarded
  }, []);

  const tools = useMemo(
    () => selected.map((s) => getToolBySlug(s)).filter((t): t is Tool => Boolean(t)),
    [selected]
  );

  const commit = (next: string[]) => {
    const unique = [...new Set(next)].slice(0, max);
    setSelected(unique);
    writeUrl(unique);
  };

  const addTool = (slug: string) => {
    if (selected.includes(slug) || selected.length >= max) return;
    commit([...selected, slug]);
    setQuery("");
  };
  const removeTool = (slug: string) => commit(selected.filter((s) => s !== slug));

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchTools(q).filter((t) => !selected.includes(t.slug)).slice(0, 6);
  }, [query, selected]);

  const canAdd = tools.length < max;
  const titleNames = tools.length ? tools.map((t) => t.name).join(" vs ") : "Side-by-Side AI Tool Comparison";

  return (
    <>
      <PageMeta
        title={`Compare ${titleNames} | ${Brand.product.name_styled}`}
        description={
          tools.length
            ? `Compare ${tools.map((t) => t.name).join(", ")} side by side: pricing, compliance, access methods, and data handling.`
            : "Compare AI tools side by side: pricing, compliance (SOC 2, ISO 27001, GDPR, HIPAA), access methods, and data storage. Pick any tools to see the differences."
        }
        url={`https://${Brand.product.domain}/compare`}
        robots={tools.length ? "noindex, follow" : undefined}
        keywords={["compare ai tools", "ai tool comparison", "ai tools side by side"]}
      />

      <div className="max-w-6xl mx-auto w-full px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <p className="font-mono text-[10px] tracking-widest text-accent-green border border-accent-green/30 px-2.5 py-1 rounded-[3px] inline-block">
            COMPARE
          </p>
          <h1 className="font-display font-black text-3xl md:text-4xl text-text-primary tracking-tight">
            Compare AI Tools
          </h1>
          <p className="font-mono text-sm text-text-secondary max-w-2xl">
            Put up to {max} tools head to head: pricing, compliance, access methods, and how they handle your data.
            Rows that differ are highlighted.
          </p>
        </header>

        {/* Add-a-tool search */}
        {canAdd ? (
          <div className="relative max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Add a tool to compare…"
              aria-label="Add a tool to compare"
              className="w-full bg-bg-elevated border border-border-default rounded-[6px] px-4 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/60 transition-colors"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full bg-bg-elevated border border-border-default rounded-[6px] shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                {suggestions.map((t) => (
                  <li key={t.slug}>
                    <button
                      type="button"
                      onClick={() => addTool(t.slug)}
                      className="w-full flex items-center justify-between gap-3 text-left px-3 py-2 hover:bg-bg-overlay transition-colors min-h-[44px]"
                    >
                      <span className="font-mono text-sm text-text-primary truncate">{t.name}</span>
                      <span className="font-mono text-[10px] text-text-muted shrink-0">{t.category}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="font-mono text-xs text-text-muted">Max {max} tools. Remove one to add another.</p>
        )}

        {/* Empty state */}
        {tools.length === 0 ? (
          <div className="bg-bg-elevated border-2 border-dashed border-border-dim rounded-[8px] p-8 text-center space-y-4">
            <p className="font-display text-text-primary text-xl font-black tracking-tight">Pick tools to compare</p>
            <p className="font-mono text-text-secondary text-sm">Search above, or start with a popular one:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTools.slice(0, 8).map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => addTool(t.slug)}
                  className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-border-default text-text-secondary hover:text-accent-green hover:border-accent-green/60 transition-colors"
                >
                  + {t.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ComparisonView tools={tools} onRemove={removeTool} />
        )}
      </div>
    </>
  );
}
