# PLAN-07 — Navigation & Layout

---

## 1. PROJECT IDENTITY

```
Name:           AIFoxx — Navigation & Layout
Type:           web app component system
Primary Language: TypeScript + React
Runtime / Platform: Browser (Vite + React 18)
Owner / Team:   AIFoxx
Start Date:     2025
Target Release: Ongoing
```

---

## 2. PROBLEM & GOALS

**Problem Statement**
Every page needs a consistent shell — header with nav, a category sidebar on desktop, and a footer. Navigation must be accessible, responsive, and reflect the active route.

**Success Criteria**
- [ ] NavBar renders correctly at all breakpoints (320px to 1440px)
- [ ] Mobile hamburger menu opens the category sidebar as a Sheet
- [ ] Active route is visually highlighted in NavBar links

**Out of Scope**
- Mega-menus or dropdown nav
- Animated page transitions
- Floating action buttons

---

## 3. ARCHITECTURE

**Pattern:** Shell layout — RootLayout wraps all routes

**Layer Map:**
```
RootLayout
    ├── NavBar (sticky header)
    │     ├── Logo + brand name
    │     ├── Mobile hamburger → Sheet → Sidebar
    │     ├── Language selector (i18n)
    │     ├── Theme toggle
    │     ├── SKILLS link
    │     ├── SUBMIT link
    │     └── [planned] Avatar pill → /profile
    ├── main (page content / route outlet)
    └── Footer + CRTOverlay
```

**Key Design Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | useLocation() for active route | No extra state needed |
| Mobile nav | Shadcn Sheet component | Accessible slide-in drawer |
| Theme toggle | Cycles dark → light → notebook | Three themes, one button |
| Language | react-i18next Select in NavBar | 7 languages, dropdown |
| Sticky header | z-40, sticky top-0 | Stays visible while scrolling |

**External Dependencies / APIs:**
- `react-router-dom` — useLocation, Link
- `react-i18next` — useTranslation, i18n.changeLanguage
- Shadcn Sheet — mobile drawer
- Lucide icons — Moon, Sun, BookOpen, Menu

---

## 4. DATA MODEL

```
NavBar state:
  - mobileOpen: boolean   (Sheet open/close)
  - pathname: string      (from useLocation)
  - theme: Theme          (from useTheme)
  - i18n.language: string (from react-i18next)

Planned additions:
  - profile.displayName: string    (from useUserProfile)
  - profile.avatarColor: string
  - profile.favoriteSlugs.length: number  (badge count)

Route active states:
  - /skills → SKILLS link highlighted
  - /submit → SUBMIT link highlighted
  - /profile → avatar pill highlighted (planned)
```

**Validation rules:**
- Language code must be one of 7 supported codes before calling i18n.changeLanguage
- No rendering of user-provided strings in NavBar except displayName (trimmed)

---

## 5. DEVELOPMENT LIFECYCLE

```
Phase 1 — Foundation  ✅
  [x] RootLayout wrapping all routes
  [x] NavBar with logo, theme toggle
  [x] Footer

Phase 2 — Core Features  ✅
  [x] Mobile Sheet + Sidebar
  [x] SKILLS and SUBMIT nav links
  [x] Active route highlighting via useLocation
  [x] Language selector (7 languages)
  [x] CRTOverlay effect in Footer

Phase 3 — Integration  (next)
  [ ] Avatar pill → /profile link (from User Profiles feature)
  [ ] Favorite count badge on avatar
  [ ] Add /profile active state to highlight avatar

Phase 4 — Hardening
  [ ] Keyboard navigation through NavBar — all interactive elements focusable
  [ ] Screen reader test — aria-labels on icon buttons
  [ ] Test Sheet on iOS Safari (touch events)

Phase 5 — Release
  [ ] No layout shift on theme change
  [ ] NavBar height consistent across all themes
  [ ] Verify sticky header doesn't overlap content on all pages
```

---

## 6. TESTING STRATEGY

| Layer | Tool | Coverage Target | When Runs |
|-------|------|----------------|-----------|
| Unit | Vitest | — (pure UI, minimal logic) | — |
| Integration | Vitest | NavBar renders without crash | PR |
| E2E | Playwright | Mobile menu opens, nav links work | Pre-release |
| Accessibility | Manual / axe | All nav items keyboard accessible | Pre-release |
| Visual | Manual | 375px, 768px, 1280px | Pre-release |

---

## 7. API / INTERFACE CONTRACT

```
Component: NavBar
  No props — reads from useTheme(), useTranslation(), useLocation()
  Planned: reads from useUserProfile() for avatar pill

Component: RootLayout
  Props: { children: ReactNode }
  Renders: NavBar + children + Footer

Component: Sidebar
  Props: { onMobileClose?: () => void }
  Renders: Category list with links

Component: Footer
  No props — static content + CRTOverlay
```

---

## 8. SECURITY CHECKLIST

- [x] No user input rendered in NavBar (current state)
- [ ] displayName from profile trimmed before rendering in avatar pill
- [x] External links in Footer use rel="noopener noreferrer"
- [x] Language code validated before i18n.changeLanguage call

---

## 9. DOCUMENTATION STANDARDS

| Artifact | Location |
|----------|----------|
| NavBar | `src/components/layout/NavBar.tsx` |
| RootLayout | `src/components/layout/RootLayout.tsx` |
| Sidebar | `src/components/layout/Sidebar.tsx` |
| Footer | `src/components/layout/Footer.tsx` |

---

## 10. MILESTONES & RISKS

| Milestone | Target Date | Done? |
|-----------|-------------|-------|
| Base layout + NavBar | 2025 | [x] |
| i18n language selector | Q1 2026 | [x] |
| Avatar pill (User Profiles) | Q2 2026 | [ ] |

**Top Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Mobile Sheet broken on Safari | Medium | Medium | Test on real iOS device |
| NavBar height changes break page layout | Low | Medium | Fix NavBar height in CSS variable |

---

## 11. DEFINITION OF DONE

- [ ] NavBar renders on all pages without errors
- [ ] Mobile menu opens and closes correctly
- [ ] Active route highlighted in nav
- [ ] All nav buttons have aria-labels
- [ ] `npm run build` and lint pass clean
