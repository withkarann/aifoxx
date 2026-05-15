
# Goal
Make AIFOXX rank on Google when people search **"best AI tools"** and similar queries (e.g. "best AI tools for coding", "free AI tools", "AI tools for marketing").

# Reality check (Semrush data)

| Keyword | Volume/mo | Difficulty | Notes |
|---|---|---|---|
| best ai tools | 6,600 | 48/100 (tough) | Top results: Reddit, Medium, futurepedia.io |
| ai tools | 27,100 | medium | Same competitive landscape |
| best ai apps | 12,100 | high | |
| what is the best ai tool | 480 | high | Long-tail, easier |
| best ai tools for [niche] | 100–1,000 each | low–medium | **Realistic targets** |

`aifoxx.com` currently has **~2 indexed keywords and ~0 organic traffic** (per Semrush). The domain is brand new, so ranking for the head term "best ai tools" against Reddit and Medium will take 6–12 months of consistent work. The fastest path is to win **dozens of long-tail "best AI tools for X" queries** first — these compound into authority for the head term.

# Strategy

Two tracks running in parallel:

1. **On-page SEO fixes** (this plan covers — code changes)
2. **Content + backlinks** (out of scope for code, but called out at the end)

---

# Track 1: On-page SEO changes

## 1. Rewrite homepage for "best AI tools" intent

Currently the homepage targets "AI Tools Directory". We retarget it to **"Best AI Tools"** while keeping the directory framing.

- **`<title>`**: `Best AI Tools 2026 — 1000+ Curated AI Tools Directory | AIFOXX`
- **`<meta description>`**: `Discover the best AI tools for coding, design, marketing, writing, and more. 1000+ curated AI tools with pricing, reviews, and compliance info. Updated daily.` (≤160 chars)
- **H1**: `Best AI Tools — 1000+ Curated for 2026`
- **Intro paragraph under H1** (new, ~80 words) explicitly using the phrase "best AI tools" 2–3 times naturally, e.g. *"AIFOXX is the most comprehensive directory of the best AI tools available today. Browse over 1,000 hand-picked AI tools across coding, design, writing, marketing, video, and more…"*
- Update `index.html` static `<title>`, `<description>`, og tags to match (so non-JS crawlers see the same).

## 2. Build dedicated landing pages for "best AI tools for [category]"

These long-tail pages are where we'll actually rank first. Add a new route `/best/:category` that renders a curated, content-rich page per category. Examples:

- `/best/ai-coding-tools` → "Best AI Coding Tools in 2026"
- `/best/ai-writing-tools` → "Best AI Writing Tools in 2026"
- `/best/ai-image-tools` → "Best AI Image Generation Tools"
- `/best/ai-marketing-tools` → "Best AI Marketing Tools"
- ~15–20 of these total, one per top-level category in `tools.json`

Each page contains:
- H1: `Best AI [Category] Tools in 2026`
- Intro paragraph (150–200 words) — unique, written, not auto-generated boilerplate
- Top 10 tools listed with name, 2–3 sentence editorial blurb, price, link
- "How we picked" section (50–100 words) — adds E-E-A-T signal
- FAQ section with 4–5 questions (e.g. "What's the best free AI coding tool?", "Which AI coding tool is most accurate?") — these target the "question keywords" Semrush surfaced
- `FAQPage` and `ItemList` JSON-LD schema for rich results
- Internal links from homepage and category pages

Content for these pages must be **written manually or with AI then edited** — pure boilerplate gets flagged as thin content (which is already happening with your "Crawled – not indexed" finding).

## 3. Improve tool detail page SEO (`/ai/:slug`)

Currently 156 tool pages are "Discovered – not indexed". Likely cause: pages look too thin / similar. Fix:

- Add `Product` JSON-LD schema with name, description, offers (pricing), aggregateRating placeholder
- Add `BreadcrumbList` JSON-LD
- Title format: `[Tool Name] Review 2026 — Pricing, Features & Alternatives | AIFOXX` (currently just tool name)
- Meta description: include pricing tier and primary use case in the first 120 chars
- Add a "Pros & Cons" section (even if short) — gives unique content per page
- Add an "Alternatives to [Tool]" section linking to 3–5 related tools (you already have `getRelatedTools()` — just frame it as "alternatives")
- `<h2>` headings for each section so the page has clear structure

## 4. Add a `WebSite` + `SearchAction` schema sitewide

Lets Google show a sitelinks search box for the brand. Add to `index.html`:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AIFOXX",
  "url": "https://aifoxx.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://aifoxx.com/?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

## 5. Internal linking

- Homepage hero adds a section: **"Browse the best AI tools by category"** with 8–12 prominent links to the new `/best/:category` pages
- Footer adds a **"Best AI Tools"** column listing the same `/best/:category` links
- Each tool detail page links back to its `/best/:category` parent ("See all best AI [category] tools →")
- Each `/best/:category` page links to relevant other `/best/` pages ("See also: best AI writing tools")

## 6. Update `sitemap.xml` generator

Add the new `/best/:category` routes to `scripts/generate-sitemap.mjs` so Google discovers them immediately.

## 7. Page speed + Core Web Vitals

- Confirm the 3.7MB `tools.json` is not blocking initial render (it shouldn't be — it's imported lazily). If LCP suffers, code-split it.
- Lazy-load tool images on cards
- Verify Lighthouse SEO score is 100 on homepage and a sample `/best/` page before shipping

---

# Track 2: Off-page (no code, but you must do this)

Without these, on-page SEO alone won't beat Reddit/Medium for "best ai tools":

1. **Submit sitemap to Google Search Console** (you already have GSC set up)
2. **Request indexing** for homepage + 5 new `/best/` pages manually in GSC
3. **Get backlinks**: submit AIFOXX to Product Hunt, Hacker News (Show HN), Indie Hackers, BetaList, AlternativeTo, SaaSHub, Futurepedia (it's a competitor but accepts submissions), GitHub awesome-lists for AI tools
4. **Write 1 blog post per month** answering question keywords (e.g. "What is the best AI tool for coding in 2026?") and publish at `/blog/...` — requires a new route, not in scope for this plan but should be next sprint

---

# Technical detail (for the engineer)

**Files to change**
- `index.html` — title, description, og tags, add `WebSite`+`SearchAction` JSON-LD
- `src/pages/HomePage.tsx` — new H1, intro paragraph, "Browse by category" section, updated `<PageMeta>`
- `src/pages/ToolDetailPage.tsx` — new title format, longer description, Pros/Cons section, `Product` + `BreadcrumbList` JSON-LD, "Alternatives" framing
- `src/components/seo/JsonLd.tsx` — extend to support `Product`, `FAQPage`, `ItemList`, `BreadcrumbList`, `WebSite` types
- `src/components/layout/Footer.tsx` — add "Best AI Tools" link column
- `src/App.tsx` (or `routes.tsx`) — add `/best/:category` route
- **New**: `src/pages/BestCategoryPage.tsx` — the new landing page template
- **New**: `src/data/best-categories.json` — editorial content per category (intro, FAQ, picks, hand-written blurbs)
- `scripts/generate-sitemap.mjs` — append `/best/:category` URLs

**No backend, no schema changes** — fits the existing static-SPA architecture.

**Effort estimate**
- Code changes: ~1 day
- Writing the editorial content for 15 `/best/:category` pages: ~3–5 days (this is the bottleneck, not code)

---

# What I need from you before building

1. Should I start with **all 15+ category pages** or pick **3 high-value ones first** (e.g. coding, writing, image generation) as a pilot?
2. Will you **write the editorial content** for the `/best/` pages, or should I generate first drafts you'll edit? (Pure AI-generated content without editing is what's getting your tool pages flagged as thin.)
3. OK to make tool detail page titles longer (e.g. "ChatGPT Review 2026 — Pricing, Features & Alternatives")? It helps SEO but changes the look in browser tabs and shares.

Once you answer, I'll switch to build mode and ship the on-page changes.
