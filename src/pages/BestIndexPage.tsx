import { Link } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import Brand from "@/lib/brand";
import bestData from "@/data/best-categories.json";
import { getCategoryColor } from "@/lib/categoryColors";

const DOMAIN = `https://${Brand.product.domain}`;

export default function BestIndexPage() {
  const categories = bestData.categories;
  const pageUrl = `${DOMAIN}/best`;

  return (
    <>
      <PageMeta
        title={`Best AI Tools by Category — Curated Lists for 2026 | ${Brand.product.name_styled}`}
        description="Curated best-of lists for every AI category — coding, writing, image, video, marketing, design, productivity & more. Hand-picked AI tools with pricing and reviews."
        url={pageUrl}
        keywords={["best ai tools", "best ai tools by category", "ai tools 2026", "ai tools list"]}
      />
      <JsonLd
        id="best-index-list"
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Best AI Tools by Category",
          itemListElement: categories.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${DOMAIN}/best/${c.slug}`,
            name: c.title,
          })),
        }}
      />

      <PageWrapper>
        <article className="space-y-10">
          <header className="space-y-4 border-b border-border-dim pb-8">
            <p className="font-mono text-xs text-accent-green tracking-widest">
              // CURATED · UPDATED 2026
            </p>
            <h1 className="font-display font-black text-4xl md:text-5xl text-text-primary tracking-tight">
              Best AI Tools by Category
            </h1>
            <p className="font-mono text-sm md:text-base text-text-secondary leading-relaxed max-w-3xl">
              Hand-picked best-of lists for every major AI category. Each guide covers our top
              picks, how we picked them, pricing notes, and the questions everyone asks. Pick a
              category below to see the best AI tools we recommend for it.
            </p>
          </header>

          <section aria-labelledby="cats-heading" className="space-y-4">
            <h2 id="cats-heading" className="font-mono text-xs text-text-muted tracking-widest">
              // {categories.length} GUIDES
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => {
                const color = getCategoryColor(c.category);
                return (
                  <Link
                    key={c.slug}
                    to={`/best/${c.slug}`}
                    className="block bg-bg-surface border border-border-default rounded-[6px] p-4 hover:border-accent-green/50 transition-colors group"
                    style={{ borderTopColor: color.accent, borderTopWidth: 2 }}
                  >
                    <p
                      className="font-mono text-[10px] tracking-widest mb-2"
                      style={{ color: color.accent }}
                    >
                      // {c.category.toUpperCase()}
                    </p>
                    <p className="font-display font-black text-base text-text-primary group-hover:text-accent-green transition-colors">
                      {c.headline}
                    </p>
                    <p className="font-mono text-xs text-text-muted mt-2 line-clamp-2">
                      {c.intro}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        </article>
      </PageWrapper>
    </>
  );
}
