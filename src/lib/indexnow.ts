export const INDEXNOW_HOST = "aifoxx.com";

/** Extract the <loc> URLs from a sitemap.xml string, in document order. */
export function parseSitemapLocs(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

/** Build the IndexNow POST body for the given URLs and key. */
export function buildIndexNowPayload(urlList: string[], key: string) {
  return {
    host: INDEXNOW_HOST,
    key,
    keyLocation: `https://${INDEXNOW_HOST}/${key}.txt`,
    urlList,
  };
}

/** Each sitemap URL mapped to its lastmod date ("" when the entry has none). */
export function parseSitemapEntries(xml: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /<url>([\s\S]*?)<\/url>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1].trim();
    if (!loc) continue;
    out.set(loc, /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1].trim() ?? "");
  }
  return out;
}

/** URLs that are new in `nextXml` or whose lastmod moved since `prevXml`. */
export function sitemapChanges(prevXml: string, nextXml: string): string[] {
  const prev = parseSitemapEntries(prevXml);
  const changed: string[] = [];
  for (const [loc, lastmod] of parseSitemapEntries(nextXml)) {
    if (prev.get(loc) !== lastmod) changed.push(loc);
  }
  return changed;
}

/** Slugs of tools that were added, removed or edited between two catalog versions. */
export function changedToolSlugs(
  prev: readonly { slug: string }[],
  next: readonly { slug: string }[]
): string[] {
  const before = new Map(prev.map((t) => [t.slug, JSON.stringify(t)]));
  const after = new Map(next.map((t) => [t.slug, JSON.stringify(t)]));
  const slugs = new Set<string>();
  for (const [slug, json] of after) if (before.get(slug) !== json) slugs.add(slug);
  for (const slug of before.keys()) if (!after.has(slug)) slugs.add(slug);
  return [...slugs].sort();
}

/** IndexNow accepts at most this many URLs per request. */
export const INDEXNOW_MAX_URLS = 10_000;
