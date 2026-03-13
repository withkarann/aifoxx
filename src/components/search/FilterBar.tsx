import { cn } from "@/lib/utils";
import type { Pricing } from "@/types/tool";

const PRICING_OPTIONS: Pricing[] = ["Free", "Freemium", "Paid", "Open Source"];

interface FilterBarProps {
  activePricing: string;
  onPricingChange: (pricing: string) => void;
  activeFilterCount: number;
  onClearAll: () => void;
}

export function FilterBar({
  activePricing,
  onPricingChange,
  activeFilterCount,
  onClearAll,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="font-mono text-xs text-text-muted shrink-0">PRICING:</span>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {PRICING_OPTIONS.map((p) => {
          const isActive = activePricing === p;
          return (
            <button
              key={p}
              onClick={() => onPricingChange(isActive ? "" : p)}
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

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-mono text-xs text-text-muted">
            {activeFilterCount} active
          </span>
          <button
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
