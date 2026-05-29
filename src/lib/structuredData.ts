import Brand from "@/lib/brand";

export const SITE_URL = `https://${Brand.product.domain}`;

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

const SCHEMA = "https://schema.org";

/** Stable @id so search engines can link the Organization across pages. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationSchema() {
  return {
    "@context": SCHEMA,
    "@type": "Organization",
    "@id": ORG_ID,
    name: Brand.product.name_styled,
    alternateName: "AIFoxx AI Tools Directory",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/aifoxx.png"),
    },
    description: Brand.product.description,
    foundingDate: String(Brand.legal?.founded ?? "2026"),
    sameAs: [Brand.product.repo, Brand.contact?.github].filter(Boolean),
  };
}

export function websiteSchema() {
  return {
    "@context": SCHEMA,
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: Brand.product.name_styled,
    url: SITE_URL,
    description: Brand.product.description,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface QA {
  q: string;
  a: string;
}

export function faqPageSchema(qa: QA[]) {
  return {
    "@context": SCHEMA,
    "@type": "FAQPage",
    mainEntity: qa.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export interface ListItemInput {
  name: string;
  url: string;
}

export function itemListSchema(items: ListItemInput[], opts: { name: string; url: string; description?: string }) {
  return {
    "@context": SCHEMA,
    "@type": "CollectionPage",
    name: opts.name,
    url: opts.url,
    ...(opts.description ? { description: opts.description } : {}),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: item.url,
        name: item.name,
      })),
    },
  };
}

export function breadcrumbSchema(crumbs: ListItemInput[]) {
  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.url),
    })),
  };
}
