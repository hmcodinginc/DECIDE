import { Link } from "react-router";
import { PricingCards } from "@/components/pricing/PricingCards";
import { GUEST_ANALYSIS_LIMIT, type PlanId } from "@/config/plans";
import { ROUTES } from "@/config/routes";

interface UpgradePanelProps {
  onSelect: (plan: PlanId) => void;
}

function UpgradePanel({ onSelect }: UpgradePanelProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs tracking-[0.22em] text-gold uppercase">Keep deciding</p>
      <h1 className="font-display mt-3 text-3xl text-balance sm:text-5xl">
        You&apos;ve used all {GUEST_ANALYSIS_LIMIT} free analyses.
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Upgrade to Pro or Premium to keep getting clear recommendations — without
        dark patterns, without nagging.
      </p>
      <div className="mt-10">
        <PricingCards onSelect={onSelect} />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Changed your mind?{" "}
        <Link to={ROUTES.home} className="link-hover text-foreground">
          Back to DECIDE
        </Link>
      </p>
    </div>
  );
}

export { UpgradePanel };
