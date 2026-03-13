

## Problem

Two related issues:

1. **Related tools section uses wrong filter**: `getRelatedTools()` in `src/lib/tools.ts` filters by **category** (e.g., "Marketing"), but the heading says "MORE IN SEO" (the subcategory). So on Jasper's page, it shows Copy.ai (Marketing/Email) under a "MORE IN SEO" heading — misleading.

2. **Count appears wrong**: The user sees 3 tools labeled as SEO (Jasper + Surfer SEO + Copy.ai in "related"), but Copy.ai is actually in Marketing/**Email**, not SEO. Only 2 tools are truly in SEO. The sidebar correctly shows 2.

## Root Cause

`getRelatedTools()` on line 38-40 of `src/lib/tools.ts`:
```ts
.filter((t) => t.slug !== slug && t.category === tool.category)
```
It matches by **category** but the detail page labels it as "MORE IN {subcategory}".

## Fix

**Option A**: Change `getRelatedTools` to filter by **subcategory** first, then fall back to category if not enough results. This makes the "MORE IN SEO" heading accurate.

### Changes

**`src/lib/tools.ts`** — Update `getRelatedTools`:
```ts
export function getRelatedTools(slug: string, limit = 4): Tool[] {
  const tool = getToolBySlug(slug);
  if (!tool) return [];
  // First: same subcategory
  const sameSubcat = allTools.filter(
    (t) => t.slug !== slug && t.subcategory === tool.subcategory
  );
  if (sameSubcat.length >= limit) return sameSubcat.slice(0, limit);
  // Fill with same category (different subcategory)
  const sameCat = allTools.filter(
    (t) => t.slug !== slug && t.category === tool.category && t.subcategory !== tool.subcategory
  );
  return [...sameSubcat, ...sameCat].slice(0, limit);
}
```

This ensures:
- "MORE IN SEO" only shows actual SEO tools first
- Falls back to broader category tools if there aren't enough subcategory matches
- The count stays accurate

