import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import type { PaymentPhase } from "@/hooks/usePaymentVerification";
import { planLabel } from "@/lib/payment-activation";
import type { PlanId } from "@/config/plans";

interface PaymentStatusPanelProps {
  phase: PaymentPhase;
  planId?: PlanId;
  onRetry?: () => void;
  onDismiss?: () => void;
}

function copy(phase: PaymentPhase, planName: string) {
  switch (phase) {
    case "confirming":
      return {
        eyebrow: "Billing",
        title: "Confirming your payment",
        body: "DECIDE is waiting for Razorpay to confirm this subscription. Paid access is not unlocked from the checkout window alone.",
      };
    case "waiting":
      return {
        eyebrow: "Billing",
        title: "Still confirming",
        body: "This usually takes less than a minute after a successful payment. Stay on this page — it will update when the server confirms your plan.",
      };
    case "success":
      return {
        eyebrow: "Subscription confirmed",
        title: `${planName} is active`,
        body: "Your payment is confirmed. You can start a decision with your updated plan.",
      };
    case "failed":
      return {
        eyebrow: "Billing",
        title: "Payment failed",
        body: "Razorpay could not complete this payment. No paid plan was applied. You can try again from Billing.",
      };
    case "past_due":
      return {
        eyebrow: "Billing",
        title: "Payment issue",
        body: "This subscription needs attention. Paid access is paused until Razorpay restores it. You can return to Billing and try again if checkout is offered.",
      };
    case "cancelled":
      return {
        eyebrow: "Billing",
        title: "Checkout cancelled",
        body: "No payment was taken for this attempt. Your current plan is unchanged.",
      };
    case "timedOut":
      return {
        eyebrow: "Billing",
        title: "Still confirming your subscription",
        body: "We have not received final confirmation yet. If you were charged, wait a moment and retry — do not assume the payment failed.",
      };
    default:
      return {
        eyebrow: "Billing",
        title: "Payment status",
        body: "Checking your DECIDE subscription.",
      };
  }
}

function PaymentStatusPanel({ phase, planId, onRetry, onDismiss }: PaymentStatusPanelProps) {
  const planName = planLabel(planId ?? "free");
  const text = copy(phase, planName);
  const retryable = phase === "timedOut" || phase === "failed";

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/8 bg-white/3 px-6 py-10 sm:px-10">
      <p className="text-xs tracking-[0.22em] text-gold uppercase">{text.eyebrow}</p>
      <h1 className="font-display mt-4 text-3xl text-balance sm:text-4xl">{text.title}</h1>
      <p className="mt-4 text-muted-foreground">{text.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {phase === "success" ? (
          <Button asChild>
            <Link to={ROUTES.newDecision}>Make a Decision</Link>
          </Button>
        ) : null}
        {retryable && onRetry ? (
          <Button type="button" onClick={onRetry}>
            Check again
          </Button>
        ) : null}
        {onDismiss ? (
          <Button type="button" variant="outline" onClick={onDismiss}>
            Back to billing
          </Button>
        ) : (
          <Button asChild variant={phase === "success" ? "outline" : "default"}>
            <Link to={ROUTES.billing}>Back to billing</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export { PaymentStatusPanel };
