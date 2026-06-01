import { useParams, Link } from "react-router-dom";
import { getToolBySlug, normalizeTaxonomyValue } from "@/lib/tools";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import { ComparisonView } from "@/components/tools/ComparisonView";
import NotFoundPage from "./NotFoundPage";
import Brand from "@/lib/brand";

const DOMAIN = `https://${Brand.product.domain}`;

function hasFreeTier(pricing: string): boolean {
  return pricing === "Free" || pricing === "Freemium" || pricing === "Open Source";
}

/**
 * Static, indexable head-to-head page: /compare/:slugA/vs/:slugB. Pre-rendered
 * for popular same-category pairs (see getStaticPaths in routes.tsx). Unlike the
 * interactive /compare?tools= view (which is noindex), these target real search
 * demand like "ChatGPT vs Claude".
 */
export default function CompareVsPage() {
  const { slugA, slugB } = useParams<{ slugA: string; slugB: string }>();
  const a = slugA ? getToolBySlug(slugA) : undefined;
  const b = slugB ? getToolBySlug(slugB) : undefined;

  if (!a || !b || a.slug === b.slug) return <NotFoundPage />;

  const tools = [a, b];
  const pageUrl = `${DOMAIN}/compare/${a.slug}/vs/${b.slug}`;
  const heading = `${a.name} vs ${b.name}`;
  const intro = `Compare ${a.name} and ${b.name} side by side — pricing, compliance (SOC 2, ISO 27001, GDPR, HIPAA), access methods, and how each one handles your data.`;

  const freeAnswer =
    hasFreeTier(a.pricing) && hasFreeTier(b.pricing)
      ? `Both ${a.name} and ${b.name} offer a free or freemium tier.`
      : hasFreeTier(a.pricing)
        ? `${a.name} offers a free or freemium tier, while ${b.name} is ${b.pricing.toLowerCase()}.`
        : hasFreeTier(b.pricing)
          ? `${b.name} offers a free or freemium tier, while ${a.name} is ${a.pricing.toLowerCase()}.`
          : `Neither lists a free tier — ${a.name} is ${a.pricing.toLowerCase()} and ${b.name} is ${b.pricing.toLowerCase()}.`;

  const faqs = [
    {
      q: `What is the difference between ${a.name} and ${b.name}?`,
      a: `${a.name} is ${a.pricing} (${a.category} · ${a.subcategory}); ${b.name} is ${b.pricing} (${b.category} · ${b.subcategory}). This page compares their pricing, compliance, access methods, and data handling side by side.`,
    },
    { q: `Is ${a.name} or ${b.name} free?`, a: freeAnswer },
  ];

  return (
    <>
      <PageMeta
        title={`${heading} — Pricing, Compliance & Features Compared | ${Brand.product.name_styled}`}
        description={`${a.name} vs ${b.name}: compare pricing, compliance, access methods, and data handling side by side.`}
        url={pageUrl}
        keywords={[
          `${a.name} vs ${b.name}`,
          `${a.name} or ${b.name}`,
          `${a.name} ${b.name} comparison`,
          a.category,
        ]}
      />
      <JsonLd
        id="vs-breadcrumb"
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: DOMAIN },
            { "@type": "ListItem", position: 2, name: "Compare", item: `${DOMAIN}/compare` },
            { "@type": "ListItem", position: 3, name: heading, item: pageUrl },
          ],
        }}
      />
      <JsonLd
        id="vs-faq"
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <div className="max-w-6xl mx-auto w-full px-4 py-6 md:py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="font-mono text-xs text-text-muted flex gap-2 items-center flex-wrap">
          <Link to="/" className="hover:text-text-primary transition-colors">HOME</Link>
          <span className="text-accent-green">&gt;</span>
          <Link to="/compare" className="hover:text-text-primary transition-colors">COMPARE</Link>
          <span className="text-accent-green">&gt;</span>
          <span className="text-text-primary truncate">{heading}</span>
        </nav>

        {/* Header */}
        <header className="space-y-2">
          <p className="font-mono text-[10px] tracking-widest text-accent-green border border-accent-green/30 px-2.5 py-1 rounded-[3px] inline-block">
            HEAD TO HEAD
          </p>
          <h1 className="font-display font-black text-3xl md:text-4xl text-text-primary tracking-tight">
            {heading}
          </h1>
          <p className="font-mono text-sm text-text-secondary max-w-2xl leading-relaxed">{intro}</p>
        </header>

        <ComparisonView tools={tools} />

        {/* Add a third tool */}
        <Link
          to={`/compare?tools=${a.slug},${b.slug}`}
          className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-accent-green hover:underline"
        >
          &gt; Add another tool to this comparison →
        </Link>

        {/* FAQ — visible content backing the FAQPage structured data */}
        <section className="mt-6 space-y-4 border-t border-border-dim pt-6">
          <p className="font-mono text-xs text-text-muted tracking-widest">// FAQ</p>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q}>
                <h2 className="font-display font-black text-sm text-text-primary">{f.q}</h2>
                <p className="font-mono text-sm text-text-secondary leading-relaxed mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Category cross-link */}
        <Link
          to={`/category/${normalizeTaxonomyValue(a.category)}`}
          className="block font-mono text-xs text-text-muted hover:text-accent-green transition-colors"
        >
          &gt; Browse all {a.category} tools →
        </Link>
      </div>
    </>
  );
}
