import { type Pricing } from "@/types/tool";
import { cn } from "@/lib/utils";

const pricingClassByType: Record<Pricing, string> = {
  Free: "pricing-free",
  Freemium: "pricing-freemium",
  Paid: "pricing-paid",
  "Open Source": "pricing-open-source",
  "Usage Based": "pricing-usage-based",
  "Contact Sales": "pricing-contact-sales",
  "Pay-as-you-go": "pricing-usage-based",
};

interface PricingBadgeProps {
  pricing: Pricing;
  className?: string;
}

export function PricingBadge({ pricing, className }: PricingBadgeProps) {
  return (
    <span
      className={cn(
        "pricing-badge font-mono text-xs px-2 py-0.5 rounded-[3px] border whitespace-nowrap",
        pricingClassByType[pricing],
        className
      )}
    >
      {pricing}
    </span>
  );
}
