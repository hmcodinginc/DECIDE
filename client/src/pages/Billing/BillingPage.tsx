import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Container } from "@/components/common/Container";
import { UpgradePanel } from "@/components/billing/UpgradePanel";
import { PricingCards } from "@/components/pricing/PricingCards";
import { type PlanId } from "@/config/plans";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { authHref, billingPathForPlan, rememberAuthNext } from "@/lib/auth-next";
import {
  clearForeignPendingCheckout,
  clearPendingCheckout,
  setPendingCheckout,
  type PaidCheckoutPlan,
} from "@/lib/checkout-session";
import { planLabel } from "@/lib/payment-activation";
import { billingService } from "@/services/billing/razorpay";
import { track } from "@/lib/product-log";

type RazorpayCheckoutResponse = {
  razorpay_payment_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
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

function statusCopy(status: string) {
  switch (status) {
    case "active":
      return null;
    case "past_due":
      return "This subscription has a payment issue. Paid access is paused until Razorpay restores it.";
    case "cancelled":
      return "This subscription is cancelled. You can start a new checkout below.";
    case "expired":
      return "This subscription has ended. You can start a new checkout below.";
    default:
      return null;
  }
}

function BillingPage() {
  const { user, loading } = useAuth();
  const { entitlement, refresh } = useEntitlements();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reason = params.get("reason");
  const notice = params.get("checkout");
  const requestedPlan = params.get("plan");
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const autoStarted = useRef(false);

  useEffect(() => {
    void track("pricing_viewed");
  }, []);

  const redirectToAuth = (plan?: PaidCheckoutPlan) => {
    const next = plan ? billingPathForPlan(plan) : ROUTES.billing;
    rememberAuthNext(next);
    void navigate(authHref("login", next), { replace: true });
  };

  const checkout = async (plan: PlanId) => {
    if (plan === "free") {
      void navigate(ROUTES.newDecision);
      return;
    }
    if (loading) return;
    if (!user) {
      redirectToAuth(plan);
      return;
    }
    const paidPlan = plan as PaidCheckoutPlan;
    let settled = false;
    setError(null);
    setOpening(true);
    try {
      void track("checkout_started");
      setPendingCheckout({ planId: paidPlan, userId: user.id });
      const session = await billingService.createCheckout(paidPlan);
      if (!session.subscriptionId || !session.keyId) {
        throw new Error("Checkout session could not be created.");
      }
      await loadRazorpay();
      if (!window.Razorpay) throw new Error("Razorpay is unavailable.");
      const razorpay = new window.Razorpay({
        key: session.keyId,
        subscription_id: session.subscriptionId,
        name: "DECIDE",
        description: session.description,
        prefill: { email: session.prefillEmail ?? user.email },
        theme: { color: "#E8C98A" },
        handler: (_response: RazorpayCheckoutResponse) => {
          settled = true;
          void navigate(`${ROUTES.billingReturn}?checkout=success`);
        },
        modal: {
          ondismiss: () => {
            if (settled) return;
            clearPendingCheckout();
            setOpening(false);
            void navigate(`${ROUTES.billing}?checkout=cancelled`, { replace: true });
          },
        },
      });
      razorpay.on("payment.failed", () => {
        settled = true;
        void navigate(`${ROUTES.billingReturn}?checkout=failed`);
      });
      razorpay.open();
    } catch (caught) {
      clearPendingCheckout();
      setOpening(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "Couldn't start checkout. Try again.",
      );
    }
  };

  useEffect(() => {
    if (loading || !user) return;
    clearForeignPendingCheckout(user.id);
    void refresh();
    if (notice === "cancelled" || notice === "canceled") return;
    if (requestedPlan !== "pro" && requestedPlan !== "premium") return;
    if (autoStarted.current) return;
    autoStarted.current = true;
    void navigate(ROUTES.billing, { replace: true });
    void checkout(requestedPlan);
    // Auto-start checkout once after the authenticated session is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id, requestedPlan, notice]);

  const issue = entitlement ? statusCopy(entitlement.status) : null;

  return (
    <Container className="pt-28 pb-24">
      {reason === "limit" ? (
        <UpgradePanel onSelect={(plan) => void checkout(plan)} />
      ) : (
        <>
          <h1 className="font-display text-3xl sm:text-4xl">Billing</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Plans are billed in Indian Rupees. Paid access is confirmed on the
            server after Razorpay notifies DECIDE — never from the checkout window alone.
          </p>
          {notice === "cancelled" || notice === "canceled" ? (
            <p className="mt-6 text-sm text-gold">
              Checkout cancelled. No payment was taken. You can try again anytime.
            </p>
          ) : null}
          {entitlement ? (
            <div className="mt-8 rounded-3xl border border-white/8 p-6">
              <p className="text-xs tracking-[0.18em] text-gold uppercase">
                Current
              </p>
              <p className="mt-2 text-lg font-medium">{planLabel(entitlement.plan)}</p>
              <p className="mt-1 text-sm capitalize text-muted-foreground">
                Status: {entitlement.status.replaceAll("_", " ")}
              </p>
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
              {issue ? <p className="mt-3 text-sm text-red-300">{issue}</p> : null}
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
      {opening ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Opening checkout… after you pay, DECIDE confirms the plan from Razorpay.
        </p>
      ) : null}
      {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}
    </Container>
  );
}

export { BillingPage };
