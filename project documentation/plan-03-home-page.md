# PLAN-03 — Home Page

---

## 1. PROJECT IDENTITY

```
Name:           AIFoxx — Home Page (/)
Type:           web app page
Primary Language: TypeScript + React
Runtime / Platform: Browser (Vite + React 18)
Owner / Team:   AIFoxx
Start Date:     2025
Target Release: Ongoing — stable
```

---

## 2. PROBLEM & GOALS

**Problem Statement**
The home page is the primary discovery surface for 1000+ AI tools. It must load fast, let users search and filter immediately, and display tools in a clear grid with enough info to decide whether to click through.

**Success Criteria**
- [ ] Page renders first 12 tools in under 1 second on a standard connection
- [ ] Search + filter combination works without page reload
- [ ] Featured tools appear at the top when no filters are active

**Out of Scope**
- Infinite scroll (pagination via URL is used instead)
- Server-side rendering
- Personalized recommendations (future — User Profiles)

---

## 3. ARCHITECTURE

**Pattern:** Stateless page — all state in URL, data from static lib functions

**Layer Map:**
```
HomePage.tsx
    ↓
useToolFilters() + useFilteredTools() + searchTools()
    ↓
allTools from src/lib/tools.ts
    ↓
ToolCard grid (12 per page)
    ↓
Pagination controls (URL ?page=N)
```

**Key Design Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | URL params only | Shareable, no hidden state |
| Featured tools | Shown first when no filters active | Highlights curated tools |
| Pagination | 12 tools per page | Balances density vs. load time |
| Layout | Responsive grid (1→2→3 cols) | Works at all breakpoints |
| Tool display | ToolCard component | Reused across all listing pages |

**External Dependencies / APIs:**
- `react-router-dom` — useSearchParams, Link
- `fuse.js` — search (via search.ts)

---

## 4. DATA MODEL

```
Page State (URL params):
  - search: string
  - category: string
  - subcategory: string
  - pricing: string
  - tag: string[]
  - page: number (default 1)

Derived:
  - filteredTools: Tool[]   — from useFilteredTools()
  - displayTools: Tool[]    — filtered + searched + paginated slice
  - totalPages: number      — Math.ceil(filteredTools.length / 12)
  - activeFilterCount: number
```

**Validation rules:**
- Page number clamped to [1, totalPages]
- Empty search = show all filtered tools (no Fuse call)
- Featured tools sorted to front only when activeFilterCount === 0 and search is empty

---

## 5. DEVELOPMENT LIFECYCLE

```
Phase 1 — Foundation  ✅
  [x] Basic tool grid rendering
  [x] SearchBar component wired
  [x] Category sidebar (desktop)

Phase 2 — Core Features  ✅
  [x] URL-based filter state via useToolFilters()
  [x] Fuse.js search integration
  [x] Pagination with URL sync
  [x] Featured tools priority sort
  [x] Active filter count badge

Phase 3 — Integration  (in progress)
  [ ] Add compliance filter chips to FilterBar
  [ ] Add "sort by" dropdown (featured / A-Z / newest)
  [ ] Connect User Profile favorites — highlight favorited tools on cards

Phase 4 — Hardening
  [ ] Test mobile layout at 320px, 375px, 768px
  [ ] Verify no layout shift on filter changes
  [ ] Confirm all 1000+ tools reachable via pagination

Phase 5 — Release
  [ ] SEO: verify <title> and <meta description> set per page
  [ ] Lighthouse score ≥ 85 on mobile
  [ ] E2E: load homepage, search, filter, paginate
```

---

## 6. TESTING STRATEGY

| Layer | Tool | Coverage Target | When Runs |
|-------|------|----------------|-----------|
| Unit | Vitest | filter + sort logic | Every commit |
| Integration | Vitest | HomePage renders 12 tools | PR |
| E2E | Playwright | search + filter + paginate flow | Pre-release |
| Performance | Lighthouse | LCP < 2.5s | Pre-release |
| Security | — | URL param sanitization | Pre-release |

---

## 7. API / INTERFACE CONTRACT

```
Component: ToolCard
  Props: { tool: Tool, variant?: "default" | "compact" }
  Notes: Handles its own navigation via Link to /ai/:slug

Component: SearchBar
  Props: { value, onChange }
  Notes: Debounced 200ms — consumer handles Fuse call

Component: FilterBar
  Props: derived from useToolFilters()
  Notes: Writes directly to URL params
```

---

## 8. SECURITY CHECKLIST

- [x] Search input sanitized before Fuse.js call
- [x] URL params bounds-checked before use
- [x] No user data logged
- [ ] Tag pills from URL escaped before rendering as text

---

## 9. DOCUMENTATION STANDARDS

| Artifact | Location |
|----------|----------|
| Page component | `src/pages/HomePage.tsx` |
| Filter hook | `src/hooks/useToolFilters.ts` |
| ToolCard | `src/components/tools/ToolCard.tsx` |

---

## 10. MILESTONES & RISKS

| Milestone | Target Date | Done? |
|-----------|-------------|-------|
| Full tool grid with pagination | 2025 | [x] |
| Search + filter combined | 2025 | [x] |
| Compliance filter | Q2 2026 | [ ] |
| Favorites integration | Q2 2026 | [ ] |

**Top Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Slow render with 1000+ tools | Low | High | Only render current page slice |
| Filter state out of sync with URL | Low | Medium | All state reads from URL, never local React state |

---

## 11. DEFINITION OF DONE

- [ ] Grid renders correct tools for active filters
- [ ] Pagination updates URL and scrolls to top
- [ ] Mobile layout passes at 375px
- [ ] `npm run build` and `npm run lint` pass clean
- [ ] E2E test passes for search + filter flow
