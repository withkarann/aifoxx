#!/usr/bin/env node
/**
 * Splits the tool catalog into a light index plus one detail file per tool, so
 * the listing/search/compare pages ship only the fields they need and each tool
 * detail page loads its heavy fields on demand.
 *
 * INPUT  (committed, human-editable source): src/data/tools.json
 * OUTPUT (generated, gitignored, rebuilt on every dev/build):
 *   - src/data/tools-index.json     light catalog (everything except HEAVY)
 *   - src/data/tools/<slug>.json    heavy detail fields, loaded per tool page
 *
 * Deterministic: same tools.json always yields identical output.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "src", "data");
const SRC = join(DATA, "tools.json");
const INDEX_OUT = join(DATA, "tools-index.json");
const DETAIL_DIR = join(DATA, "tools");

// Fields moved to the per-tool detail file. Chosen because they are rendered
// ONLY on the tool detail page (use_cases, not_good_for, industries) or are
// superseded on every surface by the trust dataset (compliance, data_storage,
// compliance_sources). Everything else stays in the light index because the
// grid, search, filters, cards, or comparison table need it.
const HEAVY = [
  "use_cases",
  "not_good_for",
  "industries",
  "compliance",
  "compliance_sources",
  "data_storage",
];

function main() {
  const tools = JSON.parse(readFileSync(SRC, "utf8"));
  mkdirSync(DETAIL_DIR, { recursive: true });

  const index = [];
  const keep = new Set();
  for (const tool of tools) {
    const light = {};
    const heavy = {};
    for (const [k, v] of Object.entries(tool)) {
      if (HEAVY.includes(k)) heavy[k] = v;
      else light[k] = v;
    }
    index.push(light);
    if (Object.keys(heavy).length > 0) {
      writeFileSync(join(DETAIL_DIR, `${tool.slug}.json`), JSON.stringify(heavy) + "\n", "utf8");
      keep.add(`${tool.slug}.json`);
    }
  }

  // Drop detail files for slugs that no longer exist.
  for (const f of readdirSync(DETAIL_DIR)) {
    if (f.endsWith(".json") && !keep.has(f)) rmSync(join(DETAIL_DIR, f), { force: true });
  }

  writeFileSync(INDEX_OUT, JSON.stringify(index) + "\n", "utf8");
  const idxKb = (readFileSync(INDEX_OUT).length / 1024).toFixed(0);
  console.log(`Split ${tools.length} tools -> tools-index.json (${idxKb} KB) + tools/ (${keep.size} detail files)`);
}

main();
