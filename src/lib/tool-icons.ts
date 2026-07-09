import iconSlugs from "@/data/tool-icons.json";

// Slugs whose favicon was fetched and committed under public/icons/.
const withIcon = new Set(iconSlugs as string[]);

/** True when a locally hosted icon exists for this tool slug. */
export function hasToolIcon(slug: string): boolean {
  return withIcon.has(slug);
}

/** Path to the locally hosted, CDN-cached icon for this slug. */
export function toolIconUrl(slug: string): string {
  return `/icons/${slug}.webp`;
}
