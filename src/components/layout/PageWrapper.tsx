import { useState, type ReactNode } from "react";
import { Filter } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface PageWrapperProps {
  children: (filters: {
    selectedCategory: string | null;
    selectedSubcategory: string | null;
  }) => ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (category: string | null, subcategory?: string | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory ?? null);
  };

  return (
    <div className="flex flex-1">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[260px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 border-r border-border-dim">
        <Sidebar
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelect={handleSelect}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile filter button */}
        <div className="md:hidden p-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 font-mono text-xs tracking-widest border border-border-default text-text-secondary px-3 py-1.5 rounded-[4px] hover:shadow-glow transition-all duration-150">
                <Filter size={14} />
                FILTER
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-bg-surface p-0">
              <SheetTitle className="sr-only">Filter Categories</SheetTitle>
              <div className="p-4">
                <Sidebar
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  onSelect={(cat, sub) => {
                    handleSelect(cat, sub);
                    setMobileOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="p-4">
          {children({ selectedCategory, selectedSubcategory })}
        </div>
      </div>
    </div>
  );
}
