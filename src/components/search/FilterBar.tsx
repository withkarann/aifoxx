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

      {/* Mobile: native multi-select for reliable touch interactions */}
      <select
        multiple
        value={activePricing}
        onChange={(e) => {
          const chosen = [...e.target.selectedOptions].map((o) => o.value);
          // Reconcile the browser's whole-list selection with the toggle API.
          pricingOptions.forEach((p) => {
            const wasOn = activePricing.includes(p);
            const isOn = chosen.includes(p);
            if (wasOn !== isOn) onTogglePricing(p);
          });
        }}
        aria-label="Filter tools by pricing model"
        size={Math.min(pricingOptions.length, 5)}
        className="sm:hidden bg-bg-overlay border border-border-default rounded-[4px] px-2.5 py-1 font-mono text-xs text-text-primary"
      >
        {pricingOptions.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <div className="hidden sm:flex flex-wrap gap-1.5 min-w-0">
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
