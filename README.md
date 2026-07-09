# AIFOXX

An open-source directory of AI tools with structured, source-backed metadata.

[MIT License](LICENSE) · [aifoxx.com](https://aifoxx.com)

AIFOXX catalogs 980 AI tools and, for each one, records the things that are
hard to compare across vendor marketing pages: pricing tier, compliance posture,
how the vendor handles your data, and the ways you can actually use the tool.
Every compliance claim links to the vendor's own page that backs it. Where a
fact has not been verified, the field is left empty rather than guessed.

Alongside the tools directory it includes:

- **Vendor Trust & Security Reports** at `/trust` and `/trust/:slug`: a per-vendor
  breakdown of certifications, AI-training posture, and security controls, with a
  verbatim quote from the vendor's own trust page behind every certification.
- An index of MCP (Model Context Protocol) servers.
- An index of Claude Code skills.
- A daily-updated AI news feed.
- Side-by-side comparison pages at `/compare/:a/vs/:b`.
- Best-of category guides at `/best`.

## What's recorded for each tool

- **Pricing:** Free, Freemium, Paid, or Open Source, with notes on the free
  tier, paid plans, and API cost where known.
- **Compliance:** SOC 2, ISO 27001, GDPR, and HIPAA flags. Each flag that is
  set to `true` carries a link to the vendor's trust center, security page, or
  privacy policy that backs it.
- **Data storage:** hosting region, whether the vendor trains on customer
  data, and whether the tool can be self-hosted.
- **Access methods:** web app, mobile apps, desktop app, API, and so on.

The tool page shows a compact summary; the full **Trust & Security Report** at
`/trust/:slug` goes deeper: the complete certification list (SOC 2, ISO 27001,
ISO 42001, GDPR, HIPAA, PCI DSS, and more) with a sourced quote for each, the
data-processing-agreement and data-region details, per-product data scope, and a
"what to watch" summary. The tool's compliance summary and its report are driven
by the same data, so they never disagree.

## Getting started

```bash
git clone https://github.com/withkarann/aifoxx.git
cd aifoxx
npm install
npm run dev
```

The dev server runs on http://localhost:8080 (configured in `vite.config.ts`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Generate the sitemap, then build the static site |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest unit tests |
| `npm run validate` | Check `tools.json` for required fields and duplicate slugs |
| `npm run check` | typecheck + lint + validate + build |
| `npm run sitemap` | Regenerate `sitemap.xml` |

## Project structure

```
src/
├── routes.tsx                 # Route table (vite-react-ssg)
├── App.tsx                    # Root layout
├── pages/
│   ├── HomePage.tsx           # / | tool listing, search, filters
│   ├── ToolDetailPage.tsx     # /ai/:slug | single tool
│   ├── CategoryPage.tsx       # /category/:category
│   ├── TagPage.tsx            # /tag/:tag
│   ├── SkillsPage.tsx         # /skills | Claude Code skills
│   ├── McpServersPage.tsx     # /mcp | MCP servers
│   ├── TrustIndexPage.tsx     # /trust | vendor trust report hub
│   ├── TrustReportPage.tsx    # /trust/:slug | one vendor's report
│   ├── NewsPage.tsx           # /news | AI news feed
│   ├── ComparePage.tsx        # /compare | pick tools to compare
│   ├── CompareVsPage.tsx      # /compare/:a/vs/:b | head-to-head
│   ├── BestIndexPage.tsx      # /best | category guide index
│   ├── BestCategoryPage.tsx   # /best/:slug | one category guide
│   └── SubmitPage.tsx         # /submit | tool submission form
├── lib/                       # Data access, search, helpers
├── types/                     # Zod schemas (single source of truth for shape)
└── data/
    ├── tools.json             # tool catalog
    ├── mcp-servers.json       # MCP servers
    ├── claude-code-skills.json# Claude Code skills
    ├── news.json              # AI news items
    ├── best-categories.json   # Best-of category guides
    ├── categoryColors.json    # Category to color/emoji mapping
    ├── brand.json             # Site name and copy
    ├── trust-index.json       # trust report hub listing
    ├── trust-badges.json      # per-tool compliance summary (for tool pages)
    └── trust/                 # one Trust & Security Report per vendor
        └── <slug>.json        # loaded on demand when its report is opened
```

The site is a static SPA: there is no backend and no database. Pages read from
`src/lib/`; components never import the JSON data files directly. Each vendor's
report is its own file so opening a report downloads only that vendor's data,
and every page is pre-rendered to static HTML so its full content is indexable.

## Data accuracy

Pricing, features, and availability change often, so some entries will be out of
date. The governing rule is simple: **`null` means unverified, not zero, and we
never guess.** An empty field is a field nobody has confirmed yet, not a claim
that the answer is "no."

Manual verification is ongoing. As entries are confirmed they will be marked,
and a verified-badge UI is planned.

## Data sources and attribution

Facts are compiled from each vendor's own public pages: trust centers, security
pages, and privacy policies. Every compliance flag set to `true` carries a
source link to the page on the vendor's own domain that supports it. Trademarks,
product names, and logos belong to their respective owners and are used here only
to identify the tools. News items link to their original publishers.

## Correcting the data

Found something wrong or out of date? There are two paths, and both are quick.

**Tool facts** (pricing, category, access methods, links, the four compliance
flags) live in `src/data/tools.json`. Edit that file directly and open a pull
request. Include a source URL on the vendor's own domain for any factual change,
run `npm run validate` to check the file, and you are done. You do not need any
build tooling beyond the commands in the table above.

**Trust & Security Report corrections** (a certification, a training-data claim,
a data-region detail on a `/trust/:slug` page) are best sent as an issue titled
"Compliance correction". Include the vendor, what is wrong, and a link to the
page on the vendor's own domain that shows the correct answer. Report data is
maintained centrally so that every certification stays tied to a verbatim source
quote and the tool page and its report never drift apart; a maintainer applies
the correction and it ships in the next data refresh. A verbatim quote from the
vendor's own trust, security, or privacy page is the single most useful thing you
can include, and it is what gets a correction merged fastest.

## Roadmap

- A full verification pass across every entry.
- A verified-badge UI for confirmed compliance claims.
- A public JSON API / dataset endpoint.
- Wider coverage of MCP servers and Claude Code skills.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, the checks to run before
opening a PR, and the rules for contributing tool data.

## Security

Please do not open a public issue for security reports. See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Karan Rajeshbhai Mungara and Aanjaneya Singh Dhoni
