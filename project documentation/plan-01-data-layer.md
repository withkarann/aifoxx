# PLAN-01 — Data Layer

---

## 1. PROJECT IDENTITY

```
Name:           AIFoxx — Data Layer
Type:           library (internal)
Primary Language: TypeScript
Runtime / Platform: Browser (Vite + React 18)
Owner / Team:   AIFoxx
Start Date:     2025
Target Release: Ongoing — stable
```

---

## 2. PROBLEM & GOALS

**Problem Statement**
The app needs to serve 1000+ AI tools to every page without a backend or database. Data must be typed, validated, and easy to query from any component.

**Success Criteria**
- [ ] All tools load and validate against the Zod schema with zero errors at startup
- [ ] Any page can query tools using `lib/` functions — zero direct JSON imports in components
- [ ] `npm run validate` passes with no duplicate slugs or missing required fields

**Out of Scope**
- Server-side data fetching or APIs
- CMS or admin tooling
- Real-time updates

---

## 3. ARCHITECTURE

**Pattern:** Static data module — pure functions over immutable JSON

**Layer Map:**
```
UI / Pages
    ↓
src/lib/tools.ts + skills.ts + search.ts  (query functions)
    ↓
src/types/tool.ts + skill.ts  (Zod schemas + TS types)
    ↓
src/data/*.json  (static files, read-only)
    ↓
No external database
```

**Key Design Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | No state — pure functions | Data never mutates at runtime |
| Auth strategy | None | Public read-only data |
| Data storage | Static JSON files in `src/data/` | No backend needed, Vercel CDN serves them |
| Caching | React Query (queryClient) | Prevents re-parsing large JSON on every render |
| Error handling | Zod parse with `safeParse`, log warnings | App stays alive even with bad records |

**External Dependencies / APIs:**
- `zod` — schema validation
- `fuse.js` — search index (built from tools array)
- `@tanstack/react-query` — query caching

---

## 4. DATA MODEL

```
Entity: Tool
  - id: string
  - name: string
  - slug: string           # URL-safe, unique
  - category: string
  - subcategory: string
  - description: string
  - url: string            # sensitive? no, public link
  - tags: string[]
  - pricing: enum          # Free | Freemium | Paid | Open Source | Usage Based | Contact Sales | Pay-as-you-go
  - logo_url?: string
  - featured?: boolean
  - status?: enum          # active | beta | sunset | acquired
  - last_verified?: string
  - compliance?: { soc2, iso27001, gdpr, hipaa: boolean | null }
  - data_storage?: { region, trains_on_data, self_hostable }
  - pricing_detail?: { free_tier, paid_plans, api_cost }
  - use_cases?: string[]
  - not_good_for?: string[]
  - industries?: string[]

Entity: Skill
  - id: string
  - name: string
  - slug: string
  - type: "mcp-server" | "claude-code-skill"
  - description: string
  - tags: string[]
  - github_url?: string
  - tool_slugs?: string[]  # links skill to tools
```

**Validation rules:**
- `name`, `category`, `subcategory`, `description`, `url`, `tags`, `pricing` are required on every tool
- Slugs must be unique across all tools
- `pricing` must match the allowed enum values
- `compliance` booleans can be `null` (unknown) — not just true/false

---

## 5. DEVELOPMENT LIFECYCLE

```
Phase 1 — Foundation  ✅
  [x] tools.json populated with 1000+ tools
  [x] Zod schema in src/types/tool.ts
  [x] src/lib/tools.ts — allTools, getToolBySlug(), getRelatedTools()
  [x] npm run validate script

Phase 2 — Core Features  ✅
  [x] src/lib/skills.ts — allSkills, allMcpServers, allClaudeCodeSkills
  [x] src/lib/search.ts — Fuse.js index over allTools
  [x] CATEGORIES taxonomy exported from lib/tools.ts

Phase 3 — Integration
  [ ] Add getToolsByCategory() helper for CategoryPage
  [ ] Add getToolsByTag() helper for TagPage
  [ ] Expose SKILL_COUNTS for nav badges

Phase 4 — Hardening
  [ ] Add CI step: run npm run validate on every PR
  [ ] Increase Zod strictness — warn on unknown fields
  [ ] Benchmark JSON parse time — target < 200ms

Phase 5 — Release
  [ ] Freeze schema on v1.0 tag
  [ ] Document any breaking schema changes in CHANGELOG.md
```

---

## 6. TESTING STRATEGY

| Layer | Tool | Coverage Target | When Runs |
|-------|------|----------------|-----------|
| Unit | Vitest | 100% of lib functions | Every commit |
| Integration | Vitest | tools.json loads + validates | PR |
| E2E | Playwright | homepage loads 12 tools | Pre-release |
| Performance | Manual / Vite build analysis | JSON parse < 200ms | Pre-release |
| Security | npm audit | 0 high/critical | Pre-release |

---

## 7. API / INTERFACE CONTRACT

```
Function: getToolBySlug(slug: string)
  Returns: Tool | undefined
  Notes: Returns undefined if slug not found — caller must handle 404

Function: getRelatedTools(slug: string, limit: number)
  Returns: Tool[]
  Notes: Same subcategory first, then same category. Never includes the source tool.

Function: searchTools(query: string, sourceTools: Tool[])
  Returns: Tool[]
  Notes: Fuse.js fuzzy match. Input trimmed + capped at 200 chars before calling.

Function: allTools
  Type: Tool[]  (readonly, validated at startup)
```

Versioning strategy: semver on the project — breaking schema changes = MAJOR bump

---

## 8. SECURITY CHECKLIST

- [x] No secrets in tools.json — all data is public
- [x] Slug inputs from URL validated via getToolBySlug before rendering
- [ ] npm audit clean on every PR
- [x] No user PII stored in data files
- [x] External tool URLs are not followed server-side — user clicks only

---

## 9. DOCUMENTATION STANDARDS

| Artifact | Location |
|----------|----------|
| Type definitions | `src/types/tool.ts`, `src/types/skill.ts` |
| Query functions | `src/lib/tools.ts`, `src/lib/skills.ts`, `src/lib/search.ts` |
| Validate script | `package.json` → `npm run validate` |

---

## 10. MILESTONES & RISKS

| Milestone | Target Date | Done? |
|-----------|-------------|-------|
| tools.json + Zod schema | 2025 | [x] |
| skills.ts + search.ts | 2025 | [x] |
| CI validate on PR | Q2 2026 | [ ] |
| Schema v1.0 freeze | v1.0 release | [ ] |

**Top Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| tools.json grows too large (>10MB) | Medium | High — slow initial load | Split by category or lazy-load |
| Duplicate slugs introduced | Low | High — broken tool pages | CI validate step blocks merge |

---

## 11. DEFINITION OF DONE

A data layer task is done when:
- [ ] `npm run validate` passes with zero errors
- [ ] Zod schema updated if new fields added
- [ ] Unit test covers the new lib function
- [ ] No direct `data/*.json` imports outside of `src/lib/`
- [ ] `npm run build` passes with zero TS errors
