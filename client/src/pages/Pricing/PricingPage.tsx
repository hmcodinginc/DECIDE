import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Container } from "@/components/common/Container";
import { PricingCards } from "@/components/pricing/PricingCards";
import { ROUTES } from "@/config/routes";
import type { PlanId } from "@/config/plans";
import { track } from "@/lib/product-log";
import { usePageTitle } from "@/hooks/usePageTitle";

function PricingPage() {
  usePageTitle("Pricing — DECIDE");
  const navigate = useNavigate();

  useEffect(() => {
    void track("pricing_viewed");
  }, []);

  const onSelect = (plan: PlanId) => {
    if (plan === "free") {
      void navigate(ROUTES.newDecision);
      return;
    }
    void navigate(`${ROUTES.billing}?plan=${plan}`);
  };

  return (
    <Container className="pt-28 pb-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-xs tracking-[0.22em] text-gold uppercase">Pricing</p>
        <h1 className="font-display mt-3 text-4xl text-balance sm:text-6xl">
          5 free lifetime decisions.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Not 5 a month. Five, ever, on Free. Upgrade when DECIDE becomes a habit.
        </p>
      </div>
      <PricingCards onSelect={onSelect} />
    </Container>
  );
}

export { PricingPage };
