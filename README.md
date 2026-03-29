<div align="center">

# 🦊 AIFOXX

**Open-source directory of 1000+ AI tools**  
Structured metadata for pricing, compliance, access methods & more.

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Website](https://img.shields.io/badge/Website-aifoxx.com-blue)](https://aifoxx.com)
[![Stars](https://img.shields.io/github/stars/withkarann/aifoxx?style=social)](https://github.com/withkarann/aifoxx)

[🌐 Website](https://aifoxx.com) · [🐛 Issues](https://github.com/withkarann/aifoxx/issues) · [💬 Discussions](https://github.com/withkarann/aifoxx/discussions)

</div>

---

## ✨ Features

- 🗂️ Curated index of 1000+ AI tools
- 🔍 Filter by category, subcategory, pricing & tags
- 📂 Dedicated category pages with tool grids
- 📌 Tag pages for cross-category discovery
- 📋 Tool detail pages with compliance & data storage metadata
- 🎨 Multi-theme UI — dark, light, notebook
- ✅ Runtime schema validation for data integrity
- 📥 Community tool submission page

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router |
| Validation | Zod |
| Testing | Vitest + Playwright |

## 🚀 Getting Started

```bash
git clone https://github.com/withkarann/aifoxx.git
cd aifoxx
npm install
npm run dev
```

App runs on **http://localhost:8080**

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run lint checks |
| `npm run test` | Run unit tests |
| `npm run validate` | Validate `src/data/tools.json` against schema |

## 🗃️ Project Structure

```
aifoxx/
├── public/                    # Static assets
├── src/
│   ├── components/            # Reusable UI components
│   ├── contexts/              # React context providers (theme, etc.)
│   ├── data/
│   │   ├── tools.json         # ⭐ Main tools dataset (1000+ entries)
│   │   ├── categoryColors.json # Category accent colors & emoji config
│   │   └── brand.json         # Centralized branding & site config text
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   └── tools.ts           # Normalization, filtering & validation utils
│   ├── pages/
│   │   ├── HomePage.tsx       # Main directory listing with search & filters
│   │   ├── CategoryPage.tsx   # Per-category tool grid page
│   │   ├── TagPage.tsx        # Per-tag filtered view
│   │   ├── ToolDetailPage.tsx # Full tool detail — pricing, compliance, links
│   │   ├── SubmitPage.tsx     # Community tool submission form
│   │   ├── NotFoundPage.tsx   # 404 page
│   │   └── Index.tsx          # Route entry point
│   ├── test/                  # Unit & integration tests
│   ├── types/
│   │   └── tool.ts            # Zod schema — single source of truth for tool shape
│   ├── App.tsx                # Root component & route definitions
│   └── main.tsx               # App entry point
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
└── SECURITY.md
```

## 📊 Data Accuracy

> ⚠️ **This project is in active development.** We continuously review and improve data quality, and some entries may still need verification updates.

- Pricing, features, and availability change frequently — some entries may be outdated
- `null` fields are intentional — it means unverified, not missing. We never guess.
- Manual verification is ongoing. Verified entries will be marked in future releases.

**Found incorrect or outdated data?**
- 👉 [Open an issue](https://github.com/withkarann/aifoxx/issues/new?title=[Data+Fix]) with the tool name and what's wrong
- 👉 Or submit a PR directly to `src/data/tools.json`

We review and patch data corrections within **48 hours**.

## 🚧 Roadmap

- [ ] Full manual verification pass on all tool entries
- [ ] Side-by-side tool comparison
- [ ] Pricing plan comparison table
- [ ] Verified compliance badges
- [ ] User-submitted reviews
- [ ] API endpoint for tool data
- [ ] Weekly data freshness checks

## 🔐 Environment & Secrets

This project runs **without environment variables** by default.

If you add `VITE_*` variables later — they are **bundled into client code and are public.**

- Keep `.env.local` private (already git-ignored)
- Never commit tokens, API keys, or credentials
- Use GitHub Actions Secrets for CI/deployment values

## 🤝 Contributing

We'd love your help! See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

1. Fork the repo
2. Create your branch
3. Run `npm run validate` + `npm run test` before opening a PR
4. Open a Pull Request 🎉

> All PRs are reviewed by maintainers before merging. See [CONTRIBUTING.md](CONTRIBUTING.md) for data rules.

## 🛡️ Security

Found a vulnerability? See [SECURITY.md](SECURITY.md). **Don't open a public issue.**

## 📜 License

[MIT](LICENSE) © 2026 [Karan Rajeshbhai Mungara](https://github.com/withkarann) & [Aanjaneya Singh Dhoni](https://github.com/aanjaneyasinghdhoni)
