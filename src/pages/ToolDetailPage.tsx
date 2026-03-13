import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { getToolBySlug, getRelatedTools } from "@/lib/tools";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PricingBadge } from "@/components/tools/PricingBadge";
import { ToolCard } from "@/components/tools/ToolCard";

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getToolBySlug(slug) : undefined;

  useEffect(() => {
    document.title = tool ? `${tool.name} | ToolsAI` : "Tool Not Found | ToolsAI";
    return () => { document.title = "ToolsAI"; };
  }, [tool]);

  if (!tool) {
    return (
      <div className="flex-1 flex items-start justify-center px-4">
        <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 max-w-lg w-full mt-16 font-mono space-y-2">
          <p className="text-accent-red font-black">&gt; ERROR_404: TOOL_NOT_FOUND</p>
          <p className="text-text-secondary">&gt; SLUG: {slug}</p>
          <Link to="/" className="block text-accent-green hover:underline mt-4">
            &gt; cd ~/ [HOME]
          </Link>
        </div>
      </div>
    );
  }

  const related = getRelatedTools(tool.slug, 3);

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="font-mono text-xs text-text-muted flex gap-2 items-center flex-wrap">
          <Link to="/" className="hover:text-text-primary transition-colors duration-150">HOME</Link>
          <span className="text-accent-green">&gt;</span>
          <Link to={`/?category=${encodeURIComponent(tool.category)}`} className="hover:text-text-primary transition-colors duration-150">{tool.category}</Link>
          <span className="text-accent-green">&gt;</span>
          <Link to={`/?category=${encodeURIComponent(tool.category)}&subcategory=${encodeURIComponent(tool.subcategory)}`} className="hover:text-text-primary transition-colors duration-150">{tool.subcategory}</Link>
          <span className="text-accent-green">&gt;</span>
          <span className="text-text-primary">{tool.name}</span>
        </nav>

        {/* Header */}
        <div className="flex gap-4 items-start">
          {tool.logo_url ? (
            <img src={tool.logo_url} alt={tool.name} className="w-16 h-16 rounded-[4px] object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 bg-bg-elevated border border-border-default rounded-[4px] flex items-center justify-center shrink-0">
              <span className="font-display font-black text-accent-green text-2xl">{tool.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-display font-black text-4xl text-text-primary">{tool.name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <PricingBadge pricing={tool.pricing} />
              {tool.featured && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-[3px] font-semibold text-accent-amber bg-accent-amber/10 border border-accent-amber/30">
                  ★ FEATURED
                </span>
              )}
            </div>
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-text-muted truncate block mt-1 hover:text-text-secondary transition-colors duration-150">
              {tool.url}
            </a>
          </div>
        </div>

        {/* Description */}
        <div className="bg-bg-elevated border-l-4 border-accent-green pl-4 py-3 rounded-r-[6px]">
          <p className="font-mono text-sm text-text-secondary leading-relaxed">{tool.description}</p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Category", value: tool.category },
            { label: "Subcategory", value: tool.subcategory },
            { label: "Pricing", value: tool.pricing },
            { label: "Tags", value: `${tool.tags.length} tags` },
          ].map((cell) => (
            <div key={cell.label} className="bg-bg-surface border border-border-default rounded-[6px] p-3">
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{cell.label}</p>
              <p className="font-display font-black text-text-primary mt-1">{cell.value}</p>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <span key={tag} className="bg-bg-overlay border border-border-default text-accent-blue text-xs font-mono px-2 py-1 rounded-[3px]">
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-accent-green text-primary-foreground font-display font-black tracking-widest text-sm px-6 py-3 rounded-[6px] hover:shadow-glow transition-all duration-150"
        >
          &gt;&gt; OPEN TOOL
        </a>

        {/* Related Tools */}
        {related.length > 0 && (
          <section className="mt-12 space-y-4">
            <p className="font-mono text-xs text-text-muted tracking-widest">
              // MORE IN {tool.subcategory.toUpperCase()}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((r) => (
                <ToolCard key={r.id} tool={r} variant="compact" />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
