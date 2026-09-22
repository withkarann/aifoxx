import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, BookOpen } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Brand from "@/lib/brand";

const NAV_LINKS: { to: string; label: string; primary?: boolean }[] = [
  { to: "/", label: "AI DIRECTORY" },
  { to: "/skills", label: "SKILLS" },
  { to: "/mcp", label: "MCP" },
  { to: "/trust", label: "TRUST" },
  { to: "/compare", label: "COMPARE" },
  { to: "/best", label: "BEST OF" },
  { to: "/news", label: "NEWS" },
  { to: "/submit", label: "SUBMIT TOOL", primary: true },
];

/** A section stays highlighted on its sub-pages, e.g. TRUST on /trust/notion. */
export function isActivePath(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/" || pathname.startsWith("/ai/") || pathname.startsWith("/category/") || pathname.startsWith("/tag/");
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function NavBar() {
  const { theme, cycleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : BookOpen;
  const nextThemeLabel =
    theme === "dark" ? "soft light" : theme === "light" ? "notebook" : "dark terminal";

  return (
    <header className="sticky top-0 z-40 bg-bg-surface border-b border-border-default">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation menu"
                  className="flex items-center justify-center w-11 h-11 -ml-2 rounded-[4px] text-text-secondary hover:text-text-primary transition-colors duration-150"
                >
                  <span className="flex items-center justify-center w-7 h-7 border border-border-default rounded-[4px] hover:shadow-glow transition-shadow duration-150">
                    <Menu size={16} />
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-bg-surface p-0">
                <SheetTitle className="sr-only">Site navigation</SheetTitle>
                <nav aria-label="Pages" className="p-4 pb-0 grid grid-cols-2 gap-2">
                  {NAV_LINKS.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActivePath(pathname, to) ? "page" : undefined}
                      className={cn(
                        "font-mono text-xs tracking-widest border px-3 py-2.5 rounded-[4px] text-center transition-colors duration-150",
                        isActivePath(pathname, to)
                          ? "bg-accent-green text-primary-foreground border-accent-green font-bold"
                          : "border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
                <div className="p-4">
                  <Sidebar onMobileClose={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/" className="flex items-center gap-2" aria-label="AIFOXX home">
            <img
              src="/aifoxx-48.webp"
              alt="AIFOXX AI Tools Directory Logo"
              width={24}
              height={24}
              className="w-6 h-6 select-none pointer-events-none"
            />
            <span className="font-display font-black tracking-widest text-text-primary text-lg">
              {Brand.nav.logo_text}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleTheme}
            className="flex items-center justify-center w-11 h-11 rounded-[4px] text-text-secondary hover:text-text-primary transition-colors duration-150"
            aria-label={`Switch theme (next: ${nextThemeLabel})`}
            title={`Theme: ${theme.toUpperCase()} (next: ${nextThemeLabel})`}
          >
            <span className="flex items-center justify-center w-7 h-7 border border-border-default rounded-[4px] hover:shadow-glow transition-shadow duration-150">
              <ThemeIcon size={14} />
            </span>
          </button>

          {NAV_LINKS.map(({ to, label, primary }) => {
            const active = isActivePath(pathname, to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "hidden lg:inline-flex font-mono text-xs tracking-widest border px-3 py-1.5 rounded-[4px] transition-colors duration-150 whitespace-nowrap",
                  active
                    ? "bg-accent-green text-primary-foreground border-accent-green font-bold"
                    : primary
                      ? "border-accent-green text-accent-green hover:bg-accent-green hover:text-primary-foreground"
                      : "border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
