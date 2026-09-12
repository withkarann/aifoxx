import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { allTools } from "@/lib/tools";
import { getAvailablePricingOptions } from "@/lib/tool-filters";

interface FilterBarProps {
  /** Pricing models currently selected. Empty means all. */
  activePricing: string[];
  onTogglePricing: (pricing: string) => void;
  freeTierOnly: boolean;
  onFreeTierChange: (value: boolean) => void;
  activeFilterCount: number;
  onClearAll: () => void;
}

export function FilterBar({
  activePricing,
  onTogglePricing,
  freeTierOnly,
  onFreeTierChange,
  activeFilterCount,
  onClearAll,
}: FilterBarProps) {
  // Built from the catalog so a model that no tool uses is never offered.
  const pricingOptions = useMemo(() => getAvailablePricingOptions(allTools), []);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="font-mono text-xs text-text-muted shrink-0">PRICING:</span>

      <div className="flex flex-wrap gap-1.5 min-w-0">
        {pricingOptions.map((p) => {
          const isActive = activePricing.includes(p);
          return (
            <button
              key={p}
              type="button"
              aria-pressed={isActive}
              onClick={() => onTogglePricing(p)}
              className={cn(
                "font-mono text-xs px-2.5 py-1 rounded-[4px] whitespace-nowrap transition-all duration-150",
                "inline-flex items-center min-h-[24px]",
                isActive
                  ? "bg-accent-green text-primary-foreground font-semibold"
                  : "bg-bg-overlay border border-border-default text-text-secondary hover:text-text-primary"
              )}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Kept separate from the pricing chips: a paid tool can still offer a
          free tier, so folding this into "Free" would mix two questions. */}
      <label
        className={cn(
          "flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-[4px] cursor-pointer transition-all duration-150",
          freeTierOnly
            ? "bg-accent-green text-primary-foreground font-semibold"
            : "bg-bg-overlay border border-border-default text-text-secondary hover:text-text-primary"
        )}
      >
        <input
          type="checkbox"
          checked={freeTierOnly}
          onChange={(e) => onFreeTierChange(e.target.checked)}
          className="h-3 w-3 accent-current"
        />
        Has free tier
      </label>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-mono text-xs text-text-muted">
            {activeFilterCount} active
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="font-mono text-xs text-accent-green hover:underline transition-colors duration-150"
          >
            CLEAR_ALL
          </button>
        </div>
      )}
    </div>
  );
}
