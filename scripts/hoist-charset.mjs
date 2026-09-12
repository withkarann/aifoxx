// Move the character-set declaration to the very top of every page's head.
// The page generator writes the title and social tags first, which pushes the
// declaration past the point a browser stops looking for it. When that happens
// the browser guesses an encoding, then re-parses the page once it finds the
// real one, and any non-Latin text can flash as garbled characters first.
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const dist = resolve(import.meta.dirname, "../dist");
const CHARSET = /<meta[^>]*\bcharset\s*=\s*["']?[^"'>]+["']?[^>]*>\s*/i;

const pages = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    statSync(path).isDirectory() ? walk(path) : path.endsWith(".html") && pages.push(path);
  }
})(dist);

let hoisted = 0;
let missing = 0;

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const match = html.match(CHARSET);
  if (!match) {
    missing++;
    continue;
  }
  const withoutCharset = html.replace(CHARSET, "");
  const next = withoutCharset.replace(/<head(\s[^>]*)?>/i, (head) => `${head}<meta charset="UTF-8">`);
  if (next !== html) {
    writeFileSync(page, next);
    hoisted++;
  }
}

if (missing) {
  console.error(`hoist-charset: ${missing} of ${pages.length} pages have no charset declaration`);
  process.exit(1);
}
console.log(`charset hoisted to the top of head on ${hoisted} of ${pages.length} pages`);
