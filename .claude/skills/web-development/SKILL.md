---
name: web-development
description: Web development assistant for the AIFoxx project. Use when reviewing code, generating components, debugging, improving SEO/performance, or applying design principles specific to this codebase.
---

# AIFoxx Web Development Assistant

You are helping develop the AIFoxx project — an open-source AI tools directory built with:

## Stack
- **React 18** + **TypeScript** (strict)
- **Vite 6** as build tool
- **Tailwind CSS 3** for styling
- **shadcn/ui** (Radix UI primitives) for component library
- **React Router v6** for routing
- **Phosphor React** for icons (weight: "duotone" preferred)
- **Fuse.js** for fuzzy search
- **Zod** for schema validation
- **react-i18next** for internationalization

## Project Structure
```
src/
  components/
    layout/       NavBar, Sidebar, Footer, PageWrapper
    search/       SearchBar, FilterBar
    tools/        ToolCard, PricingBadge
    ui/           shadcn/ui components + custom (CRTOverlay, DataStatus, ToolCardSkeleton)
    seo/          PageMeta
  contexts/       ThemeContext (dark | light | notebook | sepia)
  data/           tools.json (1000+ tools), categoryColors.json, brand.json
  hooks/          useToolFilters, useFilteredTools, useDebounce, useScrollToTop
  i18n/           i18next config + locale JSON files
  lib/            tools.ts, categoryColors.ts, categoryIcons.tsx, brand.ts, search.ts, utils.ts
  pages/          HomePage, CategoryPage, ToolDetailPage, TagPage, SubmitPage, NotFoundPage
  types/          tool.ts (Zod schema), category.ts
```

## Theming System
- 4 themes: `dark` (default), `light`, `notebook`, `sepia`
- CSS variables: `--bg-base`, `--bg-surface`, `--bg-elevated`, `--bg-overlay`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent-green`, `--accent-red`, `--accent-blue`, `--border-default`, `--border-muted`, `--border-dim`
- Use Tailwind classes like `bg-bg-surface`, `text-text-primary`, `border-border-default`, `text-accent-green`

## Design Principles
- **Font**: `font-display` for headings, `font-mono` for code/labels/data
- **Borders**: `rounded-[4px]` for small elements, `rounded-[6px]` for cards/panels, `rounded-[8px]` for large containers
- **Spacing**: Consistent `gap-4` grids, `space-y-4` for stacked sections
- **Icons**: Always use Phosphor React with `weight="duotone"` and `size={16-24}`
- **Accessibility**: Every interactive element needs `aria-label`; images need `alt`
- **Retro terminal aesthetic**: ALL_CAPS labels, `//` comment prefixes, `>` prompt prefixes

## Component Generation Rules
1. Always use `cn()` from `@/lib/utils` for conditional classnames
2. Use shadcn/ui components before writing custom ones
3. Add `font-mono text-xs tracking-widest` to labels/badges
4. Category colors come from `getCategoryColor(categoryName)` in `@/lib/categoryColors`
5. Icons come from `getCategoryIcon(categoryName)` in `@/lib/categoryIcons`
6. All page-level components need a `<PageMeta>` component for SEO
7. Use `useTranslation` from `react-i18next` for all user-visible strings

## Routing (React Router v6)
- `/` → HomePage
- `/ai/:slug` → ToolDetailPage
- `/category/:category` → CategoryPage
- `/tag/:tag` → TagPage
- `/submit` → SubmitPage

## Performance Rules
- Wrap expensive computations in `useMemo`
- Use `useCallback` for event handlers passed as props
- Debounce search with 300ms (use `useDebounce` hook)
- Lazy load page components if adding new routes
- Vercel Analytics + Speed Insights already wired in `main.tsx`

## SEO Rules
- Every page must have unique `<PageMeta title="" description="" url="" />`
- Sitemap lives at `public/sitemap.xml` — update when adding new routes
- `public/robots.txt` allows all crawlers

## Debugging Common Issues
- **Hydration errors**: Check that server/client render the same output
- **CORS**: All external API calls must go through a proxy or be same-origin
- **React Router 404 on reload**: `vercel.json` has rewrites — check that config
- **Theme flash**: ThemeContext applies class to `<html>` on mount
- **i18n not updating**: Ensure component uses `useTranslation`, not hardcoded strings
