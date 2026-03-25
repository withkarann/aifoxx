# Plan: User Profiles for AIFoxx

## Context
AIFoxx is a static SPA with no backend or auth. "User profiles" means local-only personalization stored in localStorage — no login, no server. The goal is to let users save favorite tools, set a display name, and view their activity — all persisted in the browser.

---

## Scope

**What we're building:**
1. `UserProfile` type + localStorage persistence
2. `UserContext` + `useUserProfile()` hook (mirrors the ThemeContext pattern)
3. `/profile` page — shows user info, favorited tools, view history
4. Favorite button on `ToolCard` (heart icon toggle)
5. NavBar avatar pill linking to `/profile`

**What we're NOT building:**
- Auth / login / server sync
- Social features
- Settings beyond name + avatar color

---

## Data Shape

```typescript
// src/types/user.ts
type UserProfile = {
  displayName: string;          // default: "Guest"
  avatarColor: string;          // hex, randomly picked on first load
  favoriteSlugs: string[];      // tool slugs user has favorited
  viewHistory: string[];        // last 20 tool slugs viewed (most recent first)
  createdAt: string;            // ISO date string
}
```

localStorage key: `aifoxx-user`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/types/user.ts` | UserProfile type |
| `src/contexts/UserContext.tsx` | Context + provider + localStorage sync |
| `src/hooks/useUserProfile.ts` | Convenience hook (mirrors `useTheme()`) |
| `src/pages/ProfilePage.tsx` | `/profile` route |

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/profile` route |
| `src/main.tsx` | Wrap app in `UserProvider` |
| `src/components/layout/NavBar.tsx` | Add avatar pill + profile link |
| `src/components/tools/ToolCard.tsx` | Add favorite heart button |
| `src/pages/ToolDetailPage.tsx` | Track view in history on mount |

---

## Implementation Steps

### 1. `src/types/user.ts`
Define `UserProfile` type. Export default profile factory function.

### 2. `src/contexts/UserContext.tsx`
- Initialize from `localStorage.getItem('aifoxx-user')` or create default
- Expose: `profile`, `toggleFavorite(slug)`, `trackView(slug)`, `updateName(name)`
- Sync to localStorage on every state change via `useEffect`
- Random avatar color from a fixed palette on first creation

### 3. `src/hooks/useUserProfile.ts`
```typescript
export const useUserProfile = () => useContext(UserContext);
```

### 4. `src/main.tsx`
Add `UserProvider` inside `QueryClientProvider`, wrapping `ThemeProvider`.

### 5. `src/components/tools/ToolCard.tsx`
- Import `useUserProfile`
- Add heart icon button (Lucide `Heart`) in card top-right
- Filled = favorited, outline = not — toggle on click
- Stop event propagation so card link still works

### 6. `src/pages/ToolDetailPage.tsx`
- Call `trackView(slug)` in a `useEffect` on mount
- History capped at 20, newest first, no duplicates

### 7. `src/pages/ProfilePage.tsx`
Sections:
- **Header:** avatar circle (initials + color) + editable display name (inline input)
- **Favorites:** grid of ToolCards for `favoriteSlugs` (empty state if none)
- **Recent:** list of last 10 viewed tools with name + category
- **Stats:** total favorites count, total tools viewed

### 8. `src/components/layout/NavBar.tsx`
- Right side: add avatar pill (colored circle + first letter of name)
- Links to `/profile`
- Shows favorite count badge if > 0

### 9. `src/App.tsx`
```tsx
<Route path="/profile" element={<ProfilePage />} />
```

---

## Reuse Existing Patterns

- `ThemeContext.tsx` — exact same localStorage + useEffect pattern to follow
- `useTheme()` — mirrors the hook pattern for `useUserProfile()`
- `ToolCard` component — reuse directly in ProfilePage favorites grid
- `getToolBySlug()` from `src/lib/tools.ts` — resolve slugs to Tool objects in ProfilePage

---

## Verification

```bash
npm run lint        # must pass clean
npm run build       # no TS errors
npm run test        # existing tests still pass
```

Manual checks:
- Favorite a tool on homepage → go to `/profile` → see it in favorites
- Visit a tool detail page → `/profile` → appears in recent history
- Edit display name → refreshes page → name persists
- Unfavorite → removed from profile grid
- Mobile layout at 768px — avatar pill and heart button accessible
