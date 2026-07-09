import { ViteReactSSG } from "vite-react-ssg";
import "@fontsource/jetbrains-mono/latin.css";
import "./index.css";
import { routes } from "./routes";

// When a new version is deployed, its asset filenames change and the previous
// build's chunks are removed. A tab that was already open still references the
// old chunk names, so a lazily-loaded route or data chunk 404s with "Failed to
// fetch dynamically imported module". Reload once to pick up the current build.
// The 10s guard prevents a reload loop if a chunk is genuinely unreachable.
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", () => {
    const KEY = "preloadReloadAt";
    let last = 0;
    try {
      last = Number(sessionStorage.getItem(KEY) || 0);
    } catch {
      /* sessionStorage unavailable; fall through and reload */
    }
    if (Date.now() - last > 10_000) {
      try {
        sessionStorage.setItem(KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      window.location.reload();
    }
  });
}

export const createRoot = ViteReactSSG({ routes });
