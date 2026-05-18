import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { allTools, normalizeTaxonomyValue } from "@/lib/tools";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolCard } from "@/components/tools/ToolCard";
import { getCategoryColor } from "@/lib/categoryColors";
import Brand from "@/lib/brand";
import bestData from "@/data/best-categories.json";
import NotFoundPage from "./NotFoundPage";

const PICK_COUNT = 10;
const DOMAIN = `https://${Brand.product.domain}`;

export const BEST_CATEGORIES = bestData.categories;

export default function BestCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const entry = useMemo(
    () => BEST_CATEGORIES.find((c) => c.slug === slug),
    [slug]
  );

  if (!entry) return <NotFoundPage />;

  const tools = useMemo(() => {
    const list = allTools.filter(
      (t) => normalizeTaxonomyValue(t.category) === normalizeTaxonomyValue(entry.category)
    );
    // Featured first, then by name
    return list
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, PICK_COUNT);
  }, [entry]);

  const color = getCategoryColor(entry.category);
  const pageUrl = `${DOMAIN}/best/${entry.slug}`;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: entry.title,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${DOMAIN}/ai/${tool.slug}`,
      name: tool.name,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: DOMAIN },
      { "@type": "ListItem", position: 2, name: "Best AI Tools", item: `${DOMAIN}/best` },
      { "@type": "ListItem", position: 3, name: entry.headline, item: pageUrl },
    ],
  };

  const description = `${entry.intro.slice(0, 155).trimEnd()}…`;

  const otherPicks = BEST_CATEGORIES.filter((c) => c.slug !== entry.slug).slice(0, 6);

  return (
    <>
      <PageMeta
        title={`${entry.title} | ${Brand.product.name_styled}`}
        description={description}
        url={pageUrl}
        keywords={[
          entry.headline.toLowerCase(),
          `best ${entry.category.toLowerCase()} tools`,
          "ai tools",
          "best ai tools",
          entry.category.toLowerCase(),
        ]}
      />
      <JsonLd id="best-itemlist" schema={itemListSchema} />
      <JsonLd id="best-faq" schema={faqSchema} />
      <JsonLd id="best-breadcrumb" schema={breadcrumbSchema} />

      <PageWrapper>
        <article className="space-y-10">
          {/* Breadcrumb */}
          <nav className="font-mono text-xs text-text-muted flex gap-2 items-center flex-wrap">
            <Link to="/" className="hover:text-text-primary">HOME</Link>
            <span style={{ color: color.accent }}>&gt;</span>
            <span className="text-text-secondary">BEST</span>
            <span style={{ color: color.accent }}>&gt;</span>
            <span className="text-text-primary">{entry.headline}</span>
          </nav>

          {/* Hero */}
          <header className="space-y-4 border-b border-border-dim pb-8">
            <p className="font-mono text-xs tracking-widest" style={{ color: color.accent }}>
              // CURATED LIST · UPDATED 2026
            </p>
            <h1 className="font-display font-black text-4xl md:text-5xl text-text-primary tracking-tight">
              {entry.title}
            </h1>
            <p className="font-mono text-sm md:text-base text-text-secondary leading-relaxed max-w-3xl">
              {entry.intro}
            </p>
          </header>

          {/* Picks list */}
          <section className="space-y-4" aria-labelledby="picks-heading">
            <h2 id="picks-heading" className="font-mono text-xs text-text-muted tracking-widest">
              // TOP {tools.length} PICKS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, i) => (
                <div key={tool.id} className="relative pt-3 pl-3">
                  <span
                    className="absolute top-0 left-0 z-10 font-mono font-black text-xs px-2 py-1 rounded-[3px] border shadow-md"
                    style={{
                      background: color.bg,
                      color: color.accent,
                      borderColor: color.border,
                    }}
                  >
                    #{i + 1}
                  </span>
                  <ToolCard tool={tool} />
                </div>
              ))}
            </div>
          </section>

          {/* How we picked */}
          <section className="space-y-3 border-t border-border-dim pt-8" aria-labelledby="how-heading">
            <h2 id="how-heading" className="font-display font-black text-2xl text-text-primary">
              How we picked
            </h2>
            <p className="font-mono text-sm text-text-secondary leading-relaxed max-w-3xl">
              {entry.how_we_picked}
            </p>
          </section>

          {/* FAQ */}
          <section className="space-y-4 border-t border-border-dim pt-8" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="font-display font-black text-2xl text-text-primary">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {entry.faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="bg-bg-surface border border-border-default rounded-[6px] p-4 group"
                >
                  <summary className="font-display font-black text-base text-text-primary cursor-pointer list-none flex items-start justify-between gap-2">
                    <span>{faq.q}</span>
                    <span className="font-mono text-accent-green shrink-0 group-open:rotate-90 transition-transform">&gt;</span>
                  </summary>
                  <p className="font-mono text-sm text-text-secondary leading-relaxed mt-3">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* See also */}
          <section className="space-y-4 border-t border-border-dim pt-8" aria-labelledby="see-also-heading">
            <h2 id="see-also-heading" className="font-display font-black text-2xl text-text-primary">
              See also
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherPicks.map((c) => (
                <Link
                  key={c.slug}
                  to={`/best/${c.slug}`}
                  className="block bg-bg-surface border border-border-default rounded-[6px] p-3 hover:border-accent-green/50 transition-colors"
                >
                  <p className="font-display font-black text-sm text-text-primary">{c.headline}</p>
                  <p className="font-mono text-xs text-text-muted mt-1">/best/{c.slug}</p>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </PageWrapper>
    </>
  );
}
