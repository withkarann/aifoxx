import { GithubLogo } from "phosphor-react";
import { Link } from "react-router-dom";
import Brand from "@/lib/brand";
import { CATEGORIES, toSlug } from "@/lib/tools";
import { CRTOverlay } from "@/components/ui/CRTOverlay";

export function Footer() {
  return (
    <footer className="border-t border-border-dim bg-bg-surface mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center gap-3 sm:px-2 sm:py-3">
        {/* Crawlable category index: every page links to all category hubs,
            which in turn link to each tool. This gives search engines a real
            anchor-based path (home → category → tool) instead of relying on the
            sitemap alone, so the full catalog is discoverable and indexable. */}
        <nav aria-label="Browse AI tools by category" className="w-full max-w-3xl">
          <h2 className="font-mono text-[10px] tracking-widest text-text-muted text-center mb-2">
            // BROWSE BY CATEGORY
          </h2>
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            {CATEGORIES.map((cat) => (
              <li key={cat.name}>
                <Link
                  to={`/category/${toSlug(cat.name)}`}
                  className="font-mono text-[11px] sm:text-[10px] text-text-secondary hover:text-accent-green transition-colors duration-150"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/best" className="font-mono text-xs text-accent-green hover:text-text-primary transition-colors tracking-wider">
          &gt; BEST AI TOOLS BY CATEGORY
        </Link>
        <a
          href="https://www.producthunt.com/products/aifoxx?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-aifoxx"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="AiFoxx on Product Hunt"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1147900&theme=light&t=1778869557296"
            alt="AiFoxx - Best AI Tools by Category | Product Hunt"
            width={250}
            height={54}
            loading="lazy"
          />
        </a>
        <p className="font-mono text-xs sm:text-[10px] text-text-muted tracking-wider text-center break-words">
          {Brand.copy.footer_line}
        </p>
        <p className="font-mono text-[11px] sm:text-[10px] text-text-secondary text-center break-words">
          Open source on{" "}
          <a
            href={Brand.product.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:text-text-primary transition-colors duration-150"
          >
            GitHub
          </a>
        </p>
        <p className="font-mono text-[11px] sm:text-[10px] text-text-secondary text-center break-words">
          Created by{" "}
          <a
            href={Brand.creators.primary.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:text-text-primary transition-colors duration-150"
          >
            @{Brand.creators.primary.name}
          </a>{" "}
          and{" "}
          <a
            href={Brand.creators.co_creator.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:text-text-primary transition-colors duration-150"
          >
            @{Brand.creators.co_creator.name}
          </a>
        </p>
        <div className="flex flex-wrap items-center gap-6 sm:gap-3 font-mono text-xs sm:text-[10px] text-text-muted justify-center">
          <a
            href={Brand.product.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-text-secondary transition-colors duration-150"
          >
            <GithubLogo size={14} />
            Repository
          </a>
          <a
            href={Brand.contact.pull_requests}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-text-secondary transition-colors duration-150"
          >
            <GithubLogo size={14} />
            Pull Requests
          </a>
          <a
            href={Brand.contact.discussions}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-text-secondary transition-colors duration-150"
          >
            <GithubLogo size={14} />
            Discussions
          </a>
          <span>MIT License</span>
          <span>v{Brand.product.version}</span>
          <CRTOverlay />
        </div>
      </div>
    </footer>
  );
}
