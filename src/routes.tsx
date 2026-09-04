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
import TrustReportPage from "./pages/TrustReportPage";
import { TRUST_SLUGS } from "./lib/trust";
import { loadTrustReport } from "./lib/trust-report";
import { loadToolDetail } from "./lib/tool-detail";
import NewsPage from "./pages/NewsPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFoundPage from "./pages/NotFoundPage";
import { RootErrorBoundary } from "./components/RootErrorBoundary";
import BestIndexPage from "./pages/BestIndexPage";
import BestCategoryPage from "./pages/BestCategoryPage";
import bestData from "./data/best-categories.json";
import { allTools, normalizeTaxonomyValue } from "./lib/tools";
import { tagPagePaths } from "./lib/tags";

// Pre-compute all static paths at build time
const toolPaths = allTools.map((t) => `ai/${t.slug}`);

const categoryPaths = [...new Set(allTools.map((t) => t.category))].map(
  (c) => `category/${normalizeTaxonomyValue(c)}`
);

// Only tags carrying enough tools to make a worthwhile page get one. The same
// set decides which tags the UI is allowed to link, so no link can point at a
// tag page that was never built.
const tagPaths = tagPagePaths();

// Pre-render "vs" comparison pages only for widely used tools within the same
// category (sensible head-to-heads like "ChatGPT vs Claude"). Canonicalised so
// a<b (we never ship both a-vs-b and b-vs-a, duplicate content) and bounded
// to keep this to a few dozen high-intent pages, not a combinatorial explosion.
const vsGroups = new Map<string, string[]>();
allTools
  .filter((t) => t.popular)
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
    // Catches loader/render errors from any child route. Its main job is to
    // reload once when a stale build's asset or loader-data file 404s after a
    // deploy, instead of showing the visitor a raw error screen.
    ErrorBoundary: RootErrorBoundary,
    children: [
      { index: true, Component: HomePage },
      {
        path: "ai/:slug",
        Component: ToolDetailPage,
        // Heavy detail fields load per tool; the loader runs at build time so
        // each page's full content is still pre-rendered into static HTML.
        loader: ({ params }) => loadToolDetail(params.slug),
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
      // The hub is lazy so its ~794 KB index data stays off the main bundle.
      // The report page is eager (its own code is tiny; each vendor's data loads
      // on demand via the loader) so navigating to a report never depends on
      // fetching a separate component chunk that a newer deploy may have removed.
      {
        path: "trust",
        lazy: async () => ({ Component: (await import("./pages/TrustIndexPage")).default }),
      },
      {
        path: "trust/:slug",
        Component: TrustReportPage,
        loader: async ({ params }) => (await loadTrustReport(params.slug)) ?? null,
        getStaticPaths: () => TRUST_SLUGS.map((slug) => `trust/${slug}`),
      },
      { path: "news", Component: NewsPage },
      { path: "privacy", Component: PrivacyPage },
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
