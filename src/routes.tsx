import type { RouteRecord } from "vite-react-ssg";
import App from "./App";
import HomePage from "./pages/HomePage";
import ToolDetailPage from "./pages/ToolDetailPage";
import CategoryPage from "./pages/CategoryPage";
import TagPage from "./pages/TagPage";
import SubmitPage from "./pages/SubmitPage";
import ComparePage from "./pages/ComparePage";
import CompareVsPage from "./pages/CompareVsPage";
import SkillsPage from "./pages/SkillsPage";
import McpServersPage from "./pages/McpServersPage";
import NewsPage from "./pages/NewsPage";
import NotFoundPage from "./pages/NotFoundPage";
import BestIndexPage from "./pages/BestIndexPage";
import BestCategoryPage from "./pages/BestCategoryPage";
import bestData from "./data/best-categories.json";
import { allTools, normalizeTaxonomyValue } from "./lib/tools";

// Pre-compute all static paths at build time
const toolPaths = allTools.map((t) => `ai/${t.slug}`);

const categoryPaths = [...new Set(allTools.map((t) => t.category))].map(
  (c) => `category/${normalizeTaxonomyValue(c)}`
);

// Only pre-render tags that appear on ≥5 tools (avoids 2700+ micro-pages)
const tagCounts: Record<string, number> = {};
allTools.forEach((t) =>
  t.tags.forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  })
);
const tagPaths = Object.entries(tagCounts)
  .filter(([, count]) => count >= 5)
  .map(([tag]) => `tag/${encodeURIComponent(tag)}`);

// Pre-render "vs" comparison pages only for featured tools within the same
// category (sensible head-to-heads like "ChatGPT vs Claude"). Canonicalised so
// a<b — we never ship both a-vs-b and b-vs-a (duplicate content) — and bounded
// to keep this to a few dozen high-intent pages, not a combinatorial explosion.
const vsGroups = new Map<string, string[]>();
allTools
  .filter((t) => t.featured)
  .forEach((t) => {
    const group = vsGroups.get(t.category) ?? [];
    group.push(t.slug);
    vsGroups.set(t.category, group);
  });
const vsPairKeys = new Set<string>();
for (const group of vsGroups.values()) {
  const sorted = [...group].sort();
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      vsPairKeys.add(`${sorted[i]}|${sorted[j]}`);
    }
  }
}
const vsPaths = Array.from(vsPairKeys)
  .slice(0, 80)
  .map((pair) => {
    const [a, b] = pair.split("|");
    return `compare/${a}/vs/${b}`;
  });

export const routes: RouteRecord[] = [
  {
    path: "/",
    Component: App,
    children: [
      { index: true, Component: HomePage },
      {
        path: "ai/:slug",
        Component: ToolDetailPage,
        getStaticPaths: () => toolPaths,
      },
      {
        path: "category/:category",
        Component: CategoryPage,
        getStaticPaths: () => categoryPaths,
      },
      {
        path: "tag/:tag",
        Component: TagPage,
        getStaticPaths: () => tagPaths,
      },
      { path: "submit", Component: SubmitPage },
      { path: "compare", Component: ComparePage },
      {
        path: "compare/:slugA/vs/:slugB",
        Component: CompareVsPage,
        getStaticPaths: () => vsPaths,
      },
      { path: "skills", Component: SkillsPage },
      { path: "mcp", Component: McpServersPage },
      { path: "news", Component: NewsPage },
      { path: "best", Component: BestIndexPage },
      {
        path: "best/:slug",
        Component: BestCategoryPage,
        getStaticPaths: () => bestData.categories.map((c) => `best/${c.slug}`),
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
];
