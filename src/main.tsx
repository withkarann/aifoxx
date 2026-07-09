import { ViteReactSSG } from "vite-react-ssg";
import "@fontsource/jetbrains-mono/latin.css";
import "./index.css";
import { routes } from "./routes";
import { reloadOnceForStaleDeploy } from "./lib/stale-deploy";

// When a new version deploys, the previous build's chunk filenames are removed.
// A tab still on the old build 404s on a lazily loaded route chunk, which Vite
// surfaces as "vite:preloadError". Reload once onto the current build. Errors
// that reach a route loader instead (e.g. the loader-data manifest) are handled
// by RootErrorBoundary, which shares the same one-time reload guard.
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", () => {
    reloadOnceForStaleDeploy();
  });
}

export const createRoot = ViteReactSSG({ routes });
