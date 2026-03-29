import type { RouteRecord } from "vite-react-ssg";
import App from "./App";
import HomePage from "./pages/HomePage";
import ToolDetailPage from "./pages/ToolDetailPage";
import CategoryPage from "./pages/CategoryPage";
import TagPage from "./pages/TagPage";
import SubmitPage from "./pages/SubmitPage";
import SkillsPage from "./pages/SkillsPage";
import McpServersPage from "./pages/McpServersPage";
import NewsPage from "./pages/NewsPage";
import NotFoundPage from "./pages/NotFoundPage";
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
      { path: "skills", Component: SkillsPage },
      { path: "mcp", Component: McpServersPage },
      { path: "news", Component: NewsPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
];
