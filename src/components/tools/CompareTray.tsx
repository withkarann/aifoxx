import { Link, useLocation } from "react-router-dom";
import { Scale, ArrowRight, X } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";

/**
 * Floating launcher for the compare tray. Appears on listing pages once at least
 * one tool is marked, and links through to /compare (the tray carries the
 * selection; no query string needed). Hidden on /compare itself and on tool
 * detail pages, where it would collide with the sticky Open bar.
 */
export function CompareTray() {
  const { selected, clear } = useCompare();
  const { pathname } = useLocation();

  const hidden = selected.length === 0 || pathname === "/compare" || pathname.startsWith("/ai/");
  if (hidden) return null;

  return (
    <div className="fixed z-30 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 bottom-[4.5rem] md:bottom-6">
      <div className="flex items-center gap-2 bg-bg-elevated border border-accent-green/50 rounded-full shadow-lg pl-4 pr-2 py-2">
        <Scale size={14} className="text-accent-green shrink-0" />
        <Link
          to="/compare"
          className="font-display font-black text-xs tracking-widest text-text-primary inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          COMPARE ({selected.length})
          <ArrowRight size={14} className="text-accent-green" />
        </Link>
        <button
          type="button"
          onClick={clear}
          aria-label="Clear comparison"
          className="text-text-muted hover:text-accent-red transition-colors ml-1 w-6 h-6 flex items-center justify-center shrink-0"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
