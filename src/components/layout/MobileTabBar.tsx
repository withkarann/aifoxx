import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Code2, ShieldCheck, Newspaper, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/",       label: "TOOLS",  Icon: LayoutGrid },
  { to: "/skills", label: "SKILLS", Icon: Code2       },
  { to: "/trust",  label: "TRUST",  Icon: ShieldCheck },
  { to: "/news",   label: "NEWS",   Icon: Newspaper   },
  { to: "/submit", label: "SUBMIT", Icon: Plus        },
];

export function MobileTabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border-default">
      <div className="flex items-stretch h-14" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors duration-150",
                active ? "text-accent-green" : "text-text-muted hover:text-text-secondary"
              )}
            >
              {active && (
                <span className="absolute top-0 left-2 right-2 h-[2px] bg-accent-green rounded-full" />
              )}
              <Icon size={16} strokeWidth={active ? 2.5 : 1.75} />
              <span className="font-mono text-[10px] tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
