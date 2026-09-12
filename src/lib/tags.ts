import { allTools } from "./tools";

/**
 * A tag needs this many tools before it gets its own page. Below the threshold
 * the page would list one or two tools and say almost nothing, so those tags
 * are shown as plain text rather than as links.
 */
export const TAG_MIN_TOOLS = 5;

/** How many tools carry each tag. */
export function countTags(tools: readonly { tags: string[] }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tool of tools) {
    for (const tag of tool.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

/** The tags that have a page. Every tag link in the UI must come from this set. */
export function linkableTags(tools: readonly { tags: string[] }[]): Set<string> {
  const linkable = new Set<string>();
  for (const [tag, count] of countTags(tools)) {
    if (count >= TAG_MIN_TOOLS) linkable.add(tag);
  }
  return linkable;
}

const LINKABLE = linkableTags(allTools);

/**
 * Whether a tag has a page of its own. Linking a tag without one sends the
 * visitor, and any search engine following the link, to a 404.
 */
export function hasTagPage(tag: string): boolean {
  return LINKABLE.has(tag);
}

/** Every tag page path, for the route table and the sitemap. */
export function tagPagePaths(): string[] {
  return [...LINKABLE].map((tag) => `tag/${encodeURIComponent(tag)}`);
}
