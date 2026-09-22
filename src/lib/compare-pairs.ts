import { allTools } from "./tools";

/**
 * Head-to-head pages are built for every pair of widely used tools in the same
 * category, e.g. ChatGPT vs Claude. Each pair is written once, with the two
 * slugs in alphabetical order, so a-vs-b and b-vs-a are never both published.
 * scripts/generate-sitemap.mjs lists the same pairs.
 */
function buildPairs(): Set<string> {
  const groups = new Map<string, string[]>();
  for (const tool of allTools) {
    if (!tool.popular) continue;
    const group = groups.get(tool.category) ?? [];
    group.push(tool.slug);
    groups.set(tool.category, group);
  }
  const pairs = new Set<string>();
  for (const group of groups.values()) {
    const sorted = [...group].sort();
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) pairs.add(`${sorted[i]}|${sorted[j]}`);
    }
  }
  return pairs;
}

const PAIRS = buildPairs();

/** Every head-to-head page path, for the route table. */
export function vsPagePaths(): string[] {
  return [...PAIRS].map((pair) => {
    const [a, b] = pair.split("|");
    return `compare/${a}/vs/${b}`;
  });
}

/** The published head-to-head page for two tools, in either order, if one exists. */
export function vsPagePath(slugA: string, slugB: string): string | null {
  const [a, b] = [slugA, slugB].sort();
  return PAIRS.has(`${a}|${b}`) ? `/compare/${a}/vs/${b}` : null;
}
