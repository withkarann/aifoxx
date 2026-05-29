import { useNavigate, useLocation } from "react-router-dom";
import { CATEGORIES, allTools, matchesTaxonomyValue } from "@/lib/tools";
import { useToolFilters } from "@/hooks/useToolFilters";
import { getCategoryColor } from "@/lib/categoryColors";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const { filters, setFilters } = useToolFilters();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const routeCategory = location.pathname.startsWith("/category/")
    ? decodeURIComponent(location.pathname.replace("/category/", ""))
    : "";
  const selectedCategory = filters.category || routeCategory;

  const handleSelect = (category: string, subcategory?: string, closeOnMobile = true) => {
    if (!category) {
      setFilters({ category: "", subcategory: "" });
      navigate("/");
    } else {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.pricing) params.set("pricing", filters.pricing);
      for (const tag of filters.tags) {
        params.append("tag", tag);
      }
      if (subcategory) params.set("subcategory", subcategory);

      const qs = params.toString();
      navigate(`/category/${encodeURIComponent(category)}${qs ? `?${qs}` : ""}`);
    }

    if (closeOnMobile) {
      onMobileClose?.();
    }
  };

  return (
    <nav className="w-full overflow-x-hidden">
      <p className="font-mono text-xs tracking-widest text-text-muted mb-4">
        // CATEGORIES
      </p>

      <button
        type="button"
        onClick={() => handleSelect("", undefined, true)}
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
        const isActive = selectedCategory ? matchesTaxonomyValue(selectedCategory, cat.name) : false;
        const color = getCategoryColor(cat.name);
        const Icon = getCategoryIcon(cat.name);

        return (
          <Collapsible key={cat.name} defaultOpen={isActive}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                onClick={() => handleSelect(cat.name, undefined, false)}
                className={cn(
                  "w-full flex items-start justify-between gap-2 py-2 px-2 rounded-[4px] transition-colors duration-150",
                  !isActive && "text-text-secondary hover:text-text-primary"
                )}
                style={{
                  borderLeft: isActive ? `2px solid ${color.accent}` : '2px solid transparent',
                  color: isActive ? color.accent : undefined,
                  textShadow: isActive ? `0 0 8px ${color.accent}66` : 'none',
                }}
              >
                <span className="font-display text-[11px] md:text-sm font-black uppercase leading-tight text-left break-words pr-1 min-w-0 flex-1 flex items-center gap-2">
                  {Icon ? (
                    <Icon size={18} weight="duotone" style={{ color: color.accent, filter: `drop-shadow(0 0 8px ${color.accent}66)` }} />
                  ) : (
                    <span>{color.emoji}</span>
                  )}
                  <span className="truncate">{cat.name}</span>
                </span>
                <span
                  className="sidebar-count-pill text-xs px-1.5 py-0.5 rounded-[4px] font-mono shrink-0 mt-0.5"
                  style={{
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
                    type="button"
                    onClick={() => handleSelect(cat.name, sub, true)}
                    className={cn(
                      "block w-full text-left text-sm font-mono pl-4 py-1.5 transition-colors duration-150 cursor-pointer",
                      filters.subcategory && selectedCategory && matchesTaxonomyValue(filters.subcategory, sub) && matchesTaxonomyValue(selectedCategory, cat.name)
                        ? ""
                        : "text-text-secondary hover:text-text-primary"
                    )}
                    style={
                      filters.subcategory && selectedCategory && matchesTaxonomyValue(filters.subcategory, sub) && matchesTaxonomyValue(selectedCategory, cat.name)
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
