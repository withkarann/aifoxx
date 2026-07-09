// Emit dist/404.html so the host serves the app for any route that was not
// pre-rendered (unknown tags, categories, tool slugs, mistyped deep links).
// The host returns it with a 404 status (correct for genuinely unknown URLs)
// and the app boots from it and renders the right page client-side. This is
// independent of rewrites and cleanUrls, which do not reliably provide an SPA
// fallback for a pre-rendered static site.
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const index = resolve(root, "dist/index.html");
const fallback = resolve(root, "dist/404.html");

if (!existsSync(index)) {
  console.error("gen-spa-fallback: dist/index.html not found; run after build");
  process.exit(1);
}
copyFileSync(index, fallback);
console.log("spa fallback written: dist/404.html");
