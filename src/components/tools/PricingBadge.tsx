import { type Pricing } from "@/types/tool";
import { cn } from "@/lib/utils";

const pricingStyles: Record<Pricing, string> = {
  Free: "text-accent-green bg-accent-green/10 border-accent-green/30",
  Freemium: "text-accent-amber bg-accent-amber/10 border-accent-amber/30",
  Paid: "text-accent-red bg-accent-red/10 border-accent-red/30",
  "Open Source": "text-accent-purple bg-accent-purple/10 border-accent-purple/30",
  "Usage Based": "text-accent-blue bg-accent-blue/10 border-accent-blue/30",
  "Contact Sales": "text-text-muted bg-text-muted/10 border-text-muted/30",
};

interface PricingBadgeProps {
  pricing: Pricing;
  className?: string;
}

export function PricingBadge({ pricing, className }: PricingBadgeProps) {
  return (
    <span
      className={cn(
        "font-mono text-xs px-2 py-0.5 rounded-[3px] font-semibold border whitespace-nowrap",
        pricingStyles[pricing],
        className
      )}
    >
      {pricing}
    </span>
  );
}
