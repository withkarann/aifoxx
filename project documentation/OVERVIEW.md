# AIFoxx — Project Overview

**Last updated:** March 2026

---

## What is AIFoxx?

AIFoxx is a website where people can find and explore AI tools. It lists 1000+ AI tools in one place, organized by category. Each tool has information like what it does, what it costs, what compliance certifications it has (GDPR, SOC2, HIPAA, etc.), and tags to help you filter.

Think of it as a directory — like a phonebook, but for AI tools.

**Live at:** `aifox.com`
**Deployed on:** Vercel (auto-deploys when code merges to `main`)

---

## What Can Users Do?

- **Browse** tools by category or tag
- **Search** for tools by name or keyword (fast, works in the browser)
- **Filter** by pricing tier, compliance, use case
- **View** a detail page for each tool
- **Explore** Claude Code Skills (`/skills`)
- **Explore** MCP Servers (`/mcp`)
- **Submit** a tool (`/submit`)

---

## Tech Stack (Simple Version)

| Thing | What it is |
|---|---|
| React 18 | Builds the UI |
| React Router 6 | Handles page URLs |
| TypeScript | Typed JavaScript — catches errors early |
| Tailwind CSS | Styling utility classes |
| Shadcn/ui | Pre-built UI components (buttons, cards, etc.) |
| Vite | Builds and runs the app locally |
| Fuse.js | Powers the search (runs in browser, no server needed) |
| React Query | Manages data state |
| Zod | Validates data shapes |
| Vercel | Hosts the site |

There is **no backend** and **no database**. All data lives in static JSON files inside `src/data/`.

---

## Pages & Routes

| URL | Page | What it does |
|---|---|---|
| `/` | Home | Lists all tools, search + filters |
| `/ai/:slug` | Tool Detail | Single tool info page + comments |
| `/category/:name` | Category | Tools filtered by category |
| `/tag/:name` | Tag | Tools filtered by tag |
| `/skills` | Claude Skills | Browse Claude Code skills |
| `/skills/:slug` | Skill Detail | Single skill info page + comments *(planned)* |
| `/mcp` | MCP Servers | Browse MCP servers |
| `/mcp/:slug` | MCP Detail | Single MCP server page + comments *(planned)* |
| `/profile` | Profile | User favorites, likes, view history *(planned)* |
| `/submit` | Submit | Form to submit a new tool |

---

## Project Structure

```
src/
├── App.tsx              ← All routes defined here
├── pages/               ← One file per page/route
├── components/
│   └── ui/              ← Shadcn components (do not edit manually)
├── lib/
│   ├── tools.ts         ← Functions to get/filter tools
│   ├── skills.ts        ← Functions to get/filter skills
│   └── search.ts        ← Fuse.js search setup
├── types/
│   ├── tool.ts          ← What a "Tool" object looks like
│   └── skill.ts         ← What a "Skill" object looks like
└── data/
    ├── tools.json           ← All 1000+ tools (3.7MB)
    ├── mcp-servers.json     ← MCP servers list
    ├── claude-code-skills.json ← Claude Code skills list
    └── categoryColors.json  ← Category → color mapping
```

**Rule:** Pages never import from `data/*.json` directly. They always go through `src/lib/` functions.

---

## Data

All content is static JSON. There is no CMS or admin panel. The main file is `tools.json` — 3.7MB with 1000+ tool entries.

Each tool has fields like:
- `name`, `slug`, `category`, `subcategory`
- `description`, `url`, `tags`
- `pricing` (Free / Freemium / Paid)
- Compliance flags: GDPR, SOC2, HIPAA, ISO27001

Do not edit `tools.json` by hand — use the validate script to check it.

---

## Running the Project Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Validate tools.json
npm run validate
```

---

## Before Every Commit

Run these three commands. All must pass clean:

```bash
npm run lint      # No ESLint errors
npm run build     # No TypeScript or build errors
npm run validate  # No duplicate slugs or missing fields in tools.json
```

---

## Branching & Releases

- `main` — production branch, auto-deploys to Vercel
- `dev` — integration, all features merge here first
- `feature/<name>` — new features
- `fix/<name>` — bug fixes

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add new filter
fix: broken search on mobile
chore: update deps
```

Releases are tagged with semantic versioning: `v1.0.0`, `v1.1.0`, etc.

---

## Current Status (March 2026)

- Claude Skills (`/skills`) and MCP Servers (`/mcp`) pages are built — PR #24 open, pending merge
- i18n (multi-language support) is installed but in progress
- **Next sprint:**
  - User profile system (`/profile`) with localStorage-based favorites, likes, view history (plan-06)
  - Like + Favorite buttons on all ToolCard, SkillCard, McpServerCard (plan-09)
  - Comments section on Tool, Skill, and MCP detail pages — localStorage-based (plan-09)
  - New detail pages: `/skills/:slug` and `/mcp/:slug` (plan-09)

---

## Rules to Remember

- Never commit secrets or API keys — use `.env.local`
- Never edit `src/components/ui/` — those are auto-generated
- Never edit `tools.json` manually
- No backend code — this is a pure static SPA
- All PRs go through review before merging to `main`
