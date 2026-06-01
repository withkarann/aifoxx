import { ExternalLink } from "lucide-react";

interface StickyOpenBarProps {
  name: string;
  url: string;
  /** Category accent color (hex / css color) used to tint the button. */
  accent: string;
  /** Whether the bar is shown (driven by the header CTA scrolling out of view). */
  visible: boolean;
}

/**
 * Mobile-only sticky "Open" bar. Docks just above the global bottom tab bar and
 * slides in once the in-page Open CTA has scrolled out of view, so the tool is
 * always one tap away. Hidden on desktop (md+), where the header CTA stays in
 * reach. Rendered client-side only (visibility is driven by an effect), so it
 * never appears in the SSG'd HTML.
 */
export function StickyOpenBar({ name, url, accent, visible }: StickyOpenBarProps) {
  return (
    <div
      className={`md:hidden fixed left-0 right-0 z-30 px-3 transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[120%] opacity-0"
      }`}
      style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom))" }}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 bg-bg-elevated border border-border-default rounded-[8px] shadow-lg px-3 py-2">
        <span className="font-display font-black text-sm text-text-primary truncate min-w-0 flex-1">
          {name}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visible ? 0 : -1}
          className="inline-flex items-center gap-1.5 shrink-0 font-display font-black tracking-widest text-xs px-4 min-h-[40px] rounded-[6px]"
          style={{ background: accent, color: "#080C10" }}
        >
          OPEN <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
