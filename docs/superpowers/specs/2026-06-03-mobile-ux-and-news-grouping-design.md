# Mobile UX cleanup, News grouping & SEO polish — Design

**Date:** 2026-06-03
**Branch:** `feature/mobile-ux-and-news-grouping`
**Constraint:** Static SPA, no backend (per CLAUDE.md). **No likes feature** (per user). **Do not push** — local only.

## Problem (grounded in mobile screenshots @ 390×844)

1. **Tools are buried on mobile.** The homepage first screen is entirely Hero (logo + typing title + search) → `PRICING` filter → `FILTER` button → `// BEST AI TOOLS BY CATEGORY` (a 4-line paragraph + 12 wrapping chips) → `// FEATURED AI TOOLS` carousel. The real tool grid starts ~2.5 screens down. Zero tools above the fold.
2. **Tool cards are badge-noisy.** Each `ToolCard` shows pricing badge + category chip + subcategory chip + compare button + up to 3 `#tag` pills — visually cluttered, worst on a 1-column mobile layout.
3. **Category sidebar/drawer** (`Sidebar.tsx`) is dense; long names truncate awkwardly.
4. **News page** has tabs (All/News/New Tools) but no date grouping and no source filter; stories run as a flat chronological list.
5. **SEO** is already strong. One data-quality bug: every tool's `SoftwareApplication` JSON-LD hardcodes `offers.price = "0"`, which is wrong for paid tools. (Bundle size / Core Web Vitals is the larger lever but is out of scope for this pass — noted as follow-up.)

## Goals

- On mobile, a real tool is visible within the first screenful (after a compact hero + search).
- Reduce per-card visual noise without losing useful info.
- News page gains date grouping + a source filter, keeping existing tabs.
- Fix the structured-data price bug. No regressions on desktop. No pushes.

## Approach (chosen)

**Responsive reordering over deletion.** Keep all content (good for SEO and desktop), but on mobile reorder and compact it so tools come first. Use Tailwind responsive utilities + `order-*`; no duplicated DOM where avoidable.

### A. HomePage (`src/pages/HomePage.tsx`)
- **Hero:** reduce mobile vertical padding (`py-10` → ~`py-6`) and tighten spacing so the hero + search fit in roughly one third of the first screen.
- **Reorder on mobile:** wrap the post-FilterBar content in a `flex flex-col`; assign `order` so the **results count + tool grid** render first on mobile (`order-first`) and the **Best-by-category** + **Featured** promo sections move below the grid (`order-last`). On `md:` restore the original visual order (promos above grid).
- **Best-by-category chips:** on mobile render as a single horizontally-scrolling row (`flex-nowrap overflow-x-auto`) instead of `flex-wrap` (which stacks to ~8 rows). Keep wrap on `md:`.

### B. ToolCard (`src/components/tools/ToolCard.tsx`)
- Keep: logo, name, pricing badge, description, category chip, compare toggle.
- De-emphasize: render subcategory chip more muted; cap tags at 2 on mobile (3 on `sm:`+). Tighten footer spacing. Goal is clearer hierarchy, not removing data.

### C. Sidebar (`src/components/layout/Sidebar.tsx`)
- Light polish: ensure category names wrap/truncate cleanly and count pills stay aligned. Low-risk, cosmetic only.

### D. NewsPage (`src/pages/NewsPage.tsx`)
- **Date grouping:** group the visible list under headers — `Today`, `Yesterday`, `This Week`, `Earlier` — derived from each item's ISO `date` (reuse/extend `src/lib/news.ts`). Keep numbering or switch to per-group ordering.
- **Source filter:** add a compact source `<select>` (mobile-friendly) that filters the current tab's items by `source`. Options derived from the data present in the active tab.
- Keep the existing All/News/New Tools tabs and "show more" pagination. Keep ItemList JSON-LD.

### E. SEO (`src/pages/ToolDetailPage.tsx`)
- Fix `SoftwareApplication` offers: only emit `offers` with `price: "0"` when the tool is genuinely Free/Freemium/Open Source; otherwise omit the hardcoded price (or model it accurately). Prevents structured-data/price mismatch flags.

## Out of scope (follow-ups)
- Likes/engagement (explicitly declined).
- Bundle-size / Core Web Vitals (code-splitting the 3.7MB tools.json) — larger perf project.
- `<meta name="keywords">` removal — harmless; skip unless requested.

## Verification
- Before/after mobile screenshots @ 390×844 (home above-the-fold + full, news).
- Desktop spot-check @ 1280 to confirm no regression.
- `npm run typecheck && npm run lint && npm run build` clean.
- No `git push`.

## Task breakdown (independent-ish)
- **T1** HomePage mobile reorder + hero + chip strip.
- **T2** ToolCard badge density.
- **T3** NewsPage date grouping + source filter (+ `news.ts` helper).
- **T4** ToolDetailPage SoftwareApplication offers fix.
- **T5** Sidebar cosmetic polish.

## Implementation outcome (2026-06-03)
- **T1 — done & verified** (`89084eb`). Mobile reorders to grid-first; compact hero; single-line scrollable chips. Desktop unchanged. Verified mobile + desktop on the production build.
- **T2 — done & verified** (`42dbafe`). Third tag pill hidden below `sm`. Verified on production build.
- **T3 — done, reviewed, hardened** (`b8531c6` → `c59ab96` → `2c05dec`). Date grouping (Today/Yesterday/This Week/Earlier) + source filter. Spec + code-quality reviewed. Code review caught a no-op `useMemo`; verification then surfaced a real **SSG hydration mismatch** (React #418/#423): grouping must not depend on `Date.now()`. Fixed by anchoring buckets to a **data-derived UTC** reference (newest item), so prerendered HTML and client hydration are byte-identical. Verified on a production build (`npm run build` + `npm run preview`) including a cross-timezone build (`TZ=America/Los_Angeles`) loaded in a GMT+2 browser — console clean.
- **T4 — NOT NEEDED.** The `SoftwareApplication` offer is already correctly guarded by `hasFreeOffer` (only emitted for Free/Freemium/Open Source). The earlier audit claim ("hardcodes price 0 for every tool") was wrong — it missed the guard. No change made.
- **T5 — SKIPPED.** The category drawer ("left bar") is clean and readable on mobile (full names, aligned count pills); no genuine defect. The card-clutter complaint is addressed by T1 + T2. No change made (avoiding fabricated work).
- **Bonus fix** (`27acba1`): `formatAbsoluteDate` now renders in **UTC** (`timeZone: 'UTC'`), removing a pre-existing latent hydration risk (Vercel builds in UTC; clients elsewhere). Added unit tests. 13/13 tests pass.

**Not pushed.** Branch `feature/mobile-ux-and-news-grouping` is local-only, awaiting user review. `npm run typecheck`, `npm run lint`, `npm run validate` (1000 tools), and `npm run build` all pass.
