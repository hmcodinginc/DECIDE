import { Link } from "react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/config/plans";
import { ROUTES } from "@/config/routes";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
  onSelect?: (plan: PlanId) => void;
  currentPlan?: PlanId;
}

function PricingCards({ onSelect, currentPlan }: PricingCardsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PLANS.map((plan) => {
        const isCurrent = currentPlan === plan.id;
        return (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-3xl border p-5 sm:p-7",
              plan.featured
                ? "border-gold/35 bg-gold-soft shadow-[0_0_80px_-30px_oklch(0.86_0.09_82)]"
                : "border-white/8 bg-white/3",
            )}
          >
            <p className="text-xs tracking-[0.2em] text-gold uppercase">
              {plan.name}
            </p>
            <p className="font-display mt-4 text-4xl">
              {plan.priceMonthlyInr === 0 ? "₹0" : formatInr(plan.priceMonthlyInr)}
              {plan.period === "month" ? (
                <span className="text-base text-muted-foreground">/month</span>
              ) : null}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{plan.blurb}</p>
            <p className="mt-4 text-sm font-medium">
              {plan.decisionsPerPeriod === null
                ? "Unlimited decisions"
                : plan.period === "lifetime"
                  ? `${plan.decisionsPerPeriod} lifetime decisions`
                  : `${plan.decisionsPerPeriod} decisions per month`}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {plan.highlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-4 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {plan.id === "free" ? (
                <Button asChild variant="outline" className="w-full">
                  <Link to={ROUTES.newDecision}>Start free</Link>
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={plan.featured ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => onSelect?.(plan.id)}
                >
                  {isCurrent
                    ? "Current plan"
                    : onSelect
                      ? `Choose ${plan.name}`
                      : `Get ${plan.name}`}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { PricingCards };
