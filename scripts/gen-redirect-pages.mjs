// Addresses that used to be pages keep working: each one forwards the visitor,
// and any search engine, to the page that now covers it instead of a 404.
//   - /tag/<tag> for tags too small to have a page of their own forwards to the
//     category most of its tools belong to.
//   - /ai/<slug> and /trust/<slug> for tools no longer listed forward to their
//     old category, or to the trust hub for a report.
// An immediate refresh with a matching canonical link is read as a permanent
// move. Existing pages are never overwritten.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const SITE = "https://aifoxx.com";
const TAG_MIN_TOOLS = 5; // matches src/lib/tags.ts

const tools = JSON.parse(readFileSync(resolve(root, "src/data/tools.json"), "utf8"));
const removed = JSON.parse(readFileSync(resolve(root, "src/data/removed-tools.json"), "utf8"));

const slugify = (value) =>
  value.trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const categories = new Set(tools.map((t) => t.category));
const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function page(destination) {
  const url = `${SITE}${destination}`;
  const href = escapeAttr(url);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved | AIFOXX</title>
<link rel="canonical" href="${href}">
<meta http-equiv="refresh" content="0; url=${href}">
</head>
<body><p>This page has moved to <a href="${href}">${href}</a>.</p></body>
</html>
`;
}

let written = 0;
function write(path, destination) {
  const file = resolve(dist, `${path}.html`);
  if (existsSync(file)) return;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(destination));
  written += 1;
}

// Tags without a page: forward to the category most of their tools are in.
const byTag = new Map();
for (const tool of tools) {
  for (const tag of tool.tags) {
    const counts = byTag.get(tag) ?? new Map();
    counts.set(tool.category, (counts.get(tool.category) ?? 0) + 1);
    byTag.set(tag, counts);
  }
}
for (const [tag, counts] of byTag) {
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  if (total >= TAG_MIN_TOOLS) continue;
  const [category] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  write(`tag/${encodeURIComponent(tag)}`, `/category/${slugify(category)}`);
}

// Tools that are no longer listed.
for (const [slug, category] of Object.entries(removed)) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) continue;
  write(`ai/${slug}`, categories.has(category) ? `/category/${slugify(category)}` : "/");
  write(`trust/${slug}`, "/trust");
}

console.log(`redirect pages: ${written} moved addresses now forward to a live page`);
