# PLAN-06 — User Profiles & Account System

---

## 1. PROJECT IDENTITY

```
Name:           AIFoxx — User Profiles
Type:           web app feature
Primary Language: TypeScript + React
Runtime / Platform: Browser (Vite + React 18, localStorage)
Owner / Team:   AIFoxx
Start Date:     Q2 2026
Target Release: Q2 2026
```

---

## 2. PROBLEM & GOALS

**Problem Statement**
Users visit AIFoxx repeatedly but have no way to save tools they care about or remember what they've looked at. A local profile lets users personalize their experience without needing a backend or login.

**Success Criteria**
- [ ] User can favorite a tool, skill, or MCP server and see it on `/profile` across browser sessions
- [ ] User can like a tool, skill, or MCP server — like state persists in localStorage
- [ ] View history of last 20 tools persists across refreshes
- [ ] Display name and avatar color persist in localStorage
- [ ] Profile page renders correctly with empty favorites (zero state)
- [ ] ProfilePage shows favorited tools, favorited skills, and favorited MCP servers in separate tabs/sections

**Out of Scope**
- Server-side accounts or login
- Syncing across devices
- Social features (following, sharing profiles)
- Settings beyond name and avatar color

---

## 3. ARCHITECTURE

**Pattern:** Context + localStorage — mirrors ThemeContext exactly

**Layer Map:**
```
ProfilePage / NavBar / ToolCard / ToolDetailPage
    ↓
useUserProfile() hook
    ↓
UserContext (React context)
    ↓
localStorage ("aifoxx-user" key)
    ↓
No external storage — browser only
```

**Key Design Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | React context + localStorage | Same proven pattern as ThemeContext |
| Auth strategy | None — local-only profiles | No backend, no server needed |
| Data storage | localStorage key `aifoxx-user` | Persists across sessions, no signup friction |
| Caching | React state (in-memory) | Reads localStorage once on init |
| Error handling | Corrupt localStorage → reset to default profile | App never crashes on bad stored data |

**External Dependencies / APIs:**
- None — pure React + browser localStorage

---

## 4. DATA MODEL

```
Entity: UserProfile (stored in localStorage as JSON)
  - displayName: string               # default: "Guest"
  - avatarColor: string               # hex, random from palette on first load
  - favorites: {
      tools: string[]                 # tool slugs favorited
      skills: string[]                # skill slugs favorited
      mcpServers: string[]            # MCP server slugs favorited
    }
  - likes: {
      tools: string[]                 # tool slugs liked
      skills: string[]                # skill slugs liked
      mcpServers: string[]            # MCP server slugs liked
    }
  - viewHistory: string[]             # last 20 tool slugs viewed, newest first, no duplicates
  - createdAt: string                 # ISO date string

localStorage key: "aifoxx-user"
Avatar color palette (8 options, random pick on creation):
  #22c55e, #3b82f6, #a855f7, #f59e0b, #ef4444, #06b6d4, #ec4899, #84cc16
```

**Validation rules:**
- `displayName` trimmed, max 40 chars
- `viewHistory` capped at 20 entries — oldest removed when limit reached
- Corrupt/missing localStorage → silently reset to default profile
- Favorite/like toggle: add if not present, remove if already present
- Migration: if old `favoriteSlugs: string[]` shape is detected in localStorage, convert to `favorites.tools` on read

---

## 5. DEVELOPMENT LIFECYCLE

```
Phase 1 — Foundation
  [ ] src/types/user.ts — UserProfile type + createDefaultProfile()
  [ ] src/contexts/UserContext.tsx — provider + localStorage sync
  [ ] src/hooks/useUserProfile.ts — convenience hook
  [ ] src/main.tsx — wrap app in UserProvider

Phase 2 — Core Features
  [ ] Favorite + Like buttons on ToolCard (Bookmark + ThumbsUp icons, toggles on click)
  [ ] Favorite + Like buttons on SkillCard
  [ ] Favorite + Like buttons on McpServerCard
  [ ] trackView(slug) called on ToolDetailPage mount
  [ ] src/pages/ProfilePage.tsx — /profile route
  [ ] /profile route added to App.tsx

Phase 3 — Integration & UX
  [ ] NavBar avatar pill — links to /profile, shows favorite count badge
  [ ] ProfilePage: tabbed favorites — Tools / Skills / MCP Servers
  [ ] ProfilePage: recent history list (last 10 tools)
  [ ] ProfilePage: stats (total favorites across all types, total viewed)
  [ ] Editable display name (inline input on profile page)

Phase 4 — Hardening
  [ ] Test localStorage corruption recovery
  [ ] Mobile layout at 375px and 768px
  [ ] Keyboard accessibility — heart button focusable, Enter toggles

Phase 5 — Release
  [ ] npm run lint + build pass clean
  [ ] Manual E2E: favorite → profile → unfavorite → gone
  [ ] SEO meta on /profile page
```

---

## 6. TESTING STRATEGY

| Layer | Tool | Coverage Target | When Runs |
|-------|------|----------------|-----------|
| Unit | Vitest | toggleFavorite, trackView, createDefaultProfile | Every commit |
| Integration | Vitest | UserContext localStorage read/write | PR |
| E2E | Playwright | Favorite flow, profile page render | Pre-release |
| Performance | — | Context re-renders minimal | Pre-release |
| Security | — | No PII stored, no external calls | Pre-release |

---

## 7. API / INTERFACE CONTRACT

```
Context value exposed by UserContext:
  - profile: UserProfile
  - toggleFavorite(slug: string, type: "tool" | "skill" | "mcp-server"): void
  - toggleLike(slug: string, type: "tool" | "skill" | "mcp-server"): void
  - isFavorited(slug: string, type: "tool" | "skill" | "mcp-server"): boolean
  - isLiked(slug: string, type: "tool" | "skill" | "mcp-server"): boolean
  - trackView(slug: string): void
  - updateName(name: string): void

Hook: useUserProfile()
  Returns: UserContext value
  Throws: if called outside UserProvider

Component: ProfilePage  (route: /profile)
  No props — reads from useUserProfile()
  Sections:
    - Header: avatar + editable display name
    - Favorites tabs: Tools | Skills | MCP Servers
    - Recent history: last 10 viewed tools
    - Stats: total favorites (all types), total viewed

ToolCard / SkillCard / McpServerCard modification:
  - Bookmark button: onClick stops propagation, calls toggleFavorite(slug, type)
  - ThumbsUp button: onClick stops propagation, calls toggleLike(slug, type)
  - Filled icons when item is favorited/liked
```

---

## 8. SECURITY CHECKLIST

- [x] No PII collected — displayName is user-chosen, not linked to identity
- [x] No external API calls — all local
- [x] No secrets stored in profile
- [ ] localStorage data never sent to any server
- [ ] displayName sanitized (trimmed, length-capped) before storing

---

## 9. DOCUMENTATION STANDARDS

| Artifact | Location |
|----------|----------|
| User type | `src/types/user.ts` |
| Context | `src/contexts/UserContext.tsx` |
| Hook | `src/hooks/useUserProfile.ts` |
| Profile page | `src/pages/ProfilePage.tsx` |
| Feature plan | `project documentation/changes.md` |

---

## 10. MILESTONES & RISKS

| Milestone | Target Date | Done? |
|-----------|-------------|-------|
| UserContext + localStorage | Q2 2026 | [ ] |
| Favorite button on ToolCard | Q2 2026 | [ ] |
| Profile page | Q2 2026 | [ ] |
| NavBar avatar pill | Q2 2026 | [ ] |

**Top Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| localStorage unavailable (private mode) | Low | Medium | Wrap in try/catch, fall back to in-memory |
| Profile data grows too large | Low | Low | History capped at 20, favorites are just slugs |
| Heart button breaks card link | Medium | High | stopPropagation() on button click |

---

## 11. DEFINITION OF DONE

- [ ] Favorite persists after page refresh
- [ ] View history updates on each tool detail visit
- [ ] Profile page shows correct data with empty state handled
- [ ] NavBar avatar links to /profile
- [ ] Mobile layout passes at 375px
- [ ] `npm run build` and `npm run lint` pass clean
