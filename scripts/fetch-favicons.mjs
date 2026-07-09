// One-time local generator: fetches each tool's favicon, optimizes to a small
// webp under public/icons/<slug>.webp, and writes the manifest of slugs that
// have an icon. Run when the catalog changes: `node scripts/fetch-favicons.mjs`.
// Not part of the production build. Failures are skipped, never fatal.
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const tools = JSON.parse(readFileSync(resolve(root, "src/data/tools.json"), "utf8"));
const outDir = resolve(root, "public/icons");
mkdirSync(outDir, { recursive: true });

function hostOf(url) {
  try { return new URL(url).hostname; } catch { return null; }
}

async function fetchIcon(host) {
  const src = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  const res = await fetch(src, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) throw new Error("empty");
  return buf;
}

const CONCURRENCY = 10;
const withIcon = [];
let i = 0;
async function worker() {
  while (i < tools.length) {
    const tool = tools[i++];
    const host = hostOf(tool.url);
    if (!host || !tool.slug) continue;
    try {
      const buf = await fetchIcon(host);
      await sharp(buf)
        .resize(48, 48, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 82 })
        .toFile(resolve(outDir, `${tool.slug}.webp`));
      withIcon.push(tool.slug);
    } catch (err) {
      console.warn(`skip ${tool.slug} (${host}): ${err.message}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
withIcon.sort();
writeFileSync(resolve(root, "src/data/tool-icons.json"), JSON.stringify(withIcon, null, 0) + "\n");
console.log(`icons written: ${withIcon.length}/${tools.length}`);
