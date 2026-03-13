

## Issues Found

### Issue 1: Category color mismatch (gray cards)
The keys in `categoryColors.json` don't match the categories used in `tools.json` and `category.ts`. For example:
- `tools.json` uses "Content Creation" but `categoryColors.json` has "Content & Writing"
- "Coding" vs "Coding & Dev", "Design" vs "Design & Creative", "Video" vs "Video & Audio", etc.

Only "Marketing" and "Productivity" match exactly, which is why some cards have color and others fall back to the gray `__default__`.

**Fix**: Add the missing keys to `categoryColors.json` that match the actual category names used in `tools.json` and `category.ts`:

```text
tools.json category  →  missing from categoryColors.json
─────────────────────────────────────────────────
Content Creation     →  needs entry (use Content & Writing colors)
Coding               →  needs entry (use Coding & Dev colors)
Design               →  needs entry (use Design & Creative colors)
Video                →  needs entry (use Video & Audio colors)
Research             →  needs entry (use Research & Data colors)
Business             →  needs entry (use Business & Finance colors)
```

### Issue 2: Sidebar navigation broken on detail pages
On `/ai/jasper`, the `Sidebar` uses `useToolFilters()` which sets URL search params on the **current route**. So clicking "Marketing > SEO" on the Jasper detail page just appends `?category=Marketing&subcategory=SEO` to `/ai/jasper` — it doesn't navigate away.

**Fix**: Update `Sidebar.handleSelect` to use `navigate()` from React Router. When not already on the home page, navigate to `/?category=X&subcategory=Y` instead of just setting search params on the current URL.

## Implementation Plan

1. **Update `src/data/categoryColors.json`** — Add entries for "Content Creation", "Coding", "Design", "Video", "Research", "Business" using the same color values as their expanded-name counterparts. Keep the expanded names too for forward-compatibility.

2. **Update `src/components/layout/Sidebar.tsx`** — Import `useNavigate` and `useLocation` from React Router. In `handleSelect`, check if current path is `/` — if not, use `navigate()` to go to home with the category/subcategory as search params. If already on home, keep existing behavior of setting search params in place.

