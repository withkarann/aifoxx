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

// The app shows this same wording, so a crawler and a visitor read one page.
const TITLE = "404 | Page Not Found | AIFOXX";
const DESCRIPTION =
  "That page does not exist. Browse the AI tools directory to find what you need.";

swap(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${TITLE}</title>`);

swap(
  /(<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=")[^"]*"/i,
  `$1${DESCRIPTION}"`
);

swap(
  /(<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=")[^"]*"/i,
  '$1noindex, follow"'
);

// A missing page has no canonical of its own, and inheriting the home page's
// would tell search engines to fold every unknown URL into the home page.
swap(/<link\b[^>]*\brel=["']canonical["'][^>]*>\s*/i, "");

// The tags a social card is built from would otherwise advertise the directory
// on a link that leads nowhere, so they say the same thing as the page title
// and description above. The address is dropped rather than rewritten, because
// a missing page has no address of its own to name.
for (const [attr, key, value] of [
  ["property", "og:title", TITLE],
  ["property", "og:description", DESCRIPTION],
  ["property", "og:image:alt", TITLE],
  ["name", "twitter:title", TITLE],
  ["name", "twitter:description", DESCRIPTION],
  ["name", "twitter:image:alt", TITLE],
]) {
  swap(
    new RegExp(`(<meta\\b[^>]*\\b${attr}=["']${key}["'][^>]*\\bcontent=")[^"]*"`, "i"),
    `$1${value}"`
  );
}
swap(/<meta\b[^>]*\bproperty=["']og:url["'][^>]*>\s*/i, "");

// The copy also carries the home page's rendered markup, and the marker that
// tells the app to reuse it. A visitor on a missing page would be served the
// whole home page, see it for an instant, and then watch it be replaced by the
// missing-page notice the app actually wants to show. Emptying the container
// and dropping the marker lets the app draw the page itself, which is both the
// right page from the first paint and around 690 KB less to download.
swap(
  /<div id="root" data-server-rendered="true">[\s\S]*?<\/div>(?=\s*<script)/i,
  '<div id="root"></div>'
);

writeFileSync(fallback, html);
console.log("spa fallback written: dist/404.html");
