# AIFOXX

An open-source directory of AI tools with structured, source-backed metadata.

[MIT License](LICENSE) · [aifoxx.com](https://aifoxx.com)

AIFOXX catalogs 980 AI tools and, for each one, records the things that are
hard to compare across vendor marketing pages: pricing tier, compliance posture,
how the vendor handles your data, and the ways you can actually use the tool.
Every compliance claim links to the vendor's own page that backs it. Where a
fact has not been verified, the field is left empty rather than guessed.

Alongside the tools directory it includes:

- An index of 154 MCP (Model Context Protocol) servers.
- An index of 1638 Claude Code skills.
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
│   ├── NewsPage.tsx           # /news | AI news feed
│   ├── ComparePage.tsx        # /compare | pick tools to compare
│   ├── CompareVsPage.tsx      # /compare/:a/vs/:b | head-to-head
│   ├── BestIndexPage.tsx      # /best | category guide index
│   ├── BestCategoryPage.tsx   # /best/:slug | one category guide
│   └── SubmitPage.tsx         # /submit | tool submission form
├── lib/                       # Data access, search, helpers
├── types/                     # Zod schemas (single source of truth for shape)
└── data/
    ├── tools.json             # 980 tools
    ├── mcp-servers.json       # 1979 MCP servers
    ├── claude-code-skills.json# 1638 Claude Code skills
    ├── news.json              # AI news items
    ├── best-categories.json   # Best-of category guides
    ├── categoryColors.json    # Category to color/emoji mapping
    └── brand.json             # Site name and copy
```

The site is a static SPA: there is no backend and no database. Pages read from
`src/lib/`; components never import the JSON data files directly.

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

Found something wrong or out of date? Open an issue or a pull request. Data
corrections that include a source URL on the vendor's domain are the fastest to
merge.

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
