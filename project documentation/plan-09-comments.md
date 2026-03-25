# PLAN-09 — Comments, Likes & Favorites (All Entity Types)

---

## 1. PROJECT IDENTITY

```
Name:           AIFoxx — Comments, Likes & Favorites
Type:           web app feature set
Primary Language: TypeScript + React
Runtime / Platform: Browser (Vite + React 18, localStorage)
Owner / Team:   AIFoxx
Start Date:     Q2 2026
Target Release: Q2 2026
```

---

## 2. PROBLEM & GOALS

**Problem Statement**
Users can browse tools, skills, and MCP servers but have no way to engage with them — no comments, no likes, no saves beyond a basic favorite. Adding likes, favorites, and comments (all local-first via localStorage) increases engagement and personal utility without requiring a backend.

**Success Criteria**
- [ ] Like button on every ToolCard, SkillCard, and MCP ServerCard — toggles filled/outline, persists in localStorage
- [ ] Favorite (bookmark) button on every card — persists in localStorage, visible on `/profile`
- [ ] Comments section on ToolDetailPage, SkillDetailPage, McpDetailPage
- [ ] Comments persist per entity across page refreshes
- [ ] New detail pages: `/skills/:slug` and `/mcp/:slug`

**Out of Scope**
- Server-side comment storage or moderation
- Comments visible to other users (local only)
- Comment voting, replies, or threading
- Real-time updates or notifications

---

## 3. ARCHITECTURE

**Pattern:** Context + localStorage — same as UserContext and ThemeContext

**Layer Map:**
```
ToolDetailPage / SkillDetailPage / McpDetailPage
    ↓
CommentSection component
    ↓
useComments() hook
    ↓
CommentsContext
    ↓
localStorage ("aifoxx-comments" key)

ToolCard / SkillCard / McpServerCard
    ↓
useUserProfile() hook
    ↓
UserContext (extended with likes + per-type favorites)
    ↓
localStorage ("aifoxx-user" key)
```

**Key Design Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Comment storage | localStorage per entity type+slug | Simple, no backend, mirrors user profile pattern |
| Like vs Favorite | Separate actions | Like = quick signal; Favorite = save to profile page |
| Skill/MCP detail pages | New `/skills/:slug` and `/mcp/:slug` routes | Comments need a dedicated page; improves SEO too |
| Author name on comments | Uses `profile.displayName` from UserContext | No extra input required if name is already set |
| Comment IDs | `crypto.randomUUID()` | Unique without a server |

**External Dependencies / APIs:**
- None — pure React + browser localStorage

---

## 4. DATA MODEL

```
Entity: Comment (stored in localStorage as JSON)
  - id: string                         # crypto.randomUUID()
  - entitySlug: string                 # slug of the tool/skill/MCP server
  - entityType: "tool" | "skill" | "mcp-server"
  - authorName: string                 # from UserProfile.displayName
  - body: string                       # max 500 chars, trimmed
  - createdAt: string                  # ISO date string

localStorage key: "aifoxx-comments"
Storage shape: Record<string, Comment[]>
  key format: "{entityType}:{entitySlug}"  (e.g. "tool:chatgpt", "mcp-server:filesystem")

Entity: UserProfile (extended — see also plan-06)
  - favorites.tools: string[]          # tool slugs
  - favorites.skills: string[]         # skill slugs
  - favorites.mcpServers: string[]     # MCP server slugs
  - likes.tools: string[]              # liked tool slugs
  - likes.skills: string[]             # liked skill slugs
  - likes.mcpServers: string[]         # liked MCP server slugs
```

**Validation rules:**
- `body` trimmed, min 1 char, max 500 chars — reject empty or whitespace-only
- `authorName` falls back to "Anonymous" if displayName is empty
- `entityType` must be one of the three allowed values
- Corrupt localStorage → silently reset to empty comments map

---

## 5. DEVELOPMENT LIFECYCLE

```
Phase 1 — Foundation
  [ ] Extend UserProfile type in src/types/user.ts
      - favorites: { tools, skills, mcpServers }
      - likes: { tools, skills, mcpServers }
  [ ] Extend UserContext with toggleLike(slug, type) + toggleFavorite(slug, type)
  [ ] src/types/comment.ts — Comment type + Zod schema
  [ ] src/contexts/CommentsContext.tsx — provider + localStorage sync
  [ ] src/hooks/useComments.ts — convenience hook

Phase 2 — Core Features
  [ ] Like button on ToolCard (Thumbs Up icon, outline/filled toggle)
  [ ] Favorite button on ToolCard (Bookmark icon, outline/filled toggle)
  [ ] Like + Favorite buttons on SkillCard
  [ ] Like + Favorite buttons on McpServerCard
  [ ] src/components/comments/CommentSection.tsx — shared component
  [ ] src/components/comments/CommentForm.tsx — author + body + submit
  [ ] src/components/comments/CommentList.tsx — renders list of comments

Phase 3 — Integration
  [ ] Add CommentSection to ToolDetailPage (bottom of page)
  [ ] src/pages/SkillDetailPage.tsx — /skills/:slug route
  [ ] src/pages/McpDetailPage.tsx — /mcp/:slug route
  [ ] Add SkillDetailPage and McpDetailPage routes to App.tsx
  [ ] Add CommentSection to SkillDetailPage and McpDetailPage
  [ ] Update ProfilePage to show favorited skills and MCP servers

Phase 4 — Hardening
  [ ] Test comment form with empty input (blocked), long input (capped)
  [ ] Test localStorage corruption recovery for comments
  [ ] Mobile layout at 375px for CommentSection and detail pages
  [ ] Keyboard accessibility — like/fav buttons focusable, Enter toggles

Phase 5 — Release
  [ ] SEO meta on /skills/:slug and /mcp/:slug pages
  [ ] npm run lint + build pass clean
  [ ] Manual E2E: comment → refresh → comment still there
  [ ] Manual E2E: like → profile → unlike → count updates
```

---

## 6. TESTING STRATEGY

| Layer | Tool | Coverage Target | When Runs |
|-------|------|----------------|-----------|
| Unit | Vitest | toggleLike, toggleFavorite, addComment, deleteComment | Every commit |
| Integration | Vitest | CommentsContext localStorage read/write | PR |
| Integration | Vitest | UserContext extended favorites/likes | PR |
| E2E | Playwright | Comment flow, like toggle, favorite → profile | Pre-release |
| Security | — | Comment body sanitized, no HTML injection | Pre-release |

---

## 7. API / INTERFACE CONTRACT

```
Extended UserContext value:
  - toggleFavorite(slug: string, type: "tool" | "skill" | "mcp-server"): void
  - toggleLike(slug: string, type: "tool" | "skill" | "mcp-server"): void
  - isFavorited(slug: string, type: "tool" | "skill" | "mcp-server"): boolean
  - isLiked(slug: string, type: "tool" | "skill" | "mcp-server"): boolean

CommentsContext value:
  - getComments(entitySlug: string, entityType: string): Comment[]
  - addComment(entitySlug: string, entityType: string, body: string): void
  - deleteComment(id: string): void

Component: CommentSection
  Props: { entitySlug: string; entityType: "tool" | "skill" | "mcp-server" }
  Reads: useComments() + useUserProfile() for author name

Component: LikeButton
  Props: { slug: string; type: "tool" | "skill" | "mcp-server" }

Component: FavoriteButton
  Props: { slug: string; type: "tool" | "skill" | "mcp-server" }

Route: /skills/:slug → SkillDetailPage
  - Reads slug from useParams()
  - Looks up skill from allClaudeCodeSkills
  - Renders detail + CommentSection + LikeButton + FavoriteButton

Route: /mcp/:slug → McpDetailPage
  - Same pattern as SkillDetailPage
```

---

## 8. SECURITY CHECKLIST

- [ ] Comment body sanitized — plain text only, no HTML (use textContent not innerHTML)
- [ ] `body` trimmed + length-capped to 500 chars before storing
- [ ] `authorName` trimmed + length-capped (inherits from UserProfile validation)
- [ ] Corrupt localStorage handled gracefully — reset to empty, no crash
- [ ] No external API calls — all local
- [ ] Entity slugs validated before rendering detail pages (return 404 for unknown)

---

## 9. DOCUMENTATION STANDARDS

| Artifact | Location |
|----------|----------|
| Comment type | `src/types/comment.ts` |
| Comments context | `src/contexts/CommentsContext.tsx` |
| Comments hook | `src/hooks/useComments.ts` |
| Comment components | `src/components/comments/` |
| Like/Fav buttons | `src/components/ui/LikeButton.tsx`, `FavoriteButton.tsx` |
| Skill detail page | `src/pages/SkillDetailPage.tsx` |
| MCP detail page | `src/pages/McpDetailPage.tsx` |
| Feature plan | `project documentation/plan-09-comments.md` |

---

## 10. MILESTONES & RISKS

| Milestone | Target Date | Done? |
|-----------|-------------|-------|
| Extended UserProfile type + context | Q2 2026 | [ ] |
| Like + Favorite buttons on all cards | Q2 2026 | [ ] |
| CommentSection component | Q2 2026 | [ ] |
| SkillDetailPage + McpDetailPage | Q2 2026 | [ ] |
| ProfilePage shows skills/MCP favorites | Q2 2026 | [ ] |

**Top Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| localStorage grows large with many comments | Low | Low | Cap at 50 comments per entity |
| Like/Fav button click triggers card navigation | Medium | High | stopPropagation() on button click |
| UserProfile type change breaks existing stored data | Medium | Medium | Migration: if old shape detected, convert on read |
| Comment body XSS if rendered as HTML | Low | High | Render body as plain text only |

---

## 11. DEFINITION OF DONE

- [ ] Like and favorite buttons work on ToolCard, SkillCard, McpServerCard
- [ ] State persists after page refresh
- [ ] ProfilePage shows favorited tools, skills, and MCP servers
- [ ] Comments visible on ToolDetailPage, SkillDetailPage, McpDetailPage
- [ ] Comment persists after page refresh
- [ ] Empty state handled for zero comments
- [ ] Mobile layout passes at 375px
- [ ] `npm run build` and `npm run lint` pass clean
