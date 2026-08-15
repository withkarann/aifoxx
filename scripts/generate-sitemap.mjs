#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://aifoxx.com";
const TOOLS_PATH = join(__dirname, "..", "src", "data", "tools.json");
const NEWS_PATH = join(__dirname, "..", "src", "data", "news.json");
const NEW_TOOLS_PATH = join(__dirname, "..", "src", "data", "new-tools.json");
const BEST_PATH = join(__dirname, "..", "src", "data", "best-categories.json");
const TRUST_INDEX_PATH = join(__dirname, "..", "src", "data", "trust-index.json");
const OUTPUT_PATH = join(__dirname, "..", "public", "sitemap.xml");

function normalizeTaxonomyValue(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(value, fallback) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().slice(0, 10);
}

function withBase(pathname) {
  if (pathname === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function unique(values) {
  return Array.from(new Set(values));
}

function buildXmlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    "  </url>",
  ].join("\n");
}

function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10);

  const tools = JSON.parse(readFileSync(TOOLS_PATH, "utf8"));
  const news = JSON.parse(readFileSync(NEWS_PATH, "utf8"));
  const newTools = JSON.parse(readFileSync(NEW_TOOLS_PATH, "utf8"));

  const latestNewsDate = [...news, ...newTools]
    .map((item) => new Date(item.date).getTime())
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => b - a)[0];

  const newsLastmod = latestNewsDate
    ? new Date(latestNewsDate).toISOString().slice(0, 10)
    : today;

  const categoryPaths = unique(tools.map((tool) => normalizeTaxonomyValue(tool.category))).map(
    (category) => `/category/${category}`
  );

  const tagCounts = new Map();
  for (const tool of tools) {
    for (const tag of tool.tags || []) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  // Match static pre-rendering strategy to avoid flooding the index with low-signal pages.
  const tagPaths = Array.from(tagCounts.entries())
    .filter(([, count]) => count >= 5)
    .map(([tag]) => `/tag/${encodeURIComponent(tag)}`)
    .sort((a, b) => a.localeCompare(b));

  const staticRoutes = [
    { path: "/", lastmod: today, changefreq: "daily", priority: 1.0 },
    { path: "/submit", lastmod: today, changefreq: "monthly", priority: 0.6 },
    { path: "/skills", lastmod: today, changefreq: "weekly", priority: 0.8 },
    { path: "/mcp", lastmod: today, changefreq: "weekly", priority: 0.8 },
    { path: "/trust", lastmod: today, changefreq: "weekly", priority: 0.9 },
    { path: "/news", lastmod: newsLastmod, changefreq: "daily", priority: 0.8 },
    { path: "/best", lastmod: today, changefreq: "weekly", priority: 0.9 },
    { path: "/compare", lastmod: today, changefreq: "weekly", priority: 0.7 },
  ];

  const bestData = JSON.parse(readFileSync(BEST_PATH, "utf8"));
  const bestRoutes = bestData.categories.map((c) => ({
    path: `/best/${c.slug}`,
    lastmod: today,
    changefreq: "weekly",
    priority: 0.9,
  }));

  const categoryRoutes = categoryPaths.map((path) => ({
    path,
    lastmod: today,
    changefreq: "weekly",
    priority: 0.7,
  }));

  const toolRoutes = tools
    .map((tool) => ({
      path: `/ai/${tool.slug}`,
      lastmod: toIsoDate(tool.last_verified, today),
      changefreq: "weekly",
      priority: 0.8,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

  const tagRoutes = tagPaths.map((path) => ({
    path,
    lastmod: today,
    changefreq: "weekly",
    priority: 0.5,
  }));

  // Vendor Trust & Security Report pages, one per assessed vendor.
  const trustIndex = JSON.parse(readFileSync(TRUST_INDEX_PATH, "utf8"));
  const trustRoutes = trustIndex
    .map((entry) => ({
      path: `/trust/${entry.slug}`,
      lastmod: toIsoDate(entry.last_verified, today),
      changefreq: "monthly",
      priority: 0.8,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

  // "vs" comparison pages: widely used + same-category pairs, canonicalised (a<b).
  // Mirrors getStaticPaths in src/routes.tsx so the sitemap matches what's built.
  // Both sides must filter on the same field, or the sitemap silently drops
  // pages that are still being built.
  const vsGroups = new Map();
  for (const tool of tools) {
    if (!tool.popular) continue;
    const group = vsGroups.get(tool.category) || [];
    group.push(tool.slug);
    vsGroups.set(tool.category, group);
  }
  const vsPairKeys = new Set();
  for (const group of vsGroups.values()) {
    const sorted = [...group].sort();
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        vsPairKeys.add(`${sorted[i]}|${sorted[j]}`);
      }
    }
  }
  const vsRoutes = Array.from(vsPairKeys)
    .slice(0, 80)
    .map((pair) => {
      const [a, b] = pair.split("|");
      return { path: `/compare/${a}/vs/${b}`, lastmod: today, changefreq: "monthly", priority: 0.6 };
    });

  const routes = [...staticRoutes, ...bestRoutes, ...categoryRoutes, ...toolRoutes, ...tagRoutes, ...vsRoutes, ...trustRoutes];

  const xml = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map((route) =>
      buildXmlEntry({
        loc: withBase(route.path),
        lastmod: route.lastmod,
        changefreq: route.changefreq,
        priority: route.priority,
      })
    ),
    "</urlset>",
    "",
  ].join("\n");

  writeFileSync(OUTPUT_PATH, xml, "utf8");
  console.log(`Generated sitemap with ${routes.length} URLs -> ${OUTPUT_PATH}`);
}

generateSitemap();
