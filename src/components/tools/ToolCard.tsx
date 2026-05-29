import { Link, useNavigate } from "react-router-dom";
import { type Tool } from "@/types/tool";
import { PricingBadge } from "./PricingBadge";
import { getCategoryColor, getCategoryVars } from "@/lib/categoryColors";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  variant?: "default" | "compact";
}

export function ToolCard({ tool, variant = "default" }: ToolCardProps) {
  const navigate = useNavigate();
  const color = getCategoryColor(tool.category);
  const vars = getCategoryVars(tool.category);

  return (
    <div
      className={cn(
        "tool-card relative overflow-hidden bg-bg-surface border border-border-default rounded-[6px] p-4 flex flex-col min-w-0 transition-all duration-150 cursor-pointer"
      )}
      style={vars}
    >
      <div className={cn("featured-bar absolute top-0 left-0 right-0", tool.featured ? "h-[3px]" : "h-[2px] opacity-70")} />

      <Link to={`/ai/${tool.slug}`} className="block no-underline cursor-pointer min-w-0">
        {/* Top row */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center min-w-0">
            {tool.logo_url ? (
              <img
                src={tool.logo_url}
                alt={tool.name}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-[4px] object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-bg-elevated border border-border-default rounded-[4px] flex items-center justify-center shrink-0">
                <span className="letter-avatar font-display font-black text-sm">{tool.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <span className="font-display font-black text-text-primary text-base truncate min-w-0 flex-1 ml-3 block">{tool.name}</span>
          </div>
          <PricingBadge pricing={tool.pricing} />
        </div>

        {/* Description */}
        {variant === "default" && (
          <p className="font-mono text-sm text-text-secondary mt-3 line-clamp-2 break-words min-w-0">{tool.description}</p>
        )}
      </Link>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border-dim flex flex-col gap-2 min-w-0">
        {/* Row 1: Category + Subcategory */}
        <div className="flex flex-wrap gap-1.5 min-w-0">
          <span className="cat-chip inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-[3px] shrink-0 max-w-full truncate">
            <span className="inline-flex items-center gap-1">
              {(() => {
                const Icon = getCategoryIcon(tool.category);
                return Icon ? (
                  // getCategoryIcon returns a stable, module-level phosphor component
                  // (see categoryIcons.ts) — a fixed reference, not one created during
                  // render — so its state never resets. The rule's heuristic can't tell.
                  // eslint-disable-next-line react-hooks/static-components
                  <Icon size={14} weight="duotone" style={{ color: color.accent, filter: `drop-shadow(0 0 6px ${color.accent}66)` }} />
                ) : (
                  <span>{color.emoji}</span>
                );
              })()}
              <span className="truncate">{tool.category}</span>
            </span>
          </span>
          <span className="subcat-chip inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-[3px] shrink-0 max-w-full truncate">
            {tool.subcategory}
          </span>
        </div>

        {/* Row 2: Tags — max 3 visible */}
        <div className="flex flex-wrap gap-1 min-w-0 overflow-hidden" style={{ maxHeight: '44px' }}>
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/tag/${tag}`); }}
              className="tag-pill inline-flex items-center shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-[3px] transition-colors duration-150 whitespace-nowrap cursor-pointer max-w-[120px] truncate"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
