import { useState, type ReactNode } from "react";
import { Filter } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface PageWrapperProps {
  children: ReactNode;
  /** Show the mobile category-filter trigger. Off for pages with nothing to filter (e.g. a tool detail page). */
  mobileFilter?: boolean;
}

export function PageWrapper({ children, mobileFilter = true }: PageWrapperProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-1">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[260px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 border-r border-border-dim">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-x-hidden">
        {/* Mobile filter button */}
        {mobileFilter && (
          <div className="md:hidden p-4 pb-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button type="button" className="flex items-center gap-2 font-mono text-xs tracking-widest border border-border-default text-text-secondary px-4 min-h-11 rounded-[4px] hover:shadow-glow transition-all duration-150">
                  <Filter size={14} />
                  FILTER
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-bg-surface p-0">
                <SheetTitle className="sr-only">Filter Categories</SheetTitle>
                <div className="p-4 overflow-y-auto max-h-[100dvh]">
                  <Sidebar onMobileClose={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
