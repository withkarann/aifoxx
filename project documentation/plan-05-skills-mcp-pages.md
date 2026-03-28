# PLAN-05 — Skills & MCP Servers Pages

---

## 1. PROJECT IDENTITY

```
Name:           AIFoxx — Skills & MCP Pages (/skills, /mcp)
Type:           web app pages
Primary Language: TypeScript + React
Runtime / Platform: Browser (Vite + React 18)
Owner / Team:   AIFoxx
Start Date:     Q1 2026
Target Release: Q2 2026 (PR #24 pending merge)
```

---

## 2. PROBLEM & GOALS

**Problem Statement**
Developers using Claude need a place to discover Claude Code skills and MCP servers in the same way AIFoxx surfaces AI tools — searchable, filterable, with source links and metadata.

**Success Criteria**
- [ ] `/skills` and `/mcp` pages load and display all skills/servers from their JSON files
- [ ] Search on each page is scoped — `/skills` only searches skills, `/mcp` only searches MCP servers
- [ ] PR #24 merges and both pages are live on production

**Out of Scope**
- Installing skills from the UI
- User ratings or reviews
- Editing skill data manually

---

## 3. ARCHITECTURE

**Pattern:** Same pattern as HomePage — static data, URL-based state, scoped search

**Layer Map:**
```
/skills or /mcp URL
    ↓
SkillsPage.tsx or McpServersPage.tsx
    ↓
allClaudeCodeSkills or allMcpServers from src/lib/skills.ts
    ↓
Scoped search (searchSkills / searchMcpServers)
    ↓
SkillCard grid + pagination
```

**Key Design Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | URL params (same as HomePage) | Consistent pattern across the app |
| Search scoping | Separate search functions per type | Skills and MCP servers have different fields |
| Data source | `src/data/claude-code-skills.json` + `mcp-servers.json` | Split from tools.json to keep concerns separate |
| Card style | Same card pattern as ToolCard | Visual consistency |
| GitHub link | Neon green glow on hover | Hacker-aesthetic, matches brand |

**External Dependencies / APIs:**
- `src/lib/skills.ts` — allClaudeCodeSkills, allMcpServers, searchSkills, searchMcpServers
- `react-router-dom` — URL state

---

## 4. DATA MODEL

```
Entity: Skill
  - id: string
  - name: string
  - slug: string
  - type: "claude-code-skill" | "mcp-server"
  - description: string
  - tags: string[]
  - github_url?: string
  - tool_slugs?: string[]   # links to tools in tools.json
  - author?: string
  - install_command?: string

Page state (URL params):
  - search: string
  - tag: string[]
  - page: number (default 1)
```

**Validation rules:**
- `name`, `slug`, `description`, `tags` required on every skill
- `type` must be one of the two allowed values
- `github_url` must be a valid URL if present

---

## 5. DEVELOPMENT LIFECYCLE

```
Phase 1 — Foundation  ✅
  [x] src/types/skill.ts — Skill type + Zod schema
  [x] claude-code-skills.json + mcp-servers.json data files
  [x] src/lib/skills.ts — allSkills, allMcpServers, allClaudeCodeSkills

Phase 2 — Core Features  ✅
  [x] SkillsPage.tsx — /skills route
  [x] McpServersPage.tsx — /mcp route
  [x] Scoped search functions
  [x] Pagination
  [x] GitHub link glow effect on cards
  [x] Routes added to App.tsx
  [x] Nav links added to NavBar

Phase 3 — Integration
  [ ] Merge PR #24 to main
  [ ] Add Skills section to ToolDetailPage (if tool_slugs match)
  [ ] Link from tool detail → related skills
  [ ] Add Like + Favorite buttons to SkillCard and McpServerCard (see plan-09)
  [ ] src/pages/SkillDetailPage.tsx — /skills/:slug route
  [ ] src/pages/McpDetailPage.tsx — /mcp/:slug route
  [ ] Add CommentSection to SkillDetailPage and McpDetailPage (see plan-09)
  [ ] Add new detail routes to App.tsx

Phase 4 — Hardening
  [ ] SEO meta tags on /skills, /mcp, /skills/:slug, /mcp/:slug pages
  [ ] Mobile layout verified
  [ ] Validate skills JSON on CI (no duplicate slugs)
  [ ] Skill/MCP detail pages return 404 for unknown slugs

Phase 5 — Release
  [ ] Verify on production after merge
  [ ] Monitor for any 404s on /skills or /mcp
```

---

## 6. TESTING STRATEGY

| Layer | Tool | Coverage Target | When Runs |
|-------|------|----------------|-----------|
| Unit | Vitest | searchSkills(), allMcpServers loads | Every commit |
| Integration | Vitest | SkillsPage renders items | PR |
| E2E | Playwright | /skills page loads, search works | Pre-release |
| Performance | Lighthouse | LCP < 2.5s | Pre-release |
| Security | npm audit | 0 high/critical | Pre-release |

---

## 7. API / INTERFACE CONTRACT

```
Function: allClaudeCodeSkills
  Type: Skill[]   (type === "claude-code-skill")

Function: allMcpServers
  Type: Skill[]   (type === "mcp-server")

Function: searchSkills(query: string)
  Returns: Skill[]  (Fuse over claude-code-skills only)

Function: searchMcpServers(query: string)
  Returns: Skill[]  (Fuse over mcp-servers only)

Function: getSkillsByToolSlug(slug: string)
  Returns: Skill[]  (all skills where tool_slugs includes slug)
```

---

## 8. SECURITY CHECKLIST

- [x] github_url values are static data — not user-supplied
- [x] No user input rendered on these pages (read-only)
- [ ] Search input sanitized before Fuse call (same as tools search)
- [ ] npm audit clean before merge

---

## 9. DOCUMENTATION STANDARDS

| Artifact | Location |
|----------|----------|
| Skills lib | `src/lib/skills.ts` |
| Skill type | `src/types/skill.ts` |
| Pages | `src/pages/SkillsPage.tsx`, `src/pages/McpServersPage.tsx` |
| Data | `src/data/claude-code-skills.json`, `src/data/mcp-servers.json` |

---

## 10. MILESTONES & RISKS

| Milestone | Target Date | Done? |
|-----------|-------------|-------|
| Data + types | Q1 2026 | [x] |
| Both pages built | Q1 2026 | [x] |
| PR #24 merged | Q2 2026 | [ ] |
| ToolDetailPage integration | Q2 2026 | [ ] |
| Like + Favorite buttons on cards | Q2 2026 | [ ] |
| SkillDetailPage + McpDetailPage | Q2 2026 | [ ] |
| Comments on detail pages | Q2 2026 | [ ] |

**Top Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| PR #24 merge conflicts | Medium | Medium | Rebase on main before merge |
| skills JSON grows stale | Medium | Low | Add last_verified field to schema |

---

## 11. DEFINITION OF DONE

- [ ] Both pages render all items from their JSON files
- [ ] Search is scoped per page type
- [ ] SEO meta tags set
- [ ] PR #24 merged and live on production
- [ ] No lint or TS errors
