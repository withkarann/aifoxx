// Computes catalog counts from the data files and writes them into the places
// that quote them, so the numbers can never drift from the real catalog.
//
// Source of truth: src/data/{tools,mcp-servers,claude-code-skills}.json
// Writes: src/data/catalog-stats.json (machine-readable) and updates the human
// count strings in README.md, public/llms.txt, src/data/brand.json, index.html.
//
// Idempotent: replacements match the number PATTERN, not a specific value, so
// running it twice is a no-op and running it after the catalog changes brings
// every count back in sync. Wire it into the build so deploys are always exact.
//
// Usage: node scripts/generate-stats.mjs   (also runs as part of `npm run build`)

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const readJSON = (p) => JSON.parse(read(p));

const tools = readJSON("src/data/tools.json");
const mcp = readJSON("src/data/mcp-servers.json");
const skills = readJSON("src/data/claude-code-skills.json");
const trustSlugs = readJSON("src/data/trust-slugs.json");

const FREE = new Set(["Free", "Freemium", "Open Source"]);
const stats = {
  tools: tools.length,
  categories: new Set(tools.map((t) => t.category)).size,
  freeTier: tools.filter((t) => FREE.has(t.pricing)).length,
  apiAccess: tools.filter((t) =>
    (t.access_methods || []).some((m) => (m || "").toLowerCase().includes("api"))
  ).length,
  selfHostable: tools.filter((t) => (t.data_storage || {}).self_hostable === true).length,
  mcpServers: mcp.length,
  skills: skills.length,
  trustReports: trustSlugs.length,
};

// Machine-readable source of truth for the app.
writeFileSync(
  join(ROOT, "src/data/catalog-stats.json"),
  JSON.stringify(stats, null, 2) + "\n"
);

const { tools: N, categories: C, freeTier: F, apiAccess: A, selfHostable: S, mcpServers: M, skills: K, trustReports: T } = stats;

/** Thousands separators, matching how the README's summary table reads. */
const group = (n) => n.toLocaleString("en-US");

// Apply a list of [pattern, replacement] edits to a file, preserving its EOL.
function patch(path, edits) {
  let txt = read(path);
  const eol = txt.includes("\r\n") ? "\r\n" : "\n";
  for (const [re, rep] of edits) txt = txt.replace(re, rep);
  writeFileSync(join(ROOT, path), txt.split(/\r?\n/).join(eol));
}

// "<n> AI tools" anywhere (drops any trailing + so the count stays exact).
const aiTools = [/\b[\d,]+\+?\s+AI tools\b/g, `${N} AI tools`];

// Categories, largest first, each described by its most common subcategories.
const byCategory = new Map();
for (const t of tools) {
  const entry = byCategory.get(t.category) || { count: 0, subs: new Map() };
  entry.count += 1;
  entry.subs.set(t.subcategory, (entry.subs.get(t.subcategory) || 0) + 1);
  byCategory.set(t.category, entry);
}
const categoriesBySize = [...byCategory.entries()].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]));
const categoryLines = categoriesBySize
  .map(([name, { count, subs }]) => {
    const top = [...subs.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 4).map(([s]) => s);
    return `- ${name} (${count}): ${top.join(", ")}`;
  })
  .join("\n");
const largest = categoriesBySize.slice(0, 6).map(([name]) => name).join(", ");

patch("src/data/brand.json", [aiTools]);
patch("index.html", [aiTools]);
patch("public/llms.txt", [
  aiTools,
  [/\b[\d,]+ AI tools cataloged across \d+ categories/, `${N} AI tools cataloged across ${C} categories`],
  [/\b[\d,]+ tools offer a free/, `${F} tools offer a free`],
  [/\b[\d,]+ tools provide API access; [\d,]+ are self-hostable/, `${A} tools provide API access; ${S} are self-hostable`],
  [/Largest categories: [^\r\n]*/, `Largest categories: ${largest}.`],
  [/\b[\d,]+ MCP servers and [\d,]+ Claude Code skills indexed/, `${group(M)} MCP servers and ${group(K)} Claude Code skills indexed`],
  [/reports for [\d,]+ AI vendors/g, `reports for ${T} AI vendors`],
  [/\b[\d,]+ vendors have a Trust and Security Report/g, `${T} vendors have a Trust and Security Report`],
  [/(## Categories\r?\n\r?\n)[\s\S]*?(\r?\n\r?\n## )/, `$1${categoryLines}$2`],
]);
// The summary table is the number readers actually see, so it is patched by
// matching the row label rather than the old value. Anchoring on the label
// keeps these working if the wording around them changes.
const tableRow = (label, value) => [
  new RegExp(`(\\*\\*${label}\\*\\*\\s*\\|\\s*)[\\d,]+`),
  `$1${value}`,
];

patch("README.md", [
  tableRow("AI tools", group(N)),
  tableRow("MCP servers", group(M)),
  tableRow("Claude Code skills", group(K)),
  tableRow("Trust & Security Reports", group(T)),
  [/catalogs [\d,]+ AI tools/, `catalogs ${N} AI tools`],
  [/index of [\d,]+ Claude Code skills/, `index of ${K} Claude Code skills`],
]);

console.log("catalog-stats:", JSON.stringify(stats));
