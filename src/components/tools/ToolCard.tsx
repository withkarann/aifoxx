import { Link, useNavigate } from "react-router-dom";
import { Scale, ShieldCheck } from "lucide-react";
import { type Tool } from "@/types/tool";
import { PricingBadge } from "./PricingBadge";
import { ToolIcon } from "./ToolIcon";
import { getCategoryColor, getCategoryVars } from "@/lib/categoryColors";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { useCompare } from "@/contexts/CompareContext";
import { getTrustBadges } from "@/lib/trust-badges";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  variant?: "default" | "compact";
}

export function ToolCard({ tool, variant = "default" }: ToolCardProps) {
  const navigate = useNavigate();
  const color = getCategoryColor(tool.category);
  const vars = getCategoryVars(tool.category);
  const { isSelected, toggle, isFull } = useCompare();
  const selectedForCompare = isSelected(tool.slug);

  // Number of verified certifications, from the trust assessment when available
  // (same source as the /trust report) so the grid's "Verified" chip matches the
  // detail page; falls back to the legacy sourced-flag count otherwise.
  const badges = getTrustBadges(tool.slug);
  const verifiedCompliance = badges
    ? badges.certs.length
    : (["soc2", "iso27001", "gdpr", "hipaa"] as const).filter(
        (k) => tool.compliance?.[k] === true && tool.compliance_sources?.[k]
      ).length;

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
            <ToolIcon
              name={tool.name}
              slug={tool.slug}
              logoUrl={tool.logo_url}
              websiteUrl={tool.url}
              accent={color.accent}
              className="w-8 h-8"
              letterClassName="text-sm"
            />
            <span className="font-display font-black text-text-primary text-base truncate min-w-0 flex-1 ml-3 block">{tool.name}</span>
          </div>
          <PricingBadge pricing={tool.pricing} />
        </div>

        {/* Description */}
        {variant === "default" && (
          <p className="font-sans text-sm text-text-secondary mt-3 line-clamp-2 break-words min-w-0 leading-snug">{tool.description}</p>
        )}
      </Link>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border-dim flex flex-col gap-2 min-w-0">
        {/* Row 1: Category + Subcategory + compare toggle */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex flex-wrap gap-1.5 min-w-0">
          <span className="cat-chip inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-[3px] shrink-0 max-w-full truncate">
            <span className="inline-flex items-center gap-1">
              {(() => {
                const Icon = getCategoryIcon(tool.category);
                return Icon ? (
                  // getCategoryIcon returns a stable, module-level phosphor component
                  // (see categoryIcons.ts): a fixed reference, not one created during
                  // render, so its state never resets. The rule's heuristic can't tell.
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
          {verifiedCompliance > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-[3px] shrink-0 bg-accent-green/10 border border-accent-green/35 text-accent-green"
              title={`${verifiedCompliance} compliance ${verifiedCompliance === 1 ? "certification" : "certifications"} verified against the vendor's trust page`}
            >
              <ShieldCheck size={11} aria-hidden="true" />
              Verified
            </span>
          )}
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(tool.slug); }}
            aria-label={selectedForCompare ? `Remove ${tool.name} from compare` : `Add ${tool.name} to compare`}
            aria-pressed={selectedForCompare}
            disabled={!selectedForCompare && isFull}
            title={!selectedForCompare && isFull ? "Compare is full (max 3)" : selectedForCompare ? "Remove from compare" : "Add to compare"}
            className={cn(
              // Visible glyph tile stays compact; the surrounding hit area is
              // expanded to a comfortable touch target via min-h/min-w + negative
              // margin so it doesn't change the card's visual spacing.
              "shrink-0 inline-flex items-center justify-center min-w-11 min-h-11 -m-2 rounded-[4px] transition-colors duration-150",
              selectedForCompare
                ? "text-accent-green"
                : "text-text-muted hover:text-text-primary",
              !selectedForCompare && isFull && "opacity-40 cursor-not-allowed"
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center w-7 h-7 rounded-[4px] border",
                selectedForCompare
                  ? "border-accent-green bg-accent-green/10"
                  : "border-border-default"
              )}
            >
              <Scale size={13} />
            </span>
          </button>
        </div>

        {/* Row 2: Tags (max 3 visible; 3rd pill hidden on mobile) */}
        <div className="flex flex-wrap gap-1 min-w-0 overflow-hidden" style={{ maxHeight: '44px' }}>
          {tool.tags.slice(0, 3).map((tag, i) => (
            <span
              key={tag}
              role="link"
              tabIndex={0}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/tag/${tag}`); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/tag/${tag}`);
                }
              }}
              className={cn(
                "tag-pill inline-flex items-center shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-[3px] transition-colors duration-150 whitespace-nowrap cursor-pointer max-w-[120px] truncate",
                i === 2 && "hidden sm:inline-flex"
              )}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
