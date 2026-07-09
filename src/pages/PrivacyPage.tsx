import { PageMeta } from "@/components/seo/PageMeta";
import Brand from "@/lib/brand";

const LAST_UPDATED = "June 12, 2026";

interface Section {
  num: string;
  title: string;
  body: string[];
}

const SECTIONS: Section[] = [
  {
    num: "01",
    title: "THE SHORT VERSION",
    body: [
      `${Brand.product.name_styled} is a static, open-source website with no accounts, no login, and no database. We do not ask you for any personal information, and we do not sell or share data about you.`,
      "We do not run our own tracking. The only data that leaves your browser goes to a small number of standard third-party services described below, mostly to load the site and a few images.",
    ],
  },
  {
    num: "02",
    title: "WHAT WE COLLECT",
    body: [
      "Nothing directly. There are no sign-up forms, contact forms, newsletters, or comment boxes on this site. We never see an email address, name, or payment detail because we never ask for one.",
      "Suggesting a new tool happens entirely on GitHub through a public Pull Request, which is governed by GitHub's own privacy policy, not ours.",
    ],
  },
  {
    num: "03",
    title: "STORED IN YOUR BROWSER",
    body: [
      "We save your display preferences (color theme and the retro screen effect) in your browser's local storage under the keys aifoxx-theme and aifoxx-crt.",
      "This data stays on your device, is never sent to us or anyone else, and exists only to remember how you like the site to look. You can clear it any time through your browser settings.",
    ],
  },
  {
    num: "04",
    title: "THIRD-PARTY SERVICES",
    body: [
      "Hosting and analytics: the site is hosted on Vercel, which keeps standard server access logs (including IP addresses) to deliver pages and protect against abuse. We use Vercel Analytics and Speed Insights, which are cookieless and report only aggregated, anonymized usage and performance. They do not build a profile of you or track you across other websites.",
      "Tool icons: tool logos are served from our own site, so viewing them does not contact any third party or share your IP address with an outside service.",
      "Badges: the footer shows a Product Hunt badge image and some pages show a shields.io badge. Loading these images contacts those services in the same way any embedded image does.",
      "Fonts are bundled with the site, so loading the page does not call Google Fonts or any external font service.",
    ],
  },
  {
    num: "05",
    title: "COOKIES",
    body: [
      "We do not set any advertising or cross-site tracking cookies. Our analytics provider is configured to run without cookies. The only thing we store locally is your display preference, described above.",
    ],
  },
  {
    num: "06",
    title: "YOUR CHOICES",
    body: [
      "Because we hold no account or personal data about you, there is nothing for us to export or delete on request. You stay in control: clear your browser storage to reset preferences, use a content or tracker blocker to stop third-party images and analytics from loading, or browse with a VPN to mask your IP from our host and the image services above.",
    ],
  },
  {
    num: "07",
    title: "OPEN SOURCE AND VERIFIABLE",
    body: [
      `Everything on this site is open source under the ${Brand.legal.license} license. You do not have to take this policy on faith: the entire codebase is public, so you can read exactly what the site loads and where every request goes.`,
      "If you spot something this page gets wrong, please open an issue or Pull Request on the repository.",
    ],
  },
  {
    num: "08",
    title: "CHANGES AND CONTACT",
    body: [
      "If our practices change, we will update this page and the date below. Questions or concerns are best raised through the project's GitHub repository, where they are public and get a faster answer.",
    ],
  },
];

export default function PrivacyPage() {
  const brandName = Brand.product.name_styled;
  const brandDomain = Brand.product.domain;

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <PageMeta
        title={`Privacy Policy | ${brandName}`}
        description={`How ${brandName} handles data: a static, open-source AI tools directory with no accounts, no tracking cookies, and no personal data collection.`}
        url={`https://${brandDomain}/privacy`}
        keywords={["AIFOXX privacy", "privacy policy", "no tracking", "open source directory", "cookieless analytics"]}
      />

      {/* Header */}
      <h1 className="font-display font-black text-4xl text-accent-green">
        &gt; PRIVACY_POLICY
      </h1>
      <p className="font-mono text-sm text-text-secondary mt-3">
        {brandName} is a static, open-source site. We collect no personal data and run no tracking of our own. Here is exactly what happens when you visit.
      </p>
      <p className="font-mono text-xs text-text-muted mt-2">
        // LAST UPDATED: {LAST_UPDATED}
      </p>

      {/* Sections */}
      <div className="mt-10 space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.num} className="bg-bg-surface border border-border-default rounded-[6px] p-5">
            <h2 className="font-display font-black text-text-primary">
              {section.num} <span className="text-text-muted">//</span> {section.title}
            </h2>
            {section.body.map((paragraph, index) => (
              <p key={index} className="font-mono text-sm text-text-secondary mt-2 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* Repo callout */}
      <div className="mt-8 bg-bg-elevated border border-accent-green/30 rounded-[6px] p-5">
        <h2 className="font-mono text-xs text-text-muted tracking-widest mb-3">
          // READ THE SOURCE
        </h2>
        <p className="font-mono text-sm text-text-secondary leading-relaxed">
          Don't trust, verify. The full source is on{" "}
          <a
            href={Brand.product.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:text-text-primary transition-colors duration-150"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
