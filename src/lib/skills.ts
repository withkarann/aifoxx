import { type Skill } from "@/types/skill";
import counts from "@/data/skill-counts.json";
import toolSkillsIndex from "@/data/tool-skills-index.json";

/**
 * Counts are kept in a tiny generated file (skill-counts.json) so pages can put
 * them in titles, meta descriptions, and structured data at build time without
 * pulling the multi-megabyte catalogs into the bundle. The catalogs themselves
 * are loaded on demand (see below).
 */
export const SKILL_COUNTS = counts as {
  total: number;
  mcpServers: number;
  claudeCodeSkills: number;
};

// The MCP-server and Claude-Code-skill catalogs are large (thousands of
// entries). They are imported dynamically so they ship as separate chunks the
// browser only downloads on the pages that actually list them, instead of being
// baked into every page's JavaScript. Each catalog is fetched at most once and
// then cached for the session.
let mcpCache: Skill[] | null = null;
let skillsCache: Skill[] | null = null;

export async function loadMcpServers(): Promise<Skill[]> {
  if (!mcpCache) {
    mcpCache = (await import("@/data/mcp-servers.json")).default as Skill[];
  }
  return mcpCache;
}

export async function loadClaudeCodeSkills(): Promise<Skill[]> {
  if (!skillsCache) {
    skillsCache = (await import("@/data/claude-code-skills.json")).default as Skill[];
  }
  return skillsCache;
}

// Only a small number of catalog entries are tied to a directory tool, so the
// tool -> skills mapping is precomputed into a tiny index (see
// tool-skills-index.json). Tool pages read it synchronously and never load the
// full catalogs just to show their handful of related skills.
const toolSkills = toolSkillsIndex as Record<string, Skill[]>;

/** Skills (of either kind) associated with a specific directory tool. */
export function getToolSkills(slug: string): Skill[] {
  return toolSkills[slug] ?? [];
}

/** Substring match across the fields a visitor would search by. */
export function skillMatch(s: Skill, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    s.name.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.tool_name.toLowerCase().includes(q) ||
    s.topics.some((t) => t.toLowerCase().includes(q))
  );
}

/** Filters an already-loaded list by query; an empty query returns it as-is. */
export function filterSkills(list: Skill[], query: string): Skill[] {
  const q = query.trim().toLowerCase();
  return q ? list.filter((s) => skillMatch(s, q)) : list;
}
