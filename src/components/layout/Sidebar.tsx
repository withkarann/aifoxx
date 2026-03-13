import { CATEGORIES } from "@/types/category";
import { allTools } from "@/lib/tools";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SidebarProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelect: (category: string | null, subcategory?: string | null) => void;
}

export function Sidebar({ selectedCategory, selectedSubcategory, onSelect }: SidebarProps) {
  return (
    <nav className="w-full">
      <p className="font-mono text-xs tracking-widest text-text-muted mb-4">
        // CATEGORIES
      </p>

      {/* ALL TOOLS */}
      <button
        onClick={() => onSelect(null, null)}
        className={cn(
          "w-full text-left font-display text-sm font-black uppercase py-2 px-2 mb-1 rounded-[4px] transition-colors duration-150",
          selectedCategory === null
            ? "border-l-2 border-accent-green text-accent-green"
            : "text-text-secondary hover:text-text-primary"
        )}
      >
        ALL TOOLS
      </button>

      {/* Category groups */}
      {CATEGORIES.map((cat) => {
        const count = allTools.filter((t) => t.category === cat.name).length;
        const isActive = selectedCategory === cat.name;

        return (
          <Collapsible key={cat.name} defaultOpen={isActive}>
            <CollapsibleTrigger asChild>
              <button
                onClick={() => onSelect(cat.name, null)}
                className={cn(
                  "w-full flex items-center justify-between py-2 px-2 rounded-[4px] transition-colors duration-150",
                  isActive
                    ? "border-l-2 border-accent-green text-accent-green"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                <span className="font-display text-sm font-black uppercase">
                  {cat.name}
                </span>
                <span className="bg-bg-overlay text-text-muted text-xs px-1.5 py-0.5 rounded-[4px] font-mono">
                  {count}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-2 border-l border-border-dim">
                {cat.subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => onSelect(cat.name, sub)}
                    className={cn(
                      "block w-full text-left text-sm font-mono pl-4 py-1.5 transition-colors duration-150 cursor-pointer",
                      selectedSubcategory === sub && selectedCategory === cat.name
                        ? "text-accent-green"
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}
