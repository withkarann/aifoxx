// Builds the "other vendors in this category" list shown at the bottom of each
// trust report, so a reader comparing vendors can move straight to a comparable
// one instead of going back to the hub.
//
// Output: one small src/data/trust-related/<slug>.json per vendor, loaded
// alongside that vendor's report so the list costs no extra page weight.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(readFileSync(resolve(root, p), "utf8"));

const tools = read("src/data/tools.json");
const trustIndex = read("src/data/trust-index.json");

const RELATED_PER_VENDOR = 6;

const certCount = new Map(trustIndex.map((e) => [e.slug, e.certs_held_count ?? 0]));
const hasReport = (slug) => certCount.has(slug);

// Only tools that have a report can be suggested, and only they need a list.
const withReports = tools.filter((t) => hasReport(t.slug));

const byCategory = new Map();
for (const tool of withReports) {
  const group = byCategory.get(tool.category) ?? [];
  group.push(tool);
  byCategory.set(tool.category, group);
}

/**
 * Each category is ordered so that tools in the same subcategory sit together,
 * and within a subcategory the most-certified vendors come first. Every vendor
 * then links to its immediate neighbours in that order, wrapping around at the
 * ends. Picking neighbours rather than the category's top vendors means every
 * report is linked from roughly as many others as it links to, instead of a
 * handful of well-certified vendors absorbing all the links.
 */
for (const group of byCategory.values()) {
  group.sort(
    (a, b) =>
      (a.subcategory || "").localeCompare(b.subcategory || "") ||
      (certCount.get(b.slug) - certCount.get(a.slug)) ||
      a.name.localeCompare(b.name)
  );
}

const HALF = RELATED_PER_VENDOR / 2;

function relatedFor(tool) {
  const group = byCategory.get(tool.category) ?? [];
  const index = group.indexOf(tool);
  if (index === -1 || group.length < 2) return [];

  const picked = new Map();
  // Walk outwards from the vendor's own position, nearest neighbour first.
  for (let step = 1; step <= group.length && picked.size < RELATED_PER_VENDOR; step += 1) {
    for (const offset of [step, -step]) {
      if (picked.size >= RELATED_PER_VENDOR) break;
      if (step > HALF && offset > 0 && picked.size >= group.length - 1) break;
      const peer = group[(index + offset + group.length * step) % group.length];
      if (peer.slug === tool.slug || picked.has(peer.slug)) continue;
      picked.set(peer.slug, { slug: peer.slug, name: peer.name });
    }
  }
  return [...picked.values()];
}

const outDir = resolve(root, "src/data/trust-related");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

let files = 0;
let linkCount = 0;
for (const tool of withReports) {
  const peers = relatedFor(tool);
  if (peers.length === 0) continue;
  writeFileSync(resolve(outDir, `${tool.slug}.json`), `${JSON.stringify(peers)}\n`);
  files += 1;
  linkCount += peers.length;
}

console.log(`trust-related: ${files} of ${withReports.length} reports linked, ${linkCount} links`);
