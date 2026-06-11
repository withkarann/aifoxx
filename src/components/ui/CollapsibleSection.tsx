import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  /** Section label, rendered as the <h2> (without the leading "// "). */
  title: string;
  /** Initial open state on mobile. Desktop (md+) is always expanded. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * A section that collapses on mobile (tap the heading to expand/collapse) but is
 * ALWAYS expanded on desktop (md+). The content stays mounted in both states
 * (only its mobile visibility toggles via CSS), so the SSG'd HTML and crawlers
 * (which render at desktop width) always see every section. Keeps a real <h2> so
 * the page's heading outline and SEO are preserved.
 */
export function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="space-y-2">
      <h2 className="font-mono text-xs text-text-muted tracking-widest">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-2 min-h-[44px] md:min-h-0 md:pointer-events-none text-left"
        >
          <span>// {title}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              "md:hidden shrink-0 transition-transform duration-150",
              open && "rotate-180"
            )}
          />
        </button>
      </h2>
      <div className={cn("space-y-2", open ? "block" : "hidden", "md:block")}>
        {children}
      </div>
    </section>
  );
}
