import { Link } from "react-router-dom";
import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

export function NavBar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bg-surface border-b border-border-default">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="flex items-center justify-center w-7 h-7 border border-border-default rounded-[4px] transition-colors duration-150 hover:shadow-glow">
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

          <Link to="/" className="flex items-center gap-0.5">
            <span className="font-display font-black tracking-widest text-accent-green text-lg">
              TOOLS_AI
            </span>
            <span className="animate-blink text-accent-green font-display">|</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-7 h-7 border border-border-default rounded-[4px] transition-colors duration-150 hover:shadow-glow"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <Link
            to="/submit"
            className="hidden sm:inline-flex font-mono text-xs tracking-widest border border-accent-green text-accent-green px-3 py-1.5 rounded-[4px] hover:bg-accent-green hover:text-primary-foreground transition-colors duration-150"
          >
            SUBMIT_TOOL
          </Link>
        </div>
      </div>
    </header>
  );
}
