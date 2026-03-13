import { CATEGORIES } from "@/types/category";
import { allTools } from "@/lib/tools";
import { useToolFilters } from "@/hooks/useToolFilters";
import { getCategoryColor } from "@/lib/categoryColors";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const { filters, setFilter } = useToolFilters();

  const handleSelect = (category: string, subcategory?: string) => {
    if (subcategory) {
      setFilter("category", category);
      setFilter("subcategory", subcategory);
    } else if (category) {
      setFilter("category", category);
      setFilter("subcategory", "");
    } else {
      setFilter("category", "");
      setFilter("subcategory", "");
    }
    onMobileClose?.();
  };

  return (
    <nav className="w-full overflow-x-hidden">
      <p className="font-mono text-xs tracking-widest text-text-muted mb-4">
        // CATEGORIES
      </p>

      <button
        onClick={() => handleSelect("")}
        className={cn(
          "w-full text-left font-display text-sm font-black uppercase py-2 px-2 mb-1 rounded-[4px] transition-colors duration-150",
          !filters.category
            ? "border-l-2 border-accent-green text-accent-green"
            : "text-text-secondary hover:text-text-primary"
        )}
      >
        ALL TOOLS
      </button>

      {CATEGORIES.map((cat) => {
        const count = allTools.filter((t) => t.category === cat.name).length;
        const isActive = filters.category === cat.name;
        const color = getCategoryColor(cat.name);

        return (
          <Collapsible key={cat.name} defaultOpen={isActive}>
            <CollapsibleTrigger asChild>
              <button
                onClick={() => handleSelect(cat.name)}
                className={cn(
                  "w-full flex items-center justify-between py-2 px-2 rounded-[4px] transition-colors duration-150",
                  !isActive && "text-text-secondary hover:text-text-primary"
                )}
                style={{
                  borderLeft: isActive ? `2px solid ${color.accent}` : '2px solid transparent',
                  color: isActive ? color.accent : undefined,
                  textShadow: isActive ? `0 0 8px ${color.accent}66` : 'none',
                }}
              >
                <span className="font-display text-sm font-black uppercase">
                  {color.emoji} {cat.name}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-[4px] font-mono"
                  style={{
                    color: color.text,
                    background: color.bg,
                    border: `1px solid ${color.border}`,
                  }}
                >
                  {count}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-2 border-l border-border-dim">
                {cat.subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => handleSelect(cat.name, sub)}
                    className={cn(
                      "block w-full text-left text-sm font-mono pl-4 py-1.5 transition-colors duration-150 cursor-pointer",
                      filters.subcategory === sub && filters.category === cat.name
                        ? ""
                        : "text-text-secondary hover:text-text-primary"
                    )}
                    style={
                      filters.subcategory === sub && filters.category === cat.name
                        ? { color: color.accent }
                        : undefined
                    }
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
