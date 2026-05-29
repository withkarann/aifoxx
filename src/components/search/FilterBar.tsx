import { cn } from "@/lib/utils";
import type { Pricing } from "@/types/tool";

const PRICING_OPTIONS: Pricing[] = [
  "Free",
  "Freemium",
  "Paid",
  "Open Source",
  "Usage Based",
  "Contact Sales",
  "Pay-as-you-go",
];

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

      {/* Mobile: native select for reliable touch interactions */}
      <select
        value={activePricing}
        onChange={(e) => onPricingChange(e.target.value)}
        aria-label="Filter tools by pricing"
        className="sm:hidden bg-bg-overlay border border-border-default rounded-[4px] px-2.5 py-1 font-mono text-xs text-text-primary"
      >
        <option value="">ALL PRICING</option>
        {PRICING_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <div className="hidden sm:flex flex-wrap gap-1.5 min-w-0">
        {PRICING_OPTIONS.map((p) => {
          const isActive = activePricing === p;
          return (
            <button
              key={p}
              type="button"
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
