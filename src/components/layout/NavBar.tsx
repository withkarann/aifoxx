import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, BookOpen } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Brand from "@/lib/brand";

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
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation menu"
                  className="flex items-center justify-center w-7 h-7 border border-border-default rounded-[4px] transition-colors duration-150 hover:shadow-glow"
                >
                  <Menu size={16} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-bg-surface p-0">
                <SheetTitle className="sr-only">Categories</SheetTitle>
                <div className="p-4">
                  <Sidebar onMobileClose={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/" className="flex items-center gap-2" aria-label="AIFOXX home">
            <img
              src="/aifoxx.png"
              alt="AIFOXX AI Tools Directory Logo"
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
            className="flex items-center justify-center w-7 h-7 border border-border-default rounded-[4px] transition-colors duration-150 hover:shadow-glow"
            aria-label={`Switch theme (next: ${nextThemeLabel})`}
            title={`Theme: ${theme.toUpperCase()} (next: ${nextThemeLabel})`}
          >
            <ThemeIcon size={14} />
          </button>

          <Link
            to="/"
            className={cn(
              "hidden sm:inline-flex font-mono text-xs tracking-widest border px-3 py-1.5 rounded-[4px] transition-colors duration-150",
              pathname === "/"
                ? "bg-accent-green text-primary-foreground border-accent-green font-bold"
                : "border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
            )}
          >
            AI DIRECTORY
          </Link>

          <Link
            to="/skills"
            className={cn(
              "hidden sm:inline-flex font-mono text-xs tracking-widest border px-3 py-1.5 rounded-[4px] transition-colors duration-150",
              pathname === "/skills"
                ? "bg-accent-green text-primary-foreground border-accent-green font-bold"
                : "border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
            )}
          >
            SKILLS
          </Link>

          <Link
            to="/mcp"
            className={cn(
              "hidden sm:inline-flex font-mono text-xs tracking-widest border px-3 py-1.5 rounded-[4px] transition-colors duration-150",
              pathname === "/mcp"
                ? "bg-accent-green text-primary-foreground border-accent-green font-bold"
                : "border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
            )}
          >
            MCP
          </Link>

          <Link
            to="/compare"
            className={cn(
              "hidden sm:inline-flex font-mono text-xs tracking-widest border px-3 py-1.5 rounded-[4px] transition-colors duration-150",
              pathname === "/compare"
                ? "bg-accent-green text-primary-foreground border-accent-green font-bold"
                : "border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
            )}
          >
            COMPARE
          </Link>

          <Link
            to="/news"
            className={cn(
              "hidden sm:inline-flex font-mono text-xs tracking-widest border px-3 py-1.5 rounded-[4px] transition-colors duration-150",
              pathname === "/news"
                ? "bg-accent-green text-primary-foreground border-accent-green font-bold"
                : "border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
            )}
          >
            NEWS
          </Link>


          <Link
            to="/submit"
            className={cn(
              "hidden sm:inline-flex font-mono text-xs tracking-widest border px-3 py-1.5 rounded-[4px] transition-colors duration-150",
              pathname === "/submit"
                ? "bg-accent-green text-primary-foreground border-accent-green font-bold"
                : "border-accent-green text-accent-green hover:bg-accent-green hover:text-primary-foreground"
            )}
          >
            SUBMIT TOOL
          </Link>
        </div>
      </div>
    </header>
  );
}
