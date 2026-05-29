import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import Brand from "@/lib/brand";

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  return (
    <div className="relative mt-3">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 flex items-center gap-1 font-mono text-xs text-text-muted hover:text-text-primary transition-colors duration-150"
      >
        {copied ? <><Check size={12} /> COPIED!</> : <Copy size={12} />}
      </button>
      <pre className="bg-bg-base border border-border-dim rounded-[6px] p-4 font-mono text-sm text-accent-green overflow-x-auto whitespace-pre">
        {children}
      </pre>
    </div>
  );
}

const STEPS = [
  {
    num: "01",
    title: "FORK THE REPO",
    desc: "Clone the repository and set up your local environment.",
    code: `git clone ${Brand.product.repo}\ncd aifoxx`,
  },
  {
    num: "02",
    title: "EDIT tools.json",
    desc: "Open src/data/tools.json and add your entry:",
    code: `{
  "name": "Your Tool Name",
  "category": "Coding",
  "subcategory": "Code Generation",
  "description": "One line description (max 200 chars).",
  "url": "https://yourtool.com",
  "tags": ["tag1", "tag2"],
  "pricing": "Free | Freemium | Paid | Open Source",
  "logo_url": "https://... (optional)",
  "featured": false
}`,
  },
  {
    num: "03",
    title: "VALIDATE (NO DUPLICATES)",
    desc: "This checks for duplicate tool names and schema errors. It will fail loudly if anything is wrong.",
    code: "npm run validate",
  },
  {
    num: "04",
    title: "OPEN A PULL REQUEST",
    desc: "Push to your fork and open a PR. CI will re-run validation automatically.",
  },
];

const RULES = [
  "Tool name must be unique (enforced by validator)",
  "No affiliate links",
  "Description max 200 characters",
  "pricing must be exactly: Free, Freemium, Paid, or Open Source",
  "URL must be a valid https:// link",
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": `How to submit an AI tool to ${Brand.product.name_styled}`,
  "description": `Step-by-step open-source contribution guide for adding a tool to ${Brand.product.name_styled}.`,
  "url": `https://${Brand.product.domain}/submit`,
  "step": STEPS.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.title,
    "text": step.desc,
  })),
};

export default function SubmitPage() {
  const brandName = Brand.product.name_styled;
  const brandDomain = Brand.product.domain;

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <PageMeta
        title={`Submit a Tool | ${brandName}`}
        description={`Add your AI tool to ${brandName}. Open source contribution guide with step-by-step instructions.`}
        url={`https://${brandDomain}/submit`}
        keywords={["submit AI tool", "AIFOXX contribution", "add tool directory", "open source AI directory"]}
      />
      <JsonLd schema={howToSchema} id="submit-howto" />
      {/* Header */}
      <h1 className="font-display font-black text-4xl text-accent-green">
        &gt; SUBMIT_A_TOOL
      </h1>
      <p className="font-mono text-sm text-text-secondary mt-3">
        {brandName} is open source. Add tools by editing a JSON file and opening a Pull Request.
      </p>

      {/* Steps */}
      <div className="mt-10 space-y-4">
        {STEPS.map((step) => (
          <div key={step.num} className="bg-bg-surface border border-border-default rounded-[6px] p-5">
            <p className="font-display font-black text-text-primary">
              {step.num} <span className="text-text-muted">//</span> {step.title}
            </p>
            <p className="font-mono text-sm text-text-secondary mt-2">{step.desc}</p>
            {step.code && <CodeBlock>{step.code}</CodeBlock>}
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="mt-8 bg-bg-elevated border border-accent-green/30 rounded-[6px] p-5">
        <p className="font-mono text-xs text-text-muted tracking-widest mb-3">
          // CONTRIBUTION RULES
        </p>
        <ul className="space-y-1.5">
          {RULES.map((rule) => (
            <li key={rule} className="font-mono text-sm text-text-secondary">
              — {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Badge */}
      <div className="mt-8 bg-bg-surface border border-border-default rounded-[6px] p-5">
        <p className="font-display font-black text-text-primary">
          05 <span className="text-text-muted">//</span> ADD A BADGE
        </p>
        <p className="font-mono text-sm text-text-secondary mt-2">
          Show that your tool is listed on {brandName}:
        </p>
        <div className="mt-3 mb-2">
          <img
            src={`https://img.shields.io/badge/Listed_on-${encodeURIComponent(brandName)}-EE761B?style=for-the-badge`}
            alt={`Listed on ${brandName}`}
            className="h-7"
          />
        </div>
        <CodeBlock>{`[![${brandName}](https://img.shields.io/badge/Listed_on-${encodeURIComponent(brandName)}-EE761B?style=for-the-badge)](https://${brandDomain})`}</CodeBlock>
      </div>
    </div>
  );
}
