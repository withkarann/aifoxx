export const INDEXNOW_HOST = "aifoxx.com";

/** Extract the <loc> URLs from a sitemap.xml string, in document order. */
export function parseSitemapLocs(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

/** Extract each sitemap entry with the date it carries, in document order. */
export function parseSitemapEntries(xml: string): SitemapEntry[] {
  const out: SitemapEntry[] = [];
  const re = /<url>([\s\S]*?)<\/url>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1]?.trim();
    if (!loc) continue;
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1]?.trim();
    out.push(lastmod ? { loc, lastmod } : { loc });
  }
  return out;
}

/**
 * The pages that changed recently enough to be worth telling a search engine
 * about. Resubmitting every page on every run makes the signal meaningless,
 * so a run only reports what has actually moved.
 */
export function changedSince(entries: SitemapEntry[], since: Date): string[] {
  const cutoff = since.getTime();
  return entries
    .filter((entry) => {
      if (!entry.lastmod) return false;
      const time = new Date(entry.lastmod).getTime();
      return !Number.isNaN(time) && time >= cutoff;
    })
    .map((entry) => entry.loc);
}

/** How many days back a run looks, so a missed run still gets picked up. */
export const INDEXNOW_WINDOW_DAYS = 7;

export function windowStart(now: Date, days = INDEXNOW_WINDOW_DAYS): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
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
