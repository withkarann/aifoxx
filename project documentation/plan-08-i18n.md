# PLAN-08 — Internationalization (i18n)

---

## 1. PROJECT IDENTITY

```
Name:           AIFoxx — i18n / Multi-language Support
Type:           web app feature
Primary Language: TypeScript + React
Runtime / Platform: Browser (Vite + React 18)
Owner / Team:   AIFoxx
Start Date:     Q1 2026
Target Release: Q2 2026 (in progress)
```

---

## 2. PROBLEM & GOALS

**Problem Statement**
AIFoxx serves a global audience of developers and businesses. UI labels, navigation, and static copy are currently English-only. Adding i18n lets users read the interface in their preferred language.

**Success Criteria**
- [ ] All NavBar strings use translation keys — no hardcoded English
- [ ] All 7 supported languages have a complete translation file with no missing keys
- [ ] Language selection persists across page refreshes

**Out of Scope**
- Translating tool names or descriptions (those come from tools.json, English only)
- Right-to-left (RTL) layout support
- Auto-translating user-submitted content

---

## 3. ARCHITECTURE

**Pattern:** react-i18next with browser language detection

**Layer Map:**
```
User selects language in NavBar
    ↓
i18n.changeLanguage(code)
    ↓
react-i18next context updates
    ↓
All t("key") calls re-render with new language
    ↓
i18next-browser-languagedetector persists choice
```

**Key Design Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| i18n library | react-i18next + i18next | Industry standard, hooks-based |
| Language detection | i18next-browser-languagedetector | Auto-detects browser language on first visit |
| Translation files | JSON files in `src/i18n/locales/` | Easy to edit, one file per language |
| Fallback language | English (en) | All keys guaranteed to exist in en.json |
| State persistence | i18next-browser-languagedetector (localStorage) | Survives refresh |

**External Dependencies / APIs:**
- `i18next`
- `react-i18next`
- `i18next-browser-languagedetector`

---

## 4. DATA MODEL

```
Supported languages:
  en (English), de (German), ru (Russian),
  fr (French), es (Spanish), zh (Chinese), hi (Hindi)

Translation file structure:
  src/i18n/locales/
    en.json
    de.json
    ru.json
    fr.json
    es.json
    zh.json
    hi.json

Key namespaces (flat structure):
  nav.*        — NavBar strings (submitTool, themeNext.*, etc.)
  home.*       — HomePage strings (searchPlaceholder, filterLabel, etc.)
  tool.*       — Tool detail page labels
  profile.*    — Profile page strings (planned with User Profiles)
  common.*     — Shared strings (loading, error, noResults, etc.)
```

**Validation rules:**
- Every key in `en.json` must exist in all other locale files
- Missing keys fall back to English — never show a raw key string
- Language code must be in the supported list before calling changeLanguage

---

## 5. DEVELOPMENT LIFECYCLE

```
Phase 1 — Foundation  ✅
  [x] react-i18next installed
  [x] i18next configured in src/i18n/index.ts
  [x] Language selector added to NavBar (7 languages)

Phase 2 — Core Features  (in progress)
  [x] NavBar strings translated (submitTool, themeNext.*)
  [ ] HomePage strings — searchPlaceholder, filterLabel, noResults
  [ ] ToolDetailPage labels — compliance section, pricing section
  [ ] CategoryPage + TagPage headings
  [ ] Common strings — loading, error states, pagination

Phase 3 — Integration
  [ ] SkillsPage + McpServersPage strings
  [ ] ProfilePage strings (when User Profiles built)
  [ ] Footer strings

Phase 4 — Hardening
  [ ] Audit all 7 locale files for missing keys
  [ ] Test language switch — verify all visible strings update
  [ ] Test with Chinese (longest potential text expansion)

Phase 5 — Release
  [ ] All locale files complete with no empty values
  [ ] Language preference persists after refresh
  [ ] No raw i18n keys visible in any language
```

---

## 6. TESTING STRATEGY

| Layer | Tool | Coverage Target | When Runs |
|-------|------|----------------|-----------|
| Unit | Vitest | t() returns correct string per locale | PR |
| Integration | Vitest | Language switch updates NavBar text | PR |
| E2E | Playwright | Switch to German → verify NavBar text | Pre-release |
| Manual | — | All 7 languages checked in browser | Pre-release |
| Security | — | No user input through i18n pipeline | — |

---

## 7. API / INTERFACE CONTRACT

```
Hook: useTranslation()
  Returns: { t, i18n }
  Usage: t("nav.submitTool") → translated string

Function: i18n.changeLanguage(code: string)
  Input: language code from supported list
  Effect: updates all t() calls in all components

Config: src/i18n/index.ts
  - resources: all locale JSON files
  - fallbackLng: "en"
  - detection: localStorage + navigator.language
```

---

## 8. SECURITY CHECKLIST

- [x] Translation keys are static strings — no dynamic key construction from user input
- [x] Locale JSON files are static — not fetched from external URLs
- [x] Language code validated against supported list before changeLanguage call
- [x] No user content routed through i18n system

---

## 9. DOCUMENTATION STANDARDS

| Artifact | Location |
|----------|----------|
| i18n config | `src/i18n/index.ts` |
| Locale files | `src/i18n/locales/*.json` |
| Usage pattern | `useTranslation()` hook in any component |

**Convention:** Key format is `section.label` — e.g. `nav.submitTool`, `home.searchPlaceholder`. Never use sentence-case strings as keys.

---

## 10. MILESTONES & RISKS

| Milestone | Target Date | Done? |
|-----------|-------------|-------|
| Library installed + NavBar wired | Q1 2026 | [x] |
| All page strings covered | Q2 2026 | [ ] |
| All 7 locale files complete | Q2 2026 | [ ] |
| CI key audit script | Q3 2026 | [ ] |

**Top Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Locale files go out of sync with new keys | High | Medium | Add CI script to diff en.json against other locales |
| Chinese / Arabic text overflows UI | Medium | Medium | Test with longest expected strings early |
| Community translations are inaccurate | Medium | Low | Note translations as machine-assisted in UI |

---

## 11. DEFINITION OF DONE

- [ ] Every visible UI string uses a translation key (no hardcoded English)
- [ ] All 7 locale files have 100% key coverage
- [ ] Language switch tested in browser for all 7 languages
- [ ] Fallback to English works for any missing key
- [ ] `npm run build` and lint pass clean
