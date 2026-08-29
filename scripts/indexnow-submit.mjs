// Tells IndexNow (Bing, Yandex and other participating engines) which pages
// changed. Run after a deploy. Reads the key from the INDEXNOW_KEY env var;
// the matching key file must be live at https://aifoxx.com/<key>.txt.
//
// Only pages whose sitemap date moved inside the window are sent. Submitting
// the whole site on every run tells an engine nothing about what changed, and
// engines treat that as a batch dump rather than a change notification.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseSitemapEntries, changedSince, windowStart, buildIndexNowPayload } from "../src/lib/indexnow.ts";

const key = process.env.INDEXNOW_KEY;
if (!key) { console.error("INDEXNOW_KEY not set; skipping"); process.exit(0); }

const root = resolve(import.meta.dirname, "..");
const xml = readFileSync(resolve(root, "public/sitemap.xml"), "utf8");
const entries = parseSitemapEntries(xml);
if (entries.length === 0) { console.error("no sitemap URLs; skipping"); process.exit(0); }

const urls = changedSince(entries, windowStart(new Date()));
if (urls.length === 0) {
  console.log(`IndexNow: nothing changed in ${entries.length} pages; nothing to submit`);
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(buildIndexNowPayload(urls, key)),
});
console.log(`IndexNow: submitted ${urls.length} of ${entries.length} pages -> HTTP ${res.status}`);
if (res.status >= 400) { console.error(await res.text()); process.exit(1); }
