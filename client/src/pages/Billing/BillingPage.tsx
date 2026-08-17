import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Container } from "@/components/common/Container";
import { UpgradePanel } from "@/components/billing/UpgradePanel";
import { PricingCards } from "@/components/pricing/PricingCards";
import { Button } from "@/components/ui/button";
import { type PlanId } from "@/config/plans";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { billingService } from "@/services/billing/razorpay";
import { track } from "@/lib/product-log";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

async function loadRazorpay() {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Couldn't load Razorpay."));
    document.body.appendChild(script);
  });
}

function BillingPage() {
  const { user } = useAuth();
  const { entitlement, refresh } = useEntitlements();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reason = params.get("reason");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void track("pricing_viewed");
  }, []);

  const checkout = async (plan: PlanId) => {
    if (plan === "free") {
      void navigate(ROUTES.newDecision);
      return;
    }
    if (!user) {
      void navigate(`${ROUTES.login}?next=${encodeURIComponent(`${ROUTES.billing}?plan=${plan}`)}`);
      return;
    }
    setError(null);
    setPending(true);
    try {
      void track("checkout_started");
      const session = await billingService.createCheckout(plan);
      await loadRazorpay();
      if (!window.Razorpay) throw new Error("Razorpay is unavailable.");
      const razorpay = new window.Razorpay({
        key: session.keyId,
        subscription_id: session.subscriptionId,
        order_id: session.orderId,
        name: "DECIDE",
        description: session.description,
        prefill: { email: session.prefillEmail ?? user.email },
        theme: { color: "#E8C98A" },
        handler: () => {
          void refresh();
          setPending(false);
          setError(null);
        },
      });
      razorpay.open();
    } catch (caught) {
      setError((caught as Error).message);
      setPending(false);
    }
  };

  useEffect(() => {
    const plan = params.get("plan");
    if (plan === "pro" || plan === "premium") {
      void checkout(plan);
    }
    // Start checkout only from the query string on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container className="pt-28 pb-24">
      {reason === "limit" ? (
        <UpgradePanel onSelect={(plan) => void checkout(plan)} />
      ) : (
        <>
          <h1 className="font-display text-4xl">Billing</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Plans are billed in Indian Rupees. Payment is confirmed on the
            server — this page never trusts a frontend success event alone.
          </p>
          {entitlement ? (
            <div className="mt-8 rounded-3xl border border-white/8 p-6">
              <p className="text-xs tracking-[0.18em] text-gold uppercase">
                Current
              </p>
              <p className="mt-2 text-lg font-medium capitalize">{entitlement.plan}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {entitlement.remaining === null
                  ? "Unlimited decisions"
                  : `${entitlement.remaining} remaining of ${entitlement.limit ?? "—"}${
                      entitlement.plan === "free" ? " lifetime" : " this period"
                    }`}
              </p>
              {entitlement.periodEnd ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Period ends {new Date(entitlement.periodEnd).toLocaleDateString("en-IN")}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="mt-10">
            <PricingCards
              currentPlan={entitlement?.plan}
              onSelect={(plan) => void checkout(plan)}
            />
          </div>
        </>
      )}
      {pending ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Opening checkout… after you pay, entitlements update from Razorpay webhooks.
        </p>
      ) : null}
      {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}
      {!user ? (
        <Button asChild className="mt-8" variant="outline">
          <a href={ROUTES.login}>Log in to upgrade</a>
        </Button>
      ) : null}
    </Container>
  );
}

export { BillingPage };
