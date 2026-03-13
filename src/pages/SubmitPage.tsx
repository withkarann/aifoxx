import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

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
    code: `git clone https://github.com/withkarann/toolsai\ncd toolsai`,
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

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      {/* Header */}
      <h1 className="font-display font-black text-4xl text-accent-green">
        &gt; SUBMIT_A_TOOL
      </h1>
      <p className="font-mono text-sm text-text-secondary mt-3">
        ToolsAI is open source. Add tools by editing a JSON file and opening a Pull Request.
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
    </div>
  );
}
