import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Github, Star, ExternalLink } from "lucide-react";
import { allMcpServers, searchMcpServers, SKILL_COUNTS } from "@/lib/skills";
import { type Skill } from "@/types/skill";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import { isSafeHttpUrl } from "@/lib/utils";
import Brand from "@/lib/brand";

const SKILLS_PER_PAGE = 18;

function McpServerCard({ skill }: { skill: Skill }) {
  return (
    <div className="relative overflow-hidden bg-bg-surface border border-border-default rounded-[6px] p-4 flex flex-col gap-3 transition-all duration-150 hover:border-accent-green/50 hover:shadow-glow">
      {/* Top bar accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-green opacity-[0.95]" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-bg-elevated border border-border-default rounded-[4px] flex items-center justify-center shrink-0">
            <Github size={14} className="text-text-secondary" />
          </div>
          <span className="font-display font-black text-text-primary text-sm truncate">
            {skill.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {skill.is_official && (
            <span className="font-mono text-[10px] text-accent-amber border border-accent-amber/40 px-1.5 py-0.5 rounded-[3px]">
              ★ OFFICIAL
            </span>
          )}
          <div className="flex items-center gap-1 font-mono text-[10px] text-accent-green border border-accent-green/40 px-1.5 py-0.5 rounded-[3px]">
            <Star size={10} className="fill-accent-green" />
            {skill.stars.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="font-mono text-xs text-text-secondary line-clamp-2 min-w-0">
        {skill.description || "No description available."}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-dim mt-auto">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {skill.tool_slug && (
            <Link
              to={`/ai/${skill.tool_slug}`}
              onClick={(e) => e.stopPropagation()}
              className="font-mono text-[10px] px-2 py-0.5 rounded-[3px] bg-bg-elevated border border-accent-green/30 text-accent-green hover:bg-accent-green/10 transition-colors"
            >
              {skill.tool_name}
            </Link>
          )}
        </div>
        <a
          href={isSafeHttpUrl(skill.github_url) ? skill.github_url : undefined}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex items-center gap-1 font-mono text-[10px] text-text-primary hover:text-accent-green hover:drop-shadow-[0_0_6px_currentColor] transition-all duration-150 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={10} />
          GitHub
        </a>
      </div>
    </div>
  );
}

export default function McpServersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "MCP Servers",
    "description": `Browse ${SKILL_COUNTS.mcpServers} Model Context Protocol servers on AIFOXX.`,
    "url": `https://${Brand.product.domain}/mcp`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": allMcpServers.slice(0, 30).map((skill, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": skill.name,
        "url": skill.github_url,
      })),
    },
  }), []);

  const filtered = useMemo(() => {
    return query.trim() ? searchMcpServers(query) : allMcpServers;
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / SKILLS_PER_PAGE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * SKILLS_PER_PAGE, pageSafe * SKILLS_PER_PAGE);

  const handleQueryChange = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  return (
    <>
      <PageMeta
        title={`MCP Servers — Model Context Protocol Integrations | ${Brand.product.name_styled}`}
        description={`Browse ${SKILL_COUNTS.mcpServers} MCP servers: connect Claude to tools, APIs, and data sources via Model Context Protocol.`}
        url={`https://${Brand.product.domain}/mcp`}
        keywords={["MCP servers", "Model Context Protocol", "Claude MCP", "AI tool integrations"]}
      />
      <JsonLd schema={schema} id="mcp-collection" />

      {/* Hero */}
      <section className="py-14 text-center px-4 border-b border-border-muted/30 bg-bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-accent-green border border-accent-green/30 px-3 py-1 rounded-[3px]">
            MCP SERVERS
          </span>
          <h1 className="font-display font-black text-4xl md:text-5xl text-text-primary tracking-tight">
            MCP Servers
          </h1>
          <p className="font-mono text-sm text-text-secondary max-w-lg">
            Connect Claude to any tool, API, or data source via Model Context Protocol. Ranked by stars.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mt-8">
          <input
            type="text"
            aria-label="Search MCP servers"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search MCPs..."
            className="w-full bg-bg-elevated border border-border-default rounded-[6px] px-4 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/60 transition-colors"
          />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* Result count */}
          <div className="flex items-center justify-end">
            <span className="font-mono text-xs text-text-muted">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Grid */}
          {paginated.length === 0 ? (
            <div className="bg-bg-elevated border-2 border-dashed border-border-dim rounded-[8px] py-20 text-center">
              <p className="font-display text-accent-red text-3xl font-black tracking-tight">NO RESULTS</p>
              <p className="font-mono text-text-secondary text-sm mt-3">Try a different search.</p>
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="mt-6 font-mono text-xs text-accent-green hover:bg-accent-green hover:text-bg-base border border-accent-green px-4 py-2 rounded-sm transition-all duration-150"
              >
                RESET
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((skill) => (
                <McpServerCard key={skill.id} skill={skill} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe <= 1}
                className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all disabled:opacity-[0.95] disabled:cursor-not-allowed"
              >
                PREV
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`font-mono text-xs min-w-8 px-2 py-1.5 rounded-[4px] border transition-all ${
                    n === pageSafe
                      ? "bg-accent-green text-primary-foreground border-accent-green"
                      : "border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe >= totalPages}
                className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all disabled:opacity-[0.95] disabled:cursor-not-allowed"
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
