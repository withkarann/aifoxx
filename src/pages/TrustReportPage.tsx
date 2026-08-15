import { useParams, useLoaderData, Link } from "react-router-dom";
import { ExternalLink, ShieldCheck, ArrowUpRight, Info } from "lucide-react";
import { complianceKeys, heldCertNames, CANONICAL_CERTS } from "@/lib/trust";
import { trustProductName, trustOperator } from "@/lib/trust-name";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolIcon } from "@/components/tools/ToolIcon";
import { isSafeHttpUrl } from "@/lib/utils";
import Brand from "@/lib/brand";
import type { TrustReport, Certification } from "@/types/trust";

// The --accent-green token stores raw HSL components ("26 86% 52%"), so inline
// uses must wrap it in hsl() exactly like the Tailwind color mapping does.
const ACCENT = "hsl(var(--accent-green))"; // AIFOXX brand orange

function originOf(url: string | undefined): string | undefined {
  if (!url || !isSafeHttpUrl(url)) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

function hostOf(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Best-guess vendor homepage from the sourced URLs in the report. */
function vendorSite(report: TrustReport): string | undefined {
  const candidates = [
    report.trust_center_url,
    report.privacy.privacy_policy_url,
    ...(report.certifications || []).map((c) => c.source),
    ...(report.privacy.sources || []),
  ];
  for (const c of candidates) {
    const origin = originOf(c);
    if (origin) return origin;
  }
  return undefined;
}

function trainsOnData(report: TrustReport): boolean | null {
  return report.privacy?.trains_on_customer_data ?? report.compare?.trains_on_data ?? null;
}

/** Ordered marquee certs for the title tag and social description. */
function marqueeCerts(held: Set<string>): string[] {
  const order = ["soc2", "iso27001", "iso42001", "gdpr", "hipaa", "pci", "fedramp"];
  const labelByKey = new Map(CANONICAL_CERTS.map((c) => [c.key, c.label]));
  return order.filter((k) => held.has(k)).map((k) => labelByKey.get(k) || k);
}

function StatTile({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "warn" | "bad" }) {
  const toneClass =
    tone === "good"
      ? "text-accent-green"
      : tone === "bad"
      ? "text-accent-red"
      : tone === "warn"
      ? "text-accent-amber"
      : "text-text-primary";
  return (
    <div className="bg-bg-surface border border-border-default rounded-[6px] p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</p>
      <p className={`font-display font-black text-lg mt-1 leading-tight ${toneClass}`}>{value}</p>
    </div>
  );
}

/** The signature element: a certification with its verbatim, sourced proof. */
function CertLedgerRow({ cert }: { cert: Certification }) {
  const held = cert.held;
  const sourceHost = hostOf(cert.source);
  const linkable = isSafeHttpUrl(cert.source);
  return (
    <div
      className={`relative rounded-[6px] border p-4 ${
        held ? "bg-bg-surface border-border-default" : "bg-transparent border-dashed border-border-dim"
      }`}
      style={held ? { boxShadow: "inset 3px 0 0 0 hsl(var(--accent-green))" } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className={`text-xs shrink-0 ${held ? "text-accent-green" : "text-text-muted"}`}
          >
            {held ? "●" : "○"}
          </span>
          <span
            className={`font-display font-black text-sm break-words ${
              held ? "text-text-primary" : "text-text-muted"
            }`}
          >
            {cert.name}
          </span>
        </div>
        <span
          className={`font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-[3px] shrink-0 ${
            held
              ? "text-accent-green border border-accent-green/40"
              : "text-text-muted border border-border-dim"
          }`}
        >
          {held ? "HELD" : "NOT CONFIRMED"}
        </span>
      </div>

      {cert.proof_quote && (
        <blockquote
          className={`mt-3 pl-3 border-l-2 ${held ? "border-accent-green/40" : "border-border-dim"}`}
        >
          <p className="font-mono text-xs text-text-secondary leading-relaxed">
            {held ? "“" : ""}
            {cert.proof_quote}
            {held ? "”" : ""}
          </p>
        </blockquote>
      )}

      {linkable && (
        <a
          href={cert.source}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-accent-blue hover:underline"
        >
          <ExternalLink size={11} />
          {held ? "Verify on " : "source: "}
          {sourceHost}
        </a>
      )}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="h-px w-full" style={{ background: `linear-gradient(to right, ${ACCENT}, transparent)` }} />
      <h2 className="font-mono text-xs text-text-muted tracking-widest">// {children}</h2>
    </div>
  );
}

export default function TrustReportPage() {
  const { slug } = useParams<{ slug: string }>();
  // The route loader resolves this vendor's report (only its own data loads).
  const report = useLoaderData() as TrustReport | null;

  if (!report) {
    return (
      <>
        <PageMeta
          title={`Report Not Found | ${Brand.product.name_styled}`}
          description="The requested vendor trust and security report was not found."
          robots="noindex, nofollow"
        />
        <div className="flex-1 flex items-start justify-center px-4">
          <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 max-w-lg w-full mt-16 font-mono space-y-2">
            <p className="text-accent-red font-black">&gt; ERROR_404: REPORT_NOT_FOUND</p>
            <p className="text-text-secondary">&gt; SLUG: {slug}</p>
            <Link to="/trust" className="block text-accent-green hover:underline mt-4">&gt; cd ~/trust [ALL REPORTS]</Link>
          </div>
        </div>
      </>
    );
  }

  const site = vendorSite(report);
  const held = complianceKeys(heldCertNames(report), report.privacy?.dpa === true);
  const trains = trainsOnData(report);
  const certsHeldCount = (report.certifications || []).filter((c) => c.held).length;
  const marquee = marqueeCerts(held);
  const pageUrl = `https://${Brand.product.domain}/trust/${report.slug}`;

  const heldCerts = (report.certifications || []).filter((c) => c.held);
  const notHeldCerts = (report.certifications || []).filter((c) => !c.held);

  // A report is named after the product it covers, not the legal entity that
  // owns it, so pages for sibling products stay distinct from each other.
  const product = trustProductName(report.slug, report.vendor);
  const operator = trustOperator(product, report.vendor);

  const certLine = marquee.length > 0 ? marquee.slice(0, 4).join(", ") : "certification status";
  const title = `${product} Security & Compliance (${marquee.length ? marquee.slice(0, 3).join(", ") : "SOC 2, GDPR, HIPAA"}) | ${Brand.product.name_styled}`;
  const description = (() => {
    const base =
      certsHeldCount > 0
        ? `${product} holds ${certsHeldCount} verified certifications (${certLine}). `
        : `${product} certification status, verified against its own trust and security pages. `;
    const trainNote =
      trains === true
        ? "Trains AI on customer data. "
        : trains === false
        ? "Does not train AI on customer data. "
        : "";
    return `${base}${trainNote}Sourced trust and security report.`.slice(0, 158);
  })();

  // FAQ powers rich results and AI-answer citations (GEO). Answers are derived
  // strictly from the verified report data.
  const faq: { q: string; a: string }[] = [];
  const certAnswer = (key: string, label: string) => {
    const isHeld = held.has(key);
    const cert = (report.certifications || []).find((c) => c.held && CANONICAL_CERTS.find((cc) => cc.key === key)?.match(c.name));
    if (isHeld && cert?.proof_quote) {
      return `Yes. Per ${report.vendor}: "${cert.proof_quote}"`.slice(0, 300);
    }
    if (isHeld && key === "gdpr" && !cert) {
      return `Yes. ${report.vendor} provides a GDPR data processing agreement (DPA) covering how customer data is handled.`;
    }
    if (isHeld) return `Yes, ${report.vendor} lists ${label} compliance.`;
    return `We could not confirm ${label} for ${report.vendor} from its public trust or security pages. This does not necessarily mean the vendor lacks it. Confirm directly with the vendor.`;
  };
  faq.push({ q: `Is ${product} SOC 2 compliant?`, a: certAnswer("soc2", "SOC 2") });
  faq.push({ q: `Is ${product} ISO 27001 certified?`, a: certAnswer("iso27001", "ISO 27001") });
  faq.push({ q: `Is ${product} GDPR compliant?`, a: certAnswer("gdpr", "GDPR") });
  faq.push({ q: `Is ${product} HIPAA compliant?`, a: certAnswer("hipaa", "HIPAA") });
  faq.push({
    q: `Does ${product} train AI models on customer data?`,
    a:
      trains === true
        ? `Yes. ${report.privacy.ai_training_note || `${report.vendor} trains AI models on customer data.`}`.slice(0, 300)
        : trains === false
        ? `No. ${report.privacy.ai_training_note || `${report.vendor} does not train AI models on customer data.`}`.slice(0, 300)
        : `${report.vendor}'s public documentation does not clearly state whether it trains AI models on customer data. Confirm directly with the vendor.`,
  });
  if (report.privacy?.dpa === true) {
    faq.push({
      q: `Does ${product} offer a data processing agreement (DPA)?`,
      a: `Yes. ${report.vendor} provides a DPA, the GDPR contract that governs how it processes customer data. Review its terms during procurement.`,
    });
  }
  if (report.privacy?.data_region) {
    faq.push({
      q: `Where does ${product} store customer data?`,
      a: `${report.privacy.data_region}`.slice(0, 300),
    });
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: report.vendor,
    ...(site && { url: site }),
    ...(heldCerts.length > 0 && {
      hasCredential: heldCerts.map((c) => ({
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certification",
        name: c.name,
      })),
    }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `https://${Brand.product.domain}` },
      { "@type": "ListItem", position: 2, name: "Trust Reports", item: `https://${Brand.product.domain}/trust` },
      { "@type": "ListItem", position: 3, name: product, item: pageUrl },
    ],
  };

  const maturityLabel = report.maturity ? report.maturity[0].toUpperCase() + report.maturity.slice(1) : "Unknown";

  return (
    <>
      <PageMeta
        title={title}
        description={description}
        url={pageUrl}
        type="article"
        keywords={[
          `${product} SOC 2`,
          `${product} GDPR`,
          `${product} HIPAA`,
          `${product} compliance`,
          `${product} security`,
          `is ${product} secure`,
        ]}
      />
      <JsonLd id="trust-faq" schema={faqSchema} />
      <JsonLd id="trust-org" schema={orgSchema} />
      <JsonLd id="trust-breadcrumb" schema={breadcrumbSchema} />

      <PageWrapper mobileFilter={false}>
        <div className="space-y-6">
          {/* Breadcrumbs */}
          <nav className="font-mono text-xs text-text-muted flex gap-2 items-center flex-wrap">
            <Link to="/" className="hover:text-text-primary transition-colors duration-150">HOME</Link>
            <span style={{ color: ACCENT }}>&gt;</span>
            <Link to="/trust" className="hover:text-text-primary transition-colors duration-150">TRUST</Link>
            <span style={{ color: ACCENT }}>&gt;</span>
            <span className="text-text-primary">{product}</span>
          </nav>

          {/* Dossier header */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-text-muted uppercase">
              // Trust &amp; Security Report
            </p>
            <div className="flex gap-3 sm:gap-4 items-start mt-2">
              <ToolIcon
                name={product}
                slug={report.slug}
                websiteUrl={site}
                accent={ACCENT}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-[6px]"
                letterClassName="text-lg sm:text-xl"
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display font-black text-2xl sm:text-4xl text-text-primary break-words leading-tight">
                  {product}
                </h1>
                {operator && (
                  <p className="font-mono text-xs text-text-muted mt-1">by {operator}</p>
                )}
                {report.product_family && (
                  <p className="font-sans text-sm text-text-secondary mt-2 leading-relaxed">{report.product_family}</p>
                )}
              </div>
            </div>
          </div>

          {/* Clearance summary tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Certifications held" value={String(certsHeldCount)} tone={certsHeldCount > 0 ? "good" : "default"} />
            <StatTile label="Maturity" value={maturityLabel} />
            <StatTile
              label="Trains on your data"
              value={trains === true ? "Yes" : trains === false ? "No" : "Unknown"}
              tone={trains === true ? "bad" : trains === false ? "good" : "warn"}
            />
            <StatTile label="Trust center" value={report.has_trust_center ? "Yes" : "No"} tone={report.has_trust_center ? "good" : "default"} />
          </div>

          {/* Primary actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {report.has_trust_center && isSafeHttpUrl(report.trust_center_url) && (
              <a
                href={report.trust_center_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex sm:inline-flex w-full sm:w-auto items-center justify-center gap-2 font-display font-black tracking-widest text-sm px-6 py-3 rounded-[6px] transition-all duration-150 min-h-[48px]"
                style={{ background: ACCENT, color: "#080C10" }}
              >
                <ShieldCheck size={16} /> VENDOR TRUST CENTER
              </a>
            )}
            <Link
              to={`/ai/${report.slug}`}
              className="flex sm:inline-flex w-full sm:w-auto items-center justify-center gap-2 font-mono text-xs tracking-widest border border-border-default text-text-secondary hover:text-accent-green hover:border-accent-green/60 px-5 rounded-[6px] transition-colors duration-150 min-h-[48px]"
            >
              PRICING &amp; DETAILS <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Certification ledger: the report's core, with verbatim sourced proof */}
          <section className="space-y-3">
            <SectionHeader>Certification ledger</SectionHeader>
            <p className="font-mono text-[11px] text-text-muted">
              Each held certification is backed by a verbatim quote from the vendor&apos;s own trust or security page.
              &ldquo;Not confirmed&rdquo; means we could not verify it publicly, not that the vendor lacks it.
            </p>
            {heldCerts.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {heldCerts.map((cert, i) => (
                  <CertLedgerRow key={`h-${i}-${cert.name}`} cert={cert} />
                ))}
              </div>
            )}
            {notHeldCerts.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer font-mono text-xs text-text-muted hover:text-text-secondary min-h-11 flex items-center">
                  &gt; Show {notHeldCerts.length} unconfirmed / not-held certifications
                </summary>
                <div className="grid grid-cols-1 gap-3 mt-3">
                  {notHeldCerts.map((cert, i) => (
                    <CertLedgerRow key={`n-${i}-${cert.name}`} cert={cert} />
                  ))}
                </div>
              </details>
            )}
          </section>

          {/* Privacy & AI training */}
          <section className="space-y-3">
            <SectionHeader>Privacy &amp; AI training</SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`border rounded-[6px] p-3 ${trains === true ? "bg-accent-red/5 border-accent-red/30" : trains === false ? "bg-accent-green/5 border-accent-green/30" : "bg-bg-surface border-border-default"}`}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Trains on customer data</p>
                <p className={`font-mono text-sm mt-1 ${trains === true ? "text-accent-red" : trains === false ? "text-accent-green" : "text-text-primary"}`}>
                  {trains === true ? "Yes" : trains === false ? "No" : "Not stated"}
                </p>
              </div>
              <div className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Data processing agreement</p>
                <p className="font-mono text-sm mt-1 text-text-primary">
                  {report.privacy.dpa === true ? "Offered" : report.privacy.dpa === false ? "Not offered" : "Not stated"}
                </p>
              </div>
              <div className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Data region</p>
                <p className="font-mono text-sm mt-1 text-text-primary break-words">{report.privacy.data_region || "Not stated"}</p>
              </div>
            </div>
            {report.privacy.ai_training_note && (
              <div className="bg-bg-elevated border-l-4 pl-4 py-3 rounded-r-[6px]" style={{ borderLeftColor: ACCENT }}>
                <p className="font-sans text-sm text-text-secondary leading-relaxed">{report.privacy.ai_training_note}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {isSafeHttpUrl(report.privacy.privacy_policy_url) && (
                <a href={report.privacy.privacy_policy_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-mono text-[11px] text-accent-blue hover:underline">
                  <ExternalLink size={11} /> Privacy policy
                </a>
              )}
              {isSafeHttpUrl(report.privacy.terms_url) && (
                <a href={report.privacy.terms_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-mono text-[11px] text-accent-blue hover:underline">
                  <ExternalLink size={11} /> Terms of service
                </a>
              )}
            </div>
          </section>

          {/* Security controls */}
          {report.security && report.security.length > 0 && (
            <section className="space-y-3">
              <SectionHeader>Security controls</SectionHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.security.map((s, i) => (
                  <div key={`${i}-${s.name}`} className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                    <p className="font-mono text-xs text-text-primary font-bold">{s.name}</p>
                    <p className="font-sans text-sm text-text-secondary mt-1 leading-relaxed">{s.value}</p>
                    {isSafeHttpUrl(s.source) && (
                      <a href={s.source} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-accent-blue hover:underline">
                        <ExternalLink size={10} /> {hostOf(s.source)}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Products & data scope */}
          {report.products && report.products.length > 0 && (
            <section className="space-y-3">
              <SectionHeader>Products &amp; data scope</SectionHeader>
              <div className="grid grid-cols-1 gap-3">
                {report.products.map((p, i) => (
                  <div key={`${i}-${p.name}`} className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-display font-black text-sm text-text-primary">{p.name}</span>
                      {p.category && <span className="font-mono text-[10px] text-text-muted border border-border-dim px-1.5 py-0.5 rounded-[3px]">{p.category}</span>}
                    </div>
                    {p.data_scope && <p className="font-mono text-xs text-text-secondary mt-2 leading-relaxed"><span className="text-text-muted">Data it handles: </span>{p.data_scope}</p>}
                    {p.notes && <p className="font-sans text-sm text-text-secondary mt-1 leading-relaxed">{p.notes}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Considerations (flags) */}
          {report.flags && report.flags.length > 0 && (
            <section className="space-y-3">
              <SectionHeader>What to watch</SectionHeader>
              <ul className="space-y-2">
                {report.flags.map((flag, i) => (
                  <li key={i} className="flex gap-2 bg-accent-amber/5 border border-accent-amber/25 rounded-[6px] p-3">
                    <Info size={15} className="text-accent-amber shrink-0 mt-0.5" />
                    <span className="font-sans text-sm text-text-secondary leading-relaxed">{flag}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Compare snapshot */}
          <section className="space-y-3">
            <SectionHeader>At a glance</SectionHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.compare.pricing_model && (
                <div className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Pricing model</p>
                  <p className="font-sans text-sm text-text-secondary mt-1">{report.compare.pricing_model}</p>
                </div>
              )}
              <div className="bg-bg-surface border border-border-default rounded-[6px] p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Self-hostable</p>
                <p className="font-mono text-sm text-text-primary mt-1">
                  {report.compare.self_hostable === true ? "Yes" : report.compare.self_hostable === false ? "No" : "Not stated"}
                </p>
              </div>
            </div>
          </section>

          {/* Methodology & disclaimer */}
          <section className="space-y-2 pt-2">
            <SectionHeader>How we verified this</SectionHeader>
            <div className="bg-bg-elevated border border-border-dim rounded-[6px] p-4 space-y-2">
              <p className="font-mono text-[11px] text-text-muted leading-relaxed">
                Every certification marked HELD is confirmed against a verbatim quote on {report.vendor}&apos;s own trust,
                security, or privacy pages. We reject certifications claimed only on third-party aggregators, on a cloud
                host&apos;s behalf, or by a similarly named company.
              </p>
              <p className="font-mono text-[11px] text-text-muted leading-relaxed">
                {report.last_verified ? `Last verified ${report.last_verified}. ` : ""}
                Compliance changes over time. Always confirm directly with the vendor before relying on any certification
                for a purchasing or compliance decision.
              </p>
              {site && (
                <a href={site} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-mono text-[11px] text-accent-blue hover:underline">
                  <ExternalLink size={11} /> {hostOf(site)}
                </a>
              )}
            </div>
            <p className="font-mono text-[11px] text-text-muted pt-1">
              <Link to="/trust" className="text-accent-green hover:underline">&gt; Browse all vendor trust reports</Link>
            </p>
          </section>

          <div className="h-10" aria-hidden="true" />
        </div>
      </PageWrapper>
    </>
  );
}
