import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { filterTrustIndex, TRUST_STATS } from "@/lib/trust-index";
import { canonicalCertKeys, type CanonicalCertKey } from "@/lib/trust";
import type { TrustIndexEntry } from "@/types/trust";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import Brand from "@/lib/brand";

const PER_PAGE = 24;

function TrustCard({ entry }: { entry: TrustIndexEntry }) {
  const held = canonicalCertKeys(entry.certs_held);
  const trains = entry.trains_on_customer_data;
  return (
    <Link
      to={`/trust/${entry.slug}`}
      className="group relative overflow-hidden bg-bg-surface border border-border-default rounded-[6px] p-4 flex flex-col gap-3 transition-all duration-150 hover:border-accent-green/50 hover:shadow-glow"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-green opacity-[0.95]" />
      <div className="flex items-start justify-between gap-2">
        <span className="font-display font-black text-text-primary text-sm leading-tight break-words min-w-0">
          {entry.vendor}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] text-accent-green border border-accent-green/40 px-1.5 py-0.5 rounded-[3px] shrink-0">
          <ShieldCheck size={10} />
          {entry.certs_held_count}
        </span>
      </div>

      {entry.product_family && (
        <p className="font-mono text-xs text-text-secondary line-clamp-2 min-w-0">{entry.product_family}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {entry.top_certs.slice(0, 4).map((c) => (
          <span key={c} className="font-mono text-[10px] px-1.5 py-0.5 rounded-[3px] bg-bg-elevated border border-border-dim text-text-secondary">
            {c}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-dim mt-auto">
        <span
          className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[3px] border ${
            trains === true
              ? "text-accent-red border-accent-red/30"
              : trains === false
              ? "text-accent-green border-accent-green/30"
              : "text-text-muted border-border-dim"
          }`}
        >
          {trains === true ? "trains on data" : trains === false ? "no data training" : "training unknown"}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] text-text-muted group-hover:text-accent-green transition-colors">
          report <ArrowUpRight size={11} />
        </span>
      </div>
    </Link>
  );
}

export default function TrustIndexPage() {
  const [query, setQuery] = useState("");
  const [certs, setCerts] = useState<CanonicalCertKey[]>([]);
  const [noTrain, setNoTrain] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterTrustIndex({ query, certs, noTrain }), [query, certs, noTrain]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PER_PAGE, pageSafe * PER_PAGE);

  const reset = () => {
    setQuery("");
    setCerts([]);
    setNoTrain(false);
    setPage(1);
  };
  const toggleCert = (key: CanonicalCertKey) => {
    setPage(1);
    setCerts((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const collectionSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "AI Vendor Trust & Security Reports",
      description: `Security and compliance reports for ${TRUST_STATS.total} AI vendors: SOC 2, ISO 27001, GDPR, HIPAA, and AI data-training posture, each verified against the vendor's own trust pages.`,
      url: `https://${Brand.product.domain}/trust`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: TRUST_STATS.total,
        itemListElement: filtered.slice(0, 30).map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${e.vendor} Trust & Security Report`,
          url: `https://${Brand.product.domain}/trust/${e.slug}`,
        })),
      },
    }),
    [filtered]
  );

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `https://${Brand.product.domain}` },
      { "@type": "ListItem", position: 2, name: "Trust Reports", item: `https://${Brand.product.domain}/trust` },
    ],
  };

  return (
    <>
      <PageMeta
        title={`AI Vendor Trust & Security Reports: SOC 2, GDPR, HIPAA | ${Brand.product.name_styled}`}
        description={`Compliance and security reports for ${TRUST_STATS.total} AI vendors. Check SOC 2, ISO 27001, GDPR, HIPAA and whether a tool trains AI on your data, each backed by a sourced quote.`}
        url={`https://${Brand.product.domain}/trust`}
        keywords={["AI vendor compliance", "SOC 2 AI tools", "GDPR AI tools", "HIPAA AI tools", "does AI train on my data", "AI security certifications"]}
      />
      <JsonLd schema={collectionSchema} id="trust-collection" />
      <JsonLd schema={breadcrumbSchema} id="trust-index-breadcrumb" />

      {/* Hero */}
      <section className="py-14 text-center px-4 border-b border-border-muted/30 bg-bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-accent-green border border-accent-green/30 px-3 py-1 rounded-[3px]">
            TRUST &amp; SECURITY
          </span>
          <h1 className="font-display font-black text-4xl md:text-5xl text-text-primary tracking-tight">
            AI Vendor Trust Reports
          </h1>
          <p className="font-sans text-sm text-text-secondary max-w-xl leading-relaxed">
            Security and compliance for {TRUST_STATS.total} AI tools, each certification checked against a verbatim
            quote on the vendor&apos;s own trust pages. Filter by certification, or find tools that don&apos;t train on
            your data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 mt-2 font-mono text-[11px] text-text-muted">
            <span><span className="text-accent-green font-bold">{TRUST_STATS.total}</span> vendors</span>
            <span><span className="text-accent-green font-bold">{TRUST_STATS.trustCenters}</span> with trust centers</span>
            <span><span className="text-accent-green font-bold">{TRUST_STATS.noTrainVendors}</span> don&apos;t train on your data</span>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mt-8">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search vendors..."
            aria-label="Search vendor trust reports"
            className="w-full bg-bg-elevated border border-border-default rounded-[6px] px-4 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green/60 transition-colors"
          />
        </div>

        {/* Cert facet filters */}
        <div className="max-w-2xl mx-auto mt-4 flex flex-wrap items-center justify-center gap-2">
          {TRUST_STATS.certFacets.map((f) => {
            const active = certs.includes(f.key);
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => toggleCert(f.key)}
                aria-pressed={active}
                className={`font-mono text-[11px] px-2.5 py-1 rounded-[4px] border transition-colors duration-150 ${
                  active
                    ? "bg-accent-green text-primary-foreground border-accent-green font-bold"
                    : "border-border-default text-text-secondary hover:text-text-primary hover:border-accent-green/50"
                }`}
              >
                {f.label} <span className={active ? "opacity-80" : "text-text-muted"}>{f.count}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setNoTrain((v) => !v);
              setPage(1);
            }}
            aria-pressed={noTrain}
            className={`font-mono text-[11px] px-2.5 py-1 rounded-[4px] border transition-colors duration-150 ${
              noTrain
                ? "bg-accent-green text-primary-foreground border-accent-green font-bold"
                : "border-border-default text-text-secondary hover:text-text-primary hover:border-accent-green/50"
            }`}
          >
            No data training <span className={noTrain ? "opacity-80" : "text-text-muted"}>{TRUST_STATS.noTrainVendors}</span>
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {(query || certs.length > 0 || noTrain) ? (
              <button type="button" onClick={reset} className="font-mono text-xs text-accent-green hover:underline">
                &gt; clear filters
              </button>
            ) : (
              <span />
            )}
            <span className="font-mono text-xs text-text-muted">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {paginated.length === 0 ? (
            <div className="bg-bg-elevated border-2 border-dashed border-border-dim rounded-[8px] py-20 text-center">
              <p className="font-display text-accent-red text-3xl font-black tracking-tight">NO RESULTS</p>
              <p className="font-mono text-text-secondary text-sm mt-3">No vendor matches those filters.</p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 font-mono text-xs text-accent-green hover:bg-accent-green hover:text-bg-base border border-accent-green px-4 py-2 rounded-sm transition-all duration-150"
              >
                RESET
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((entry) => (
                <TrustCard key={entry.slug} entry={entry} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe <= 1}
                className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                PREV
              </button>
              <span className="font-mono text-xs text-text-muted px-2">
                {pageSafe} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe >= totalPages}
                className="font-mono text-xs px-3 py-1.5 rounded-[4px] border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
