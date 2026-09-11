// Emit dist/404.html so the host serves the app for any route that was not
// pre-rendered (unknown tags, categories, tool slugs, mistyped deep links).
// The host returns it with a 404 status (correct for genuinely unknown URLs)
// and the app boots from it and renders the right page client-side. This is
// independent of rewrites and cleanUrls, which do not reliably provide an SPA
// fallback for a pre-rendered static site.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const index = resolve(root, "dist/index.html");
const fallback = resolve(root, "dist/404.html");

if (!existsSync(index)) {
  console.error("gen-spa-fallback: dist/index.html not found; run after build");
  process.exit(1);
}

// The fallback starts life as a copy of the home page, so it would otherwise
// carry the home page's title, description, canonical and indexing directive.
// A missing page must not describe itself as the home page, point search
// engines at it, or invite indexing, so each of those is rewritten in place.
// Rewriting the existing tags matters: adding new ones would leave the page
// carrying two contradictory answers to the same question.
let html = readFileSync(index, "utf8");
const swap = (pattern, replacement) => {
  if (!pattern.test(html)) {
    console.error(`gen-spa-fallback: expected markup not found for ${pattern}`);
    process.exit(1);
  }
  html = html.replace(pattern, replacement);
};

swap(/<title\b[^>]*>[\s\S]*?<\/title>/i, "<title>Page not found | AIFOXX</title>");

swap(
  /(<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=")[^"]*"/i,
  '$1That page does not exist. Browse the AI tools directory to find what you need."'
);

swap(
  /(<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=")[^"]*"/i,
  '$1noindex, follow"'
);

// A missing page has no canonical of its own, and inheriting the home page's
// would tell search engines to fold every unknown URL into the home page.
swap(/<link\b[^>]*\brel=["']canonical["'][^>]*>\s*/i, "");

writeFileSync(fallback, html);
console.log("spa fallback written: dist/404.html");
