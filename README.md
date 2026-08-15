<div align="center">

# 🦊 AIFOXX

### The open-source directory of AI tools with structured, source-backed metadata

Every compliance claim links to the vendor page that proves it. Where a fact is unverified, the field stays empty instead of guessed.

[![Live site](https://img.shields.io/badge/live-aifoxx.com-6C47FF?style=for-the-badge)](https://aifoxx.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-F59E0B?style=for-the-badge)](CONTRIBUTING.md)

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel)

</div>

---

## At a glance

| | Count | What it is |
|---|--:|---|
| 🛠️ **AI tools** | 990 | Searchable, filterable catalog with pricing, compliance, and data-handling metadata |
| 🔌 **MCP servers** | 1,979 | Indexed Model Context Protocol servers |
| 🧩 **Claude Code skills** | 1,638 | Indexed Claude Code skills |
| 🛡️ **Trust & Security Reports** | 980 | Per-vendor reports, every certification backed by a verbatim source quote |

> The governing rule across all of it: **`null` means unverified, not zero. We never guess.**

## Why AIFOXX

Most AI directories are a wall of logos. AIFOXX records the things that are genuinely hard to compare across vendor marketing pages, and it sources every claim:

- 💰 **Pricing** | Free, Freemium, Paid, or Open Source, with free-tier, paid-plan, and API-cost notes where known.
- 🔒 **Compliance** | SOC 2, ISO 27001, GDPR, and HIPAA flags. Every flag set to `true` links to the vendor's own trust center, security page, or privacy policy.
- 🗄️ **Data handling** | Hosting region, whether the vendor trains on customer data, and whether the tool is self-hostable.
- 🚪 **Access methods** | Web, mobile, desktop, API, and more.

The tool page shows a compact summary. The full **Trust & Security Report** at `/trust/:slug` goes deeper: the complete certification list (SOC 2, ISO 27001, ISO 42001, GDPR, HIPAA, PCI DSS, and more) with a sourced quote for each, data-processing-agreement and data-region details, per-product data scope, and a "what to watch" summary. The summary and the report are driven by the same data, so they never disagree.

## Explore

| Route | Page |
|---|---|
| `/` | Tool listing with search and filters |
| `/ai/:slug` | Single tool, plus related Claude skills |
| `/category/:category` | Tools by category |
| `/trust` and `/trust/:slug` | Vendor Trust & Security Reports |
| `/compare/:a/vs/:b` | Side-by-side comparison |
| `/best` and `/best/:slug` | Best-of category guides |
| `/skills` and `/mcp` | Claude Code skills and MCP server indexes |
| `/news` | Daily-updated AI news feed |

## Getting started

```bash
git clone https://github.com/withkarann/aifoxx.git
cd aifoxx
npm install
npm run dev
```

The dev server runs on http://localhost:8080 (configured in `vite.config.ts`).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Generate the sitemap, then build the static site |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest unit tests |
| `npm run validate` | Check `tools.json` for required fields and duplicate slugs |
| `npm run check` | typecheck, lint, validate, build (the full gate) |
| `npm run sitemap` | Regenerate `sitemap.xml` |

## Project structure

```
src/
├── routes.tsx                 # Route table (vite-react-ssg)
├── App.tsx                    # Root layout
├── pages/                     # One file per route (Home, ToolDetail, Trust, News, Compare, Best, ...)
├── lib/                       # Data access, search, helpers
├── types/                     # Zod schemas (single source of truth for shape)
└── data/
    ├── tools.json             # Tool catalog (human-editable source)
    ├── mcp-servers.json       # MCP servers
    ├── claude-code-skills.json# Claude Code skills
    ├── news.json              # AI news items
    ├── best-categories.json   # Best-of category guides
    ├── trust-index.json       # Trust report hub listing
    ├── trust-badges.json      # Per-tool compliance summary
    └── trust/<slug>.json      # One Trust & Security Report per vendor, loaded on demand
```

The site is a static SPA: no backend, no database. Pages read from `src/lib/`; components never import JSON data directly. Each vendor's report is its own file, so opening a report downloads only that vendor's data, and every page is pre-rendered to static HTML so its full content is indexable.

## What we list

AIFOXX lists AI tools that a person or a team can evaluate on how they handle data: what they store, where they store it, whether they train on your input, and what they can prove. Every entry is checked against the live site before it goes in.

Some things are out of scope, and submissions in these areas are declined:

- Astrology, tarot, numerology, and other divination products
- Adult and pornographic content
- Betting, gambling, and real-money wagering
- Tools whose live site does not match what the submission describes
- Products that take another company's model name as their own brand

The featured slot on the home page holds products built by the people who maintain AIFOXX, and it says so on the page. Those products are listed with the same fields, the same verification, and the same unproven claims left as `null` as everything else. Being featured is a disclosure, not a ranking, and it never moves a product up the catalog.

A listing is a judgement at a point in time, not a permanent record. Tools get removed when they shut down, when their claims stop checking out, or when they no longer meet the bar. Tools we declined before can be listed later if what they offer changes. The catalog is curated on purpose, so it will keep moving.

**Listed here and want it taken down?** Open a [tool removal request](https://github.com/withkarann/aifoxx/issues/new?template=tool-removal.yml). If it is your product, you do not need to give a reason. [GOVERNANCE.md](GOVERNANCE.md) covers how these calls are made, and [SUPPORT.md](SUPPORT.md) points you at the right form for everything else.

## Contributing data

Found something wrong or out of date? Two quick paths:

- **Tool facts** (pricing, category, access methods, links, the four compliance flags) live in `src/data/tools.json`. Edit it directly and open a PR. Include a source URL on the vendor's own domain for any factual change, run `npm run validate`, and you are done.
- **Trust & Security Report corrections** (a certification, a training-data claim, a data-region detail) are best sent as an issue titled "Compliance correction". Include the vendor, what is wrong, and a link to the page on the vendor's own domain that shows the correct answer. A verbatim quote from the vendor's own trust, security, or privacy page is the single most useful thing you can include.

**Submitting a new tool?** Open an issue with the product name, URL, category, a short description, and links to the privacy policy and terms. Submissions are verified against the live site before they are added.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full setup and the pre-PR checklist.

## Data sources and attribution

Facts are compiled from each vendor's own public pages: trust centers, security pages, and privacy policies. Every compliance flag set to `true` carries a source link to the page on the vendor's own domain that supports it. Trademarks, product names, and logos belong to their respective owners and are used only to identify the tools. News items link to their original publishers.

## Roadmap

- [ ] A full verification pass across every entry
- [ ] A verified-badge UI for confirmed compliance claims
- [ ] A public JSON API / dataset endpoint
- [ ] Wider coverage of MCP servers and Claude Code skills

## Support this work

Every entry here is read and checked by hand against the vendor's own trust, security, and privacy pages. Nothing is scraped and published unverified, which is slow, and it is the whole reason the data is worth anything.

If that saves you time, three things help, in order of how much they help:

- Share it with someone who is picking AI tools for their team
- Star the repo, which is how most people find it
- [Sponsor the work](https://github.com/sponsors/withkarann) if your company relies on it

## Security

Please do not open a public issue for security reports. See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Karan Rajeshbhai Mungara and Aanjaneya Singh Dhoni
