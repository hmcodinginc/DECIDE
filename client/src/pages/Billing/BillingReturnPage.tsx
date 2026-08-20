import { useEffect, useMemo, useRef } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { PaymentStatusPanel } from "@/components/billing/PaymentStatusPanel";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { authHref, rememberAuthNext } from "@/lib/auth-next";
import { clearPendingCheckout, readPendingCheckout } from "@/lib/checkout-session";
import { track } from "@/lib/product-log";

function BillingReturnPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const checkout = params.get("checkout");
  const pending = useMemo(
    () => (user ? readPendingCheckout(user.id) : null),
    [user],
  );
  const tracked = useRef(false);

  const outcome = useMemo(() => {
    if (checkout === "cancelled" || checkout === "canceled") return "cancelled" as const;
    if (checkout === "failed" || checkout === "error") return "failed" as const;
    if (checkout === "success") return "success" as const;
    return null;
  }, [checkout]);

  const shouldVerify = outcome === "success" && Boolean(user);

  const { phase, entitlement, retry } = usePaymentVerification({
    userId: user?.id ?? "",
    pending,
    active: shouldVerify,
  });

  useEffect(() => {
    if (phase !== "success" || tracked.current) return;
    tracked.current = true;
    clearPendingCheckout();
    void track("subscription_created");
  }, [phase]);

  if (loading) return null;
  if (!user) {
    const next = `${ROUTES.billingReturn}${window.location.search}`;
    rememberAuthNext(next);
    return <Navigate to={authHref("login", next)} replace />;
  }

  const dismiss = () => {
    clearPendingCheckout();
    void navigate(ROUTES.billing, { replace: true });
  };

  if (outcome === "cancelled") {
    return (
      <Container className="pt-28 pb-24">
        <PaymentStatusPanel phase="cancelled" planId={pending?.planId} onDismiss={dismiss} />
      </Container>
    );
  }

  if (outcome === "failed" && phase !== "success") {
    return (
      <Container className="pt-28 pb-24">
        <PaymentStatusPanel
          phase="failed"
          planId={pending?.planId}
          onRetry={() => {
            void navigate(`${ROUTES.billingReturn}?checkout=success`, { replace: true });
            retry();
          }}
          onDismiss={dismiss}
        />
      </Container>
    );
  }

  return (
    <Container className="pt-28 pb-24">
      <PaymentStatusPanel
        phase={shouldVerify ? phase : "idle"}
        planId={pending?.planId ?? entitlement?.plan}
        onRetry={retry}
        onDismiss={dismiss}
      />
    </Container>
  );
}

export { BillingReturnPage };
