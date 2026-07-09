// After a new version deploys, the previous build's asset and loader-data files
// are removed. A tab still running the old build then requests filenames that no
// longer exist. Two failure shapes result:
//   1. A lazily imported chunk 404s ("Failed to fetch dynamically imported module").
//   2. The loader-data manifest 404s and its HTML error page is parsed as JSON,
//      throwing a SyntaxError ("Unexpected token 'T', \"The page c\"... is not valid JSON").
// Both mean "you are on a stale build"; the cure is a single reload onto the
// current build.

/** True when an error looks like a stale-build asset or data load, not a real bug. */
export function isStaleDeployError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    /Unexpected token|is not valid JSON|JSON\.parse/i.test(message) ||
    /dynamically imported module|Importing a module script failed|error loading dynamically imported/i.test(message)
  );
}

/**
 * Reload the page at most once per 10 seconds to pick up the current build.
 * The guard prevents a reload loop if the resource is genuinely unreachable.
 * Returns true if a reload was triggered. No-op outside the browser.
 */
export function reloadOnceForStaleDeploy(): boolean {
  if (typeof window === "undefined") return false;
  const KEY = "staleDeployReloadAt";
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
    return true;
  }
  return false;
}
