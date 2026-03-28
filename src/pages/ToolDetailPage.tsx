import { useParams, Link } from "react-router-dom";
import { Github, Star, ExternalLink } from "lucide-react";
import { getToolBySlug, getRelatedTools } from "@/lib/tools";
import { getSkillsByToolSlug } from "@/lib/skills";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PricingBadge } from "@/components/tools/PricingBadge";
import { ToolCard } from "@/components/tools/ToolCard";
import { PageMeta } from "@/components/seo/PageMeta";
import { getCategoryColor } from "@/lib/categoryColors";
import { DataStatus } from "@/components/ui/DataStatus";
import Brand from "@/lib/brand";

function ComplianceBadge({ value }: { value: boolean | null | undefined }) {
  if (value === null || value === undefined) {
    return <span className="font-mono text-[10px] text-[var(--text-muted)] border border-dashed border-[var(--border-dim)] px-1.5 py-0.5 rounded-[3px]">?</span>;
  }
  if (value) {
    return <span className="font-mono text-[10px] text-[var(--accent-green)] border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-1.5 py-0.5 rounded-[3px]">✓</span>;
  }
  return <span className="font-mono text-[10px] text-[var(--accent-red)] border border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10 px-1.5 py-0.5 rounded-[3px]">✗</span>;
}

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getToolBySlug(slug) : undefined;

  if (!tool) {
    return (
      <>
        <PageMeta title={`Tool Not Found | ${Brand.product.name_styled}`} description="The requested AI tool was not found." />
        <div className="flex-1 flex items-start justify-center px-4">
          <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 max-w-lg w-full mt-16 font-mono space-y-2">
            <p className="text-accent-red font-black">&gt; ERROR_404: TOOL_NOT_FOUND</p>
            <p className="text-text-secondary">&gt; SLUG: {slug}</p>
            <Link to="/" className="block text-accent-green hover:underline mt-4">&gt; cd ~/ [HOME]</Link>
          </div>
        </div>
      </>
    );
  }

  const color = getCategoryColor(tool.category);
  const related = getRelatedTools(tool.slug, 3);
  const skills = getSkillsByToolSlug(tool.slug);

  const compliance = tool.compliance;
  const dataStorage = tool.data_storage;
  const pricingDetail = tool.pricing_detail;

  return (
    <>
      <PageMeta
        title={`${tool.name} | ${Brand.product.name_styled}`}
        description={tool.description}
        url={`https://${Brand.product.domain}/ai/${tool.slug}`}
      />
      <PageWrapper>
        <div className="space-y-6">
          {/* Breadcrumbs */}
          <nav className="font-mono text-xs text-text-muted flex gap-2 items-center flex-wrap">
            <Link to="/" className="hover:text-text-primary transition-colors duration-150">HOME</Link>
            <span style={{ color: color.accent }}>&gt;</span>
            <Link to={`/?category=${encodeURIComponent(tool.category)}`} className="hover:text-text-primary transition-colors duration-150">{tool.category}</Link>
            <span style={{ color: color.accent }}>&gt;</span>
            <Link to={`/?category=${encodeURIComponent(tool.category)}&subcategory=${encodeURIComponent(tool.subcategory)}`} className="hover:text-text-primary transition-colors duration-150">{tool.subcategory}</Link>
            <span style={{ color: color.accent }}>&gt;</span>
            <span className="text-text-primary">{tool.name}</span>
          </nav>

          {/* Header */}
          <div className="flex gap-4 items-start">
            {tool.logo_url ? (
              <img
                src={tool.logo_url}
                alt={tool.name}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-[4px] object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-bg-elevated border border-border-default rounded-[4px] flex items-center justify-center shrink-0">
                <span className="font-display font-black text-2xl" style={{ color: color.accent }}>{tool.name.charAt(0)}</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-start gap-4">
                <h1 className="font-display font-black text-4xl text-text-primary">{tool.name}</h1>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center font-display font-black tracking-widest text-sm px-4 py-2 rounded-[6px] transition-all duration-150"
                  style={{ background: color.accent, color: '#080C10', marginLeft: 15 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = color.glow; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; }}
                >
                  &gt;&gt; OPEN TOOL
                </a>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <PricingBadge pricing={tool.pricing} />
                {tool.featured && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-[3px] font-semibold text-accent-amber bg-accent-amber/10 border border-accent-amber/30">★ FEATURED</span>
                )}
                {tool.status && tool.status !== "active" && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-[3px] border border-[var(--border-dim)] text-[var(--text-muted)] uppercase">{tool.status}</span>
                )}
              </div>
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-text-muted truncate block mt-1 hover:text-text-secondary transition-colors duration-150">{tool.url}</a>
            </div>
          </div>

          {/* Description */}
          <div
            className="bg-bg-elevated border-l-4 pl-4 py-3 rounded-r-[6px]"
            style={{ borderLeftColor: color.accent }}
          >
            <p className="font-mono text-sm text-text-secondary leading-relaxed">{tool.description}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Category", value: tool.category, colored: true },
              { label: "Subcategory", value: tool.subcategory, colored: false },
              { label: "Pricing", value: tool.pricing, colored: false },
            ].map((cell) => (
              <div key={cell.label} className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{cell.label}</p>
                <p
                  className="font-display font-black text-text-primary mt-1"
                  style={cell.colored ? { color: color.accent } : undefined}
                >
                  {cell.value}
                </p>
              </div>
            ))}
          </div>

          {/* Access Methods */}
          <section className="space-y-2">
            <p className="font-mono text-xs text-text-muted tracking-widest">// ACCESS METHODS</p>
            {!tool.access_methods || tool.access_methods.length === 0 ? (
              <DataStatus value={tool.access_methods} type="block" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {tool.access_methods.map((method) => (
                  <span key={method} className="font-mono text-xs px-2.5 py-1 rounded-[3px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                    {method}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Compliance */}
          <section className="space-y-2">
            <p className="font-mono text-xs text-text-muted tracking-widest">// COMPLIANCE</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["soc2", "iso27001", "gdpr", "hipaa"] as const).map((key) => (
                <div key={key} className="bg-bg-surface border border-border-default rounded-[6px] p-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-text-muted uppercase">{key}</span>
                  <ComplianceBadge value={compliance?.[key] ?? null} />
                </div>
              ))}
            </div>
          </section>

          {/* Data Storage */}
          <section className="space-y-2">
            <p className="font-mono text-xs text-text-muted tracking-widest">// DATA STORAGE</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                <p className="font-mono text-xs text-text-muted">Region</p>
                <div className="mt-1">{dataStorage?.region ? <span className="font-mono text-sm text-text-primary">{dataStorage.region}</span> : <DataStatus value={dataStorage?.region} />}</div>
              </div>
              <div className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                <p className="font-mono text-xs text-text-muted">Trains on Data</p>
                <div className="mt-1">
                  {dataStorage?.trains_on_data === null || dataStorage?.trains_on_data === undefined
                    ? <DataStatus value={dataStorage?.trains_on_data} />
                    : <span className={`font-mono text-sm ${dataStorage.trains_on_data ? "text-[var(--accent-red)]" : "text-[var(--accent-green)]"}`}>{dataStorage.trains_on_data ? "Yes" : "No"}</span>
                  }
                </div>
              </div>
              <div className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                <p className="font-mono text-xs text-text-muted">Self-hostable</p>
                <div className="mt-1">
                  {dataStorage?.self_hostable === null || dataStorage?.self_hostable === undefined
                    ? <DataStatus value={dataStorage?.self_hostable} />
                    : <span className={`font-mono text-sm ${dataStorage.self_hostable ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>{dataStorage.self_hostable ? "Yes" : "No"}</span>
                  }
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Detail */}
          <section className="space-y-2">
            <p className="font-mono text-xs text-text-muted tracking-widest">// PRICING DETAIL</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { label: "Free Tier", key: "free_tier" as const },
                { label: "Paid Plans", key: "paid_plans" as const },
                { label: "API Cost", key: "api_cost" as const },
              ]).map(({ label, key }) => (
                <div key={key} className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                  <p className="font-mono text-xs text-text-muted">{label}</p>
                  <div className="mt-1">
                    {pricingDetail?.[key]
                      ? <span className="font-mono text-sm text-text-primary">{pricingDetail[key]}</span>
                      : <DataStatus value={pricingDetail?.[key]} type="inline" />
                    }
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Use Cases */}
          <section className="space-y-2">
            <p className="font-mono text-xs text-text-muted tracking-widest">// USE CASES</p>
            {!tool.use_cases || tool.use_cases.length === 0 ? (
              <DataStatus value={tool.use_cases} type="block" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {tool.use_cases.map((uc) => (
                  <span key={uc} className="font-mono text-xs px-2.5 py-1 rounded-[3px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                    {uc}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {tool.tags.map((tag) => (
              <Link
                key={tag}
                to={`/tag/${tag}`}
                className="tag-pill-link inline-flex items-center text-xs font-mono px-2.5 py-1 rounded-[3px] transition-colors duration-150 whitespace-nowrap"
                style={{ "--cat-accent": color.accent, "--cat-text": color.text } as React.CSSProperties}
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center font-display font-black tracking-widest text-sm px-6 py-3 rounded-[6px] transition-all duration-150"
            style={{ background: color.accent, color: '#080C10' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = color.glow; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            &gt;&gt; OPEN TOOL
          </a>

          {/* Claude Skills */}
          {skills.length > 0 && (
            <section className="mt-8 space-y-3">
              <div className="h-px w-full" style={{ background: `linear-gradient(to right, var(--accent-green), transparent)` }} />
              <p className="font-mono text-xs text-text-muted tracking-widest">// CLAUDE SKILLS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((skill) => (
                  <div key={skill.id} className="relative overflow-hidden bg-bg-surface border border-border-default rounded-[6px] p-3 flex flex-col gap-2 hover:border-accent-green/50 transition-all duration-150">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-green opacity-40" />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Github size={12} className="text-text-muted shrink-0" />
                        <span className="font-display font-black text-sm text-text-primary truncate">{skill.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 font-mono text-[10px] text-accent-green border border-accent-green/40 px-1.5 py-0.5 rounded-[3px]">
                        <Star size={9} className="fill-accent-green" />
                        {skill.stars.toLocaleString()}
                      </div>
                    </div>
                    {skill.description && (
                      <p className="font-mono text-xs text-text-secondary line-clamp-2">{skill.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-border-dim">
                      <span className="font-mono text-[10px] text-text-muted border border-border-dim px-1.5 py-0.5 rounded-[3px]">
                        {skill.skill_type === "mcp-server" ? "MCP Server" : "Claude Code"}
                      </span>
                      <a
                        href={skill.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-[10px] text-accent-green hover:underline"
                      >
                        <ExternalLink size={10} />
                        GitHub
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/skills" className="font-mono text-xs text-text-muted hover:text-accent-green transition-colors">
                &gt; Browse all Claude skills →
              </Link>
            </section>
          )}

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-12 space-y-4">
              <div className="h-px w-full" style={{ background: `linear-gradient(to right, ${color.accent}, transparent)` }} />
              <p className="font-mono text-xs text-text-muted tracking-widest">// MORE IN {tool.subcategory.toUpperCase()}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((r) => (<ToolCard key={r.id} tool={r} variant="compact" />))}
              </div>
            </section>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
