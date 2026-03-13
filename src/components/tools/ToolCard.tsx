import { Link } from "react-router-dom";
import { type Tool } from "@/types/tool";
import { PricingBadge } from "./PricingBadge";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  variant?: "default" | "compact";
}

export function ToolCard({ tool, variant = "default" }: ToolCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-surface border border-border-default rounded-[6px] p-4 transition-all duration-150 hover:border-border-active hover:shadow-glow",
        tool.featured && "border-t-2 border-t-accent-green"
      )}
    >
      <Link to={`/ai/${tool.slug}`} className="block no-underline cursor-pointer">
        {/* Top row */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center min-w-0">
            {tool.logo_url ? (
              <img src={tool.logo_url} alt={tool.name} className="w-8 h-8 rounded-[4px] object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-bg-elevated border border-border-default rounded-[4px] flex items-center justify-center shrink-0">
                <span className="font-display font-black text-accent-green text-sm">{tool.name.charAt(0)}</span>
              </div>
            )}
            <h3 className="font-display font-black text-text-primary text-base ml-3 truncate">{tool.name}</h3>
          </div>
          <PricingBadge pricing={tool.pricing} />
        </div>

        {/* Description */}
        {variant === "default" && (
          <p className="font-mono text-sm text-text-secondary mt-3 line-clamp-2">{tool.description}</p>
        )}
      </Link>

      {/* Footer */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border-dim">
        <div className="flex items-center gap-1.5">
          <span className="bg-bg-overlay text-accent-blue text-xs font-mono px-2 py-0.5 rounded-[3px] border border-border-default">
            {tool.category}
          </span>
          <span className="bg-bg-overlay text-accent-blue text-xs font-mono px-2 py-0.5 rounded-[3px] border border-border-default">
            {tool.subcategory}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted text-xs font-mono">
          {tool.tags.slice(0, 2).map((tag) => (
            <Link key={tag} to={`/tag/${tag}`} className="hover:text-accent-blue transition-colors duration-150">
              #{tag}
            </Link>
          ))}
          {tool.tags.length > 2 && <span>+{tool.tags.length - 2}</span>}
        </div>
      </div>
    </div>
  );
}
