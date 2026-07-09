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
