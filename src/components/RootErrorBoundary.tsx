import { useEffect } from "react";
import { useRouteError, Link } from "react-router-dom";
import { isStaleDeployError, reloadOnceForStaleDeploy } from "@/lib/stale-deploy";

/**
 * Catches errors thrown by any route's loader or render. When the error is the
 * signature of a stale build (an asset or loader-data file removed by a newer
 * deploy), it reloads once onto the current build so the visitor never sees a
 * raw error. For genuine errors it shows a small recovery card.
 */
export function RootErrorBoundary() {
  const error = useRouteError();
  const stale = isStaleDeployError(error);

  useEffect(() => {
    if (stale) reloadOnceForStaleDeploy();
  }, [stale]);

  // While the reload is being triggered, render nothing to avoid a flash.
  if (stale) return null;

  return (
    <div className="flex-1 flex items-start justify-center px-4">
      <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 max-w-lg w-full mt-16 font-mono space-y-3">
        <p className="text-accent-red font-black">&gt; SOMETHING_WENT_WRONG</p>
        <p className="text-text-secondary">
          This page hit an unexpected error. Reloading usually fixes it.
        </p>
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-accent-green hover:underline"
          >
            &gt; reload
          </button>
          <Link to="/" className="text-accent-green hover:underline">
            &gt; cd ~/ [HOME]
          </Link>
        </div>
      </div>
    </div>
  );
}
