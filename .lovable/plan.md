

# ToolsAI — Foundation + Layout Components

The previous plan's foundation files were never created. This plan creates all foundation files AND the requested layout components in one pass.

## Files to Create/Modify

### Foundation (prerequisites)

1. **src/index.css** — Replace with full retro design system: CSS custom properties for dark (default) + light themes, @import JetBrains Mono, @font-face for Archimoto (fallback to Courier New since no woff2 exists in /public/fonts/), CRT scanline overlay, blink/scanline/glitch keyframes

2. **tailwind.config.ts** — Extend with retro color tokens (bg-base, bg-surface, bg-elevated, bg-overlay, border-dim, border-default, border-active, text-primary, text-secondary, text-muted, accent-green/blue/purple/amber/red), font-display + font-mono families, glow box-shadow, blink/scanline animations, darkMode: ['class', '[data-theme="dark"]']

3. **src/types/tool.ts** — Zod schema + Tool type with pricing enum

4. **src/types/category.ts** — Category interface + CATEGORIES constant (8 categories with subcategories)

5. **src/data/tools.json** — 12 AI tool entries (ChatGPT, Copilot, Midjourney, etc.)

6. **src/lib/tools.ts** — toSlug, validateTools, allTools, getToolBySlug, getToolsByCategory, getRelatedTools

7. **src/lib/queryClient.ts** — QueryClient with staleTime: Infinity

8. **src/contexts/ThemeContext.tsx** — ThemeProvider + useTheme hook, localStorage persistence, data-theme attribute on html, default dark

### Layout Components

9. **src/components/layout/NavBar.tsx**
   - Sticky top-0 z-40, bg-surface, border-b border-default
   - Left: "TOOLS_AI" logo in font-display + blinking cursor span
   - Right: ThemeToggle (Sun/Moon lucide icons, 28x28, border, rounded-[4px]), "SUBMIT_TOOL" link, mobile menu trigger (Menu icon) that opens Sidebar in a Sheet
   - Mobile menu trigger only visible on md:hidden

10. **src/components/layout/Footer.tsx**
    - border-t border-dim bg-surface mt-auto
    - Row 1: "TOOLS_AI // OPEN SOURCE DIRECTORY"
    - Row 2: GitHub link (withkarann), MIT License, v1.0.0

11. **src/components/layout/Sidebar.tsx**
    - Props: selectedCategory, selectedSubcategory, onSelect callback
    - Header: "// CATEGORIES"
    - "ALL TOOLS" option at top
    - Each category as shadcn Collapsible with trigger showing name + tool count badge
    - Active states: border-l-2 border-accent text-accent
    - Subcategories indented, font-mono, hover/active states
    - Tool counts computed from allTools

12. **src/components/layout/PageWrapper.tsx**
    - Two-column: sticky Sidebar (w-[260px], hidden below md) + flex-1 content area
    - Mobile: "FILTER" button that opens Sidebar in Sheet from left
    - Manages selectedCategory/selectedSubcategory state, passes to children via render prop or context

13. **src/components/layout/RootLayout.tsx**
    - min-h-screen flex flex-col bg-base text-text-primary
    - NavBar + main (flex-1, children via Outlet) + Footer

14. **src/main.tsx** — Wrap with ThemeProvider, call validateTools()

15. **src/App.tsx** — Use RootLayout wrapping routes

### Technical Notes
- Since /public/fonts/ has no Archimoto woff2, @font-face will reference the path but gracefully fall back to 'Courier New', monospace
- Tool counts for sidebar badges: filter allTools by category name
- Sheet component already exists in the project for mobile sidebar
- Collapsible component already exists for category groups

