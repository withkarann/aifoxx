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
};

// Machine-readable source of truth for the app.
writeFileSync(
  join(ROOT, "src/data/catalog-stats.json"),
  JSON.stringify(stats, null, 2) + "\n"
);

const { tools: N, categories: C, freeTier: F, apiAccess: A, selfHostable: S, mcpServers: M, skills: K } = stats;

// Apply a list of [pattern, replacement] edits to a file, preserving its EOL.
function patch(path, edits) {
  let txt = read(path);
  const eol = txt.includes("\r\n") ? "\r\n" : "\n";
  for (const [re, rep] of edits) txt = txt.replace(re, rep);
  writeFileSync(join(ROOT, path), txt.split(/\r?\n/).join(eol));
}

// "<n> AI tools" anywhere (drops any trailing + so the count stays exact).
const aiTools = [/\b[\d,]+\+?\s+AI tools\b/g, `${N} AI tools`];

patch("src/data/brand.json", [aiTools]);
patch("index.html", [aiTools]);
patch("public/llms.txt", [
  aiTools,
  [/\b[\d,]+ AI tools cataloged across \d+ categories/, `${N} AI tools cataloged across ${C} categories`],
  [/\b[\d,]+ tools offer a free/, `${F} tools offer a free`],
  [/\b[\d,]+ tools provide API access; [\d,]+ are self-hostable/, `${A} tools provide API access; ${S} are self-hostable`],
]);
patch("README.md", [
  [/catalogs [\d,]+ AI tools/, `catalogs ${N} AI tools`],
  [/index of [\d,]+ Claude Code skills/, `index of ${K} Claude Code skills`],
  [/#\s*[\d,]+ tools\b/, `# ${N} tools`],
  [/#\s*[\d,]+ MCP servers/, `# ${M} MCP servers`],
  [/#\s*[\d,]+ Claude Code skills/, `# ${K} Claude Code skills`],
]);

console.log("catalog-stats:", JSON.stringify(stats));
