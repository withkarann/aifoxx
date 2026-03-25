# PLAN-02 — Search & Filtering

---

## 1. PROJECT IDENTITY

```
Name:           AIFoxx — Search & Filtering
Type:           web app feature
Primary Language: TypeScript + React
Runtime / Platform: Browser (Vite + React 18)
Owner / Team:   AIFoxx
Start Date:     2025
Target Release: Ongoing — stable
```

---

## 2. PROBLEM & GOALS

**Problem Statement**
With 1000+ tools, users need to narrow down results fast. All filtering must work instantly in the browser — no server round-trips — and filter state must survive page refresh and back/forward navigation.

**Success Criteria**
- [ ] Search returns results in under 100ms for any query
- [ ] All active filters are reflected in the URL so links are shareable
- [ ] Clearing all filters resets the page to the full tool list

**Out of Scope**
- Server-side search
- Saved searches (handled by User Profiles, see plan-06)
- Autocomplete suggestions

---

## 3. ARCHITECTURE

**Pattern:** URL as state — filters live in query params, not React state

**Layer Map:**
```
User types / clicks filter
    ↓
useToolFilters() — reads/writes useSearchParams()
    ↓
useFilteredTools(filters) — applies category/pricing/tag filters
    ↓
searchTools(query, filteredTools) — Fuse.js fuzzy match
    ↓
Paginated results → ToolCard grid
```

**Key Design Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | URL query params via useSearchParams() | Shareable links, browser history works |
| Search engine | Fuse.js (client-side) | No backend needed, fast for 1000 tools |
| Debounce | 200ms on search input | Avoids re-running Fuse on every keystroke |
| Filter persistence | URL only | Intentional — no hidden state |
| Pagination | 12 tools per page, URL `?page=N` | Keeps initial render fast |

**External Dependencies / APIs:**
- `fuse.js` — fuzzy search
- `react-router-dom` — `useSearchParams()`

---

## 4. DATA MODEL

```
Filter State (lives in URL params):
  - search: string        # free text, max 200 chars
  - category: string      # single value
  - subcategory: string   # single value
  - pricing: string       # single value
  - tag: string[]         # multi-value (?tag=X&tag=Y)
  - page: number          # defaults to 1

Fuse.js Index (built once from allTools):
  - Keys searched: name, description, tags, category, subcategory
  - Threshold: 0.3 (fuzzy tolerance)
  - Input sanitized: trimmed + capped at 200 chars
```

**Validation rules:**
- `page` must be a positive integer — invalid values fall back to 1
- `pricing` must match known pricing enum or be ignored
- `search` input trimmed and length-capped before passing to Fuse

---

## 5. DEVELOPMENT LIFECYCLE

```
Phase 1 — Foundation  ✅
  [x] Fuse.js index built in src/lib/search.ts
  [x] useSearchParams() wired in HomePage

Phase 2 — Core Features  ✅
  [x] useToolFilters() hook — reads/writes all filter params
  [x] useFilteredTools() hook — applies non-search filters
  [x] searchTools() — Fuse.js over filtered set
  [x] Pagination — 12 per page, URL-synced
  [x] activeFilterCount badge on filter bar

Phase 3 — Integration
  [ ] Scope search to current page context (skills page searches skills only)
  [ ] Add compliance filter (GDPR / SOC2 / HIPAA checkboxes)
  [ ] Add "sort by" option (featured first / alphabetical / newest)

Phase 4 — Hardening
  [ ] Verify Fuse.js performance at 2000+ tools
  [ ] Sanitize all tag values from URL before rendering
  [ ] Test with special characters in search input

Phase 5 — Release
  [ ] E2E test: search "ChatGPT" → first result is ChatGPT
  [ ] E2E test: filter by pricing → only matching tools shown
```

---

## 6. TESTING STRATEGY

| Layer | Tool | Coverage Target | When Runs |
|-------|------|----------------|-----------|
| Unit | Vitest | searchTools(), useFilteredTools() | Every commit |
| Integration | Vitest | filter + search combined | PR |
| E2E | Playwright | search flow, filter flow, URL persistence | Pre-release |
| Performance | Manual | < 100ms search response | Pre-release |
| Security | — | Input sanitization verified | Pre-release |

---

## 7. API / INTERFACE CONTRACT

```
Hook: useToolFilters()
  Returns: { filters, setFilter, clearFilters, activeFilterCount }
  Notes: Writes directly to URL via setSearchParams

Hook: useFilteredTools(filters)
  Input: filter object from useToolFilters()
  Returns: Tool[]
  Notes: Does not apply text search — call searchTools() after

Function: searchTools(query: string, sourceTools: Tool[])
  Input: trimmed query string + pre-filtered tools array
  Returns: Tool[]  (Fuse.js ranked results)
  Notes: Returns sourceTools unchanged if query is empty
```

---

## 8. SECURITY CHECKLIST

- [x] Search input trimmed and capped at 200 chars before Fuse.js
- [x] URL params read with bounds checking — invalid values ignored
- [ ] Tag values from URL sanitized before use in navigation
- [x] No user query data logged or stored server-side

---

## 9. DOCUMENTATION STANDARDS

| Artifact | Location |
|----------|----------|
| Search logic | `src/lib/search.ts` |
| Filter state hook | `src/hooks/useToolFilters.ts` |
| Filter application | `src/hooks/useFilteredTools.ts` |

---

## 10. MILESTONES & RISKS

| Milestone | Target Date | Done? |
|-----------|-------------|-------|
| Basic search + filters | 2025 | [x] |
| URL-synced pagination | 2025 | [x] |
| Compliance filter | Q2 2026 | [ ] |
| Sort options | Q2 2026 | [ ] |

**Top Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Fuse.js slow at 2000+ tools | Low | Medium | Benchmark early, consider worker thread |
| URL manipulation causes bad state | Medium | Low | Bounds-check all param reads |

---

## 11. DEFINITION OF DONE

- [ ] Filter changes update the URL immediately
- [ ] Results match expected set for given filters
- [ ] Search input is sanitized before Fuse call
- [ ] No TS errors, lint passes
- [ ] Unit tests cover filter logic and search function
