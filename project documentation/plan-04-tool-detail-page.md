# PLAN-04 — Tool Detail Page

---

## 1. PROJECT IDENTITY

```
Name:           AIFoxx — Tool Detail Page (/ai/:slug)
Type:           web app page
Primary Language: TypeScript + React
Runtime / Platform: Browser (Vite + React 18)
Owner / Team:   AIFoxx
Start Date:     2025
Target Release: Ongoing
```

---

## 2. PROBLEM & GOALS

**Problem Statement**
When a user clicks a tool, they need a full information page — compliance status, pricing details, use cases, data storage policy, and related tools — all in one place without leaving the site.

**Success Criteria**
- [ ] Every tool slug resolves to a page or returns a clear 404
- [ ] Compliance, pricing, and data storage sections render correctly for both known and unknown (`null`) values
- [ ] Related tools section shows 3 tools from the same subcategory/category

**Out of Scope**
- User reviews or ratings
- Editing tool data from the UI
- Real-time tool status checks

---

## 3. ARCHITECTURE

**Pattern:** Static detail page — slug from URL → lookup → render

**Layer Map:**
```
/ai/:slug URL
    ↓
useParams() → slug
    ↓
getToolBySlug(slug) from src/lib/tools.ts
    ↓
Tool object → rendered sections
    ↓
getRelatedTools() + getSkillsByToolSlug()
```

**Key Design Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| 404 handling | Return undefined from getToolBySlug → render error UI | No redirect needed |
| Compliance display | Three-state badge (✓ / ✗ / ?) | `null` = unknown, shown as ? |
| Related tools | Same subcategory first, then category | Most relevant shown first |
| Claude Skills | Section rendered only if skills exist for slug | Avoids empty sections |
| SEO | PageMeta with tool name + description | Each tool page is indexable |

**External Dependencies / APIs:**
- `react-router-dom` — useParams, Link
- `src/lib/tools.ts` — getToolBySlug, getRelatedTools
- `src/lib/skills.ts` — getSkillsByToolSlug

---

## 4. DATA MODEL

```
Page inputs:
  - slug: string   (from URL params)

Derived:
  - tool: Tool | undefined
  - related: Tool[]    (max 3)
  - skills: Skill[]    (may be empty)

Displayed sections (conditional on data):
  - compliance: tool.compliance (soc2, iso27001, gdpr, hipaa)
  - data_storage: tool.data_storage (region, trains_on_data, self_hostable)
  - pricing_detail: tool.pricing_detail (free_tier, paid_plans, api_cost)
  - use_cases: tool.use_cases[]
  - not_good_for: tool.not_good_for[]
  - industries: tool.industries[]
```

**Validation rules:**
- If `getToolBySlug(slug)` returns undefined → render 404 UI, do not crash
- Compliance fields can be `boolean | null` — null renders as "?" badge
- Skills section only renders if `skills.length > 0`

---

## 5. DEVELOPMENT LIFECYCLE

```
Phase 1 — Foundation  ✅
  [x] Route /ai/:slug wired in App.tsx
  [x] getToolBySlug() + 404 fallback
  [x] Basic tool header (name, logo, pricing badge)

Phase 2 — Core Features  ✅
  [x] Compliance badges (three-state)
  [x] Data storage section
  [x] Pricing detail section
  [x] Use cases + not_good_for lists
  [x] Tags with click-to-filter navigation
  [x] Related tools carousel (3 cards)
  [x] Claude Skills section (conditional)
  [x] External link with glow hover

Phase 3 — Integration  (next up)
  [ ] Track view in user history — call trackView(slug) on mount
  [ ] Add Favorite + Like buttons to tool header (see plan-06, plan-09)
  [ ] Breadcrumb links (Home > Category > Tool)
  [ ] Add CommentSection component at bottom of page (see plan-09)

Phase 4 — Hardening
  [ ] Verify all 1000+ slugs resolve correctly
  [ ] Test 404 page for unknown slugs
  [ ] Check mobile layout at 375px

Phase 5 — Release
  [ ] SEO: unique <title> and <meta description> per tool
  [ ] Verify og:image / social share tags
  [ ] Lighthouse score ≥ 85
```

---

## 6. TESTING STRATEGY

| Layer | Tool | Coverage Target | When Runs |
|-------|------|----------------|-----------|
| Unit | Vitest | getToolBySlug, getRelatedTools | Every commit |
| Integration | Vitest | Page renders for known + unknown slug | PR |
| E2E | Playwright | Visit /ai/chatgpt → sections visible | Pre-release |
| Performance | Lighthouse | LCP < 2.5s | Pre-release |
| Security | — | Slug from URL validated before render | Pre-release |

---

## 7. API / INTERFACE CONTRACT

```
Function: getToolBySlug(slug: string)
  Returns: Tool | undefined
  Caller must handle undefined (show 404 UI)

Function: getRelatedTools(slug: string, limit: number)
  Returns: Tool[]  (same subcategory first, then category)

Function: getSkillsByToolSlug(slug: string)
  Returns: Skill[]  (empty array if none)

Component: ComplianceBadge
  Props: { value: boolean | null | undefined }
  Renders: green ✓ / red ✗ / dashed ?
```

---

## 8. SECURITY CHECKLIST

- [x] Slug from URL validated via getToolBySlug before rendering
- [x] Tool URL (external link) opened in new tab with rel="noopener noreferrer"
- [x] No user input rendered on this page (read-only)
- [ ] Verify no XSS risk from tool description rendering (plain text, not HTML)

---

## 9. DOCUMENTATION STANDARDS

| Artifact | Location |
|----------|----------|
| Page component | `src/pages/ToolDetailPage.tsx` |
| Lookup functions | `src/lib/tools.ts` |
| Skills lookup | `src/lib/skills.ts` |

---

## 10. MILESTONES & RISKS

| Milestone | Target Date | Done? |
|-----------|-------------|-------|
| Core detail page | 2025 | [x] |
| Claude Skills section | Q1 2026 | [x] |
| View history tracking | Q2 2026 | [ ] |
| Favorite + Like buttons | Q2 2026 | [ ] |
| Comments section | Q2 2026 | [ ] |

**Top Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Slug collision after tools.json update | Low | High | CI validate blocks duplicates |
| Missing optional fields crash render | Low | Medium | All optional fields conditionally rendered |

---

## 11. DEFINITION OF DONE

- [ ] Tool page renders for any valid slug
- [ ] 404 UI shown for unknown slugs
- [ ] All conditional sections tested with missing data
- [ ] SEO meta tags set per page
- [ ] `npm run build` and lint pass clean
