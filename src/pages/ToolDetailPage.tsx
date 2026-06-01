import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ExternalLink, Scale } from "lucide-react";
import { GithubLogo } from "phosphor-react";
import { getToolBySlug, getRelatedTools } from "@/lib/tools";
import { getSkillsByToolSlug } from "@/lib/skills";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PricingBadge } from "@/components/tools/PricingBadge";
import { ToolCard } from "@/components/tools/ToolCard";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import { normalizeTaxonomyValue } from "@/lib/tools";
import { getCategoryColor } from "@/lib/categoryColors";
import { isSafeHttpUrl } from "@/lib/utils";
import { DataStatus } from "@/components/ui/DataStatus";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { StickyOpenBar } from "@/components/tools/StickyOpenBar";
import { useCompare } from "@/contexts/CompareContext";
import Brand from "@/lib/brand";
import type { Skill } from "@/types/skill";

const SKILLS_PER_PAGE = 6;

function SkillsSection({ skills }: { skills: Skill[] }) {
  const shown = skills.slice(0, SKILLS_PER_PAGE);

  return (
    <section className="mt-8 space-y-3">
      <div className="h-px w-full" style={{ background: `linear-gradient(to right, var(--accent-green), transparent)` }} />
      <h2 className="font-mono text-xs text-text-muted tracking-widest">// CLAUDE SKILLS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shown.map((skill) => (
          <div key={skill.id} className="relative overflow-hidden bg-bg-surface border border-border-default rounded-[6px] p-3 flex flex-col gap-2 hover:border-accent-green/50 transition-all duration-150">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-green opacity-40" />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <GithubLogo size={12} className="text-text-muted shrink-0" />
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
                href={isSafeHttpUrl(skill.github_url) ? skill.github_url : undefined}
                target="_blank"
                rel="noopener noreferrer nofollow"
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
  );
}


export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getToolBySlug(slug) : undefined;

  // Sticky CTA: show the bottom "Open" bar once the in-page CTA scrolls out of
  // view. Hooks must run before any early return (rules-of-hooks); the ref is
  // only attached when a tool renders, so the observer no-ops on the 404 branch.
  const navigate = useNavigate();
  const { add: addCompare } = useCompare();
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [slug]);

  if (!tool) {
    return (
      <>
        <PageMeta
          title={`Tool Not Found | ${Brand.product.name_styled}`}
          description="The requested AI tool was not found. Browse verified AI tools by category on AIFOXX."
          robots="noindex, nofollow"
        />
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
  const pageUrl = `https://${Brand.product.domain}/ai/${tool.slug}`;

  const verifiedCompliance = (["soc2", "iso27001", "gdpr", "hipaa"] as const)
    .filter((key) => compliance?.[key])
    .map((key) => key.toUpperCase());

  const hasApiAccess = tool.access_methods?.some((method) => method.toLowerCase().includes("api"));
  const hasFreeOffer = tool.pricing === "Free" || tool.pricing === "Freemium" || tool.pricing === "Open Source";

  // Keep meta description under 160 chars (Google truncation limit).
  const seoDescription = (() => {
    const suffix = ` · ${tool.pricing} · ${tool.category}`;
    const maxDesc = 160 - suffix.length;
    const desc =
      tool.description.length > maxDesc
        ? tool.description.slice(0, maxDesc - 1).trimEnd() + "…"
        : tool.description;
    return `${desc}${suffix}`;
  })();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Is ${tool.name} free?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": tool.pricing === "Free" || tool.pricing === "Freemium"
            ? `${tool.name} has ${tool.pricing.toLowerCase()} pricing.`
            : `${tool.name} is listed with ${tool.pricing.toLowerCase()} pricing.`,
        },
      },
      {
        "@type": "Question",
        "name": `Does ${tool.name} offer API access?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": hasApiAccess
            ? `${tool.name} includes API access.`
            : `${tool.name} does not list API access in its current access methods.`,
        },
      },
      {
        "@type": "Question",
        "name": `What compliance standards does ${tool.name} support?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": verifiedCompliance.length > 0
            ? `${tool.name} is marked as compliant with ${verifiedCompliance.join(", ")}.`
            : `${tool.name} does not currently list verified compliance certifications in this directory entry.`,
        },
      },
    ],
  };

  return (
    <>
      <PageMeta
        title={`${tool.name} Pricing, Compliance & Use Cases | ${Brand.product.name_styled}`}
        description={seoDescription}
        url={pageUrl}
        type="article"
        image={tool.logo_url}
        keywords={[
          `${tool.name} pricing`,
          `${tool.name} compliance`,
          `${tool.name} use cases`,
          tool.category,
          tool.subcategory,
        ]}
      />
      <JsonLd
        id="software-app"
        schema={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": tool.name,
          "description": seoDescription,
          "url": pageUrl,
          "sameAs": tool.url,
          "applicationCategory": tool.category,
          "operatingSystem": "Web",
          "keywords": tool.tags.join(", "),
          ...(hasFreeOffer && {
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          }),
        }}
      />
      <JsonLd
        id="breadcrumb"
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `https://${Brand.product.domain}` },
            { "@type": "ListItem", "position": 2, "name": tool.category, "item": `https://${Brand.product.domain}/category/${normalizeTaxonomyValue(tool.category)}` },
            { "@type": "ListItem", "position": 3, "name": tool.name, "item": pageUrl },
          ],
        }}
      />
      <JsonLd id="tool-faq" schema={faqSchema} />
      <PageWrapper mobileFilter={false}>
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

          {/* Header — logo + name stack and wrap; CTA lives below so long names never collide with it */}
          <div className="flex gap-3 sm:gap-4 items-start">
            {tool.logo_url ? (
              <img
                src={tool.logo_url}
                alt={`${tool.name} - ${tool.category} AI tool logo`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-[4px] object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-bg-elevated border border-border-default rounded-[4px] flex items-center justify-center shrink-0">
                <span className="font-display font-black text-xl sm:text-2xl" style={{ color: color.accent }}>{tool.name.charAt(0)}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-display font-black text-2xl sm:text-4xl text-text-primary break-words">{tool.name}</h1>
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

          {/* Primary actions — full-width stack on mobile, inline on desktop */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <a
              ref={ctaRef}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex sm:inline-flex w-full sm:w-auto items-center justify-center font-display font-black tracking-widest text-sm px-6 py-3 rounded-[6px] transition-all duration-150 min-h-[48px]"
              style={{ background: color.accent, color: '#080C10' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = color.glow; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              &gt;&gt; OPEN TOOL
            </a>
            <button
              type="button"
              onClick={() => { addCompare(tool.slug); navigate("/compare"); }}
              aria-label={`Compare ${tool.name} with other tools`}
              className="flex sm:inline-flex w-full sm:w-auto items-center justify-center gap-2 font-mono text-xs tracking-widest border border-border-default text-text-secondary hover:text-accent-green hover:border-accent-green/60 px-5 rounded-[6px] transition-colors duration-150 min-h-[48px]"
            >
              <Scale size={14} /> COMPARE
            </button>
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

          {/* Pricing — open by default; the number the user actually came for */}
          <CollapsibleSection title="PRICING DETAIL" defaultOpen>
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
          </CollapsibleSection>

          {/* Access methods — tap to expand on mobile */}
          <CollapsibleSection title="ACCESS METHODS">
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
          </CollapsibleSection>

          {/* Trust & data — compliance signals + data-storage, merged into one section */}
          <CollapsibleSection title="TRUST & DATA">
            <div className="flex flex-wrap gap-2">
              {(["soc2", "iso27001", "gdpr", "hipaa"] as const).map((key) => {
                const val = compliance?.[key] ?? null;
                const certified = val === true;
                const sourceUrl = tool.compliance_sources?.[key];
                const linkable = certified && sourceUrl != null && isSafeHttpUrl(sourceUrl);
                const className = `inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full border transition-colors duration-150 ${
                  certified
                    ? "bg-accent-green/10 border-accent-green/35 text-accent-green"
                    : "bg-transparent border-dashed border-border-dim text-text-muted opacity-40"
                }`;
                if (linkable) {
                  return (
                    <a
                      key={key}
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className={`${className} hover:underline`}
                    >
                      <span className="text-[10px]">●</span>
                      {key.toUpperCase()}
                      <ExternalLink size={10} />
                    </a>
                  );
                }
                return (
                  <span key={key} className={className}>
                    <span className="text-[10px]">{certified ? "●" : "○"}</span>
                    {key.toUpperCase()}
                  </span>
                );
              })}
            </div>
            <p className="font-mono text-[10px] text-text-muted">● certified · ○ not verified</p>
            <p className="font-mono text-[10px] text-text-muted">
              Compliance data is community-sourced and may be incomplete or out of date. Always verify
              certifications directly with the vendor's official trust or security page before relying on them.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                <p className="font-mono text-xs text-text-muted">Region</p>
                <p className="font-mono text-sm text-text-primary mt-1">{dataStorage?.region ?? <DataStatus value={null} />}</p>
              </div>
              <div className={`border rounded-[6px] p-3 ${dataStorage?.trains_on_data === true ? "bg-accent-red/5 border-accent-red/30" : dataStorage?.trains_on_data === false ? "bg-accent-green/5 border-accent-green/30" : "bg-bg-surface border-border-default"}`}>
                <p className="font-mono text-xs text-text-muted">Trains on Data</p>
                <p className={`font-mono text-sm mt-1 ${dataStorage?.trains_on_data === true ? "text-accent-red" : dataStorage?.trains_on_data === false ? "text-accent-green" : "text-text-primary"}`}>
                  {dataStorage?.trains_on_data === null || dataStorage?.trains_on_data === undefined ? <DataStatus value={null} /> : dataStorage.trains_on_data ? "Yes" : "No"}
                </p>
              </div>
              <div className={`border rounded-[6px] p-3 ${dataStorage?.self_hostable === true ? "bg-accent-green/5 border-accent-green/30" : "bg-bg-surface border-border-default"}`}>
                <p className="font-mono text-xs text-text-muted">Self-hostable</p>
                <p className={`font-mono text-sm mt-1 ${dataStorage?.self_hostable === true ? "text-accent-green" : "text-text-primary"}`}>
                  {dataStorage?.self_hostable === null || dataStorage?.self_hostable === undefined ? <DataStatus value={null} /> : dataStorage.self_hostable ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Claude Skills */}
          {skills.length > 0 && <SkillsSection skills={skills} />}

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-12 space-y-4">
              <div className="h-px w-full" style={{ background: `linear-gradient(to right, ${color.accent}, transparent)` }} />
              <h2 className="font-mono text-xs text-text-muted tracking-widest">// MORE IN {tool.subcategory.toUpperCase()}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((r) => (<ToolCard key={r.id} tool={r} variant="compact" />))}
              </div>
            </section>
          )}

          {/* Use cases — tap to expand on mobile */}
          {tool.use_cases && tool.use_cases.length > 0 && (
            <CollapsibleSection title="USE CASES">
              <div className="flex flex-wrap gap-2">
                {tool.use_cases.map((uc) => (
                  <span key={uc} className="font-mono text-xs px-2.5 py-1 rounded-[3px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                    {uc}
                  </span>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Tags */}
          {tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
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
          )}

          {/* Spacer so the last content clears the sticky mobile CTA bar */}
          <div className="h-16 md:hidden" aria-hidden="true" />
        </div>
      </PageWrapper>

      <StickyOpenBar name={tool.name} url={tool.url} accent={color.accent} visible={showStickyCta} />
    </>
  );
}
