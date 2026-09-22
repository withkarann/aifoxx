// Tells IndexNow (Bing, Yandex and other participating engines) which pages
// changed, so they recrawl those pages instead of the whole site. Run after a
// deploy. Reads the key from INDEXNOW_KEY; the matching key file must be live at
// https://aifoxx.com/<key>.txt.
//
// A page counts as changed when it is new in the sitemap, its lastmod moved, its
// tool entry was added, edited or removed, or its Trust & Security Report file
// changed. INDEXNOW_BASE is the commit to compare against (the previous state of
// main). Without a usable base, every sitemap URL is sent.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseSitemapLocs,
  sitemapChanges,
  changedToolSlugs,
  buildIndexNowPayload,
  INDEXNOW_MAX_URLS,
} from "../src/lib/indexnow.ts";

const key = process.env.INDEXNOW_KEY;
const dryRun = process.env.INDEXNOW_DRY_RUN === "1";
if (!key && !dryRun) { console.error("INDEXNOW_KEY not set; skipping"); process.exit(0); }

const SITE = "https://aifoxx.com";
const root = resolve(import.meta.dirname, "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 30 });

const nextXml = read("public/sitemap.xml");
const base = process.env.INDEXNOW_BASE;

let urls;
let prevXml = null;
if (base && !/^0+$/.test(base)) {
  try { prevXml = git("show", `${base}:public/sitemap.xml`); } catch { prevXml = null; }
}

if (prevXml === null) {
  urls = parseSitemapLocs(nextXml);
  console.log("No previous state to compare against; sending every sitemap URL.");
} else {
  const found = new Set(sitemapChanges(prevXml, nextXml));

  let prevTools = [];
  try { prevTools = JSON.parse(git("show", `${base}:src/data/tools.json`)); } catch { prevTools = []; }
  const nextTools = JSON.parse(read("src/data/tools.json"));
  const live = new Set(parseSitemapLocs(nextXml));
  for (const slug of changedToolSlugs(prevTools, nextTools)) {
    for (const path of [`/ai/${slug}`, `/trust/${slug}`]) {
      // Removed tools still have an address that now forwards, worth a recrawl.
      const url = `${SITE}${path}`;
      if (live.has(url) || !nextTools.some((t) => t.slug === slug)) found.add(url);
    }
  }

  const trustFiles = git("diff", "--name-only", base, "HEAD", "--", "src/data/trust/")
    .split("\n")
    .map((f) => /^src\/data\/trust\/([a-z0-9-]+)\.json$/.exec(f.trim())?.[1])
    .filter(Boolean);
  for (const slug of trustFiles) found.add(`${SITE}/trust/${slug}`);

  urls = [...found];
}

if (urls.length === 0) { console.log("IndexNow: no changed pages; nothing to submit."); process.exit(0); }
if (dryRun) {
  console.log(`IndexNow (dry run): would submit ${urls.length} URLs`);
  console.log(urls.slice(0, 20).join("\n"));
  process.exit(0);
}

for (let i = 0; i < urls.length; i += INDEXNOW_MAX_URLS) {
  const chunk = urls.slice(i, i + INDEXNOW_MAX_URLS);
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(buildIndexNowPayload(chunk, key)),
  });
  console.log(`IndexNow: submitted ${chunk.length} changed URLs -> HTTP ${res.status}`);
  if (res.status >= 400) { console.error(await res.text()); process.exit(1); }
}
