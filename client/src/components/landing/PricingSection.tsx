import { useEffect } from "react";
import { Section } from "@/components/common/Section";
import { PricingCards } from "@/components/pricing/PricingCards";
import { track } from "@/lib/product-log";
import { useNavigate } from "react-router";
import { ROUTES } from "@/config/routes";
import type { PlanId } from "@/config/plans";

function PricingSection() {
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
    <Section
      id="pricing"
      eyebrow="Pricing"
      title="Start free. Keep deciding when you need more."
      description="Free is 5 lifetime analyses — not 5 a month. Pro and Premium are for people who decide often."
    >
      <PricingCards onSelect={onSelect} />
    </Section>
  );
}

export { PricingSection };
