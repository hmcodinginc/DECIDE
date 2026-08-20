import { useCallback, useEffect, useRef, useState } from "react";
import type { PendingCheckout } from "@/lib/checkout-session";
import {
  entitlementMatchesPurchase,
  isConfirmationBlocked,
  isPaymentIssue,
} from "@/lib/payment-activation";
import { getEntitlement } from "@/services/billing/entitlements";
import type { Entitlement } from "@/types/billing";

export type PaymentPhase =
  | "idle"
  | "confirming"
  | "waiting"
  | "success"
  | "failed"
  | "past_due"
  | "cancelled"
  | "timedOut";

const POLL_MS = 2_000;
const WINDOW_MS = 90_000;

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

function usePaymentVerification(input: {
  userId: string;
  pending: PendingCheckout | null;
  active: boolean;
}) {
  const [phase, setPhase] = useState<PaymentPhase>("idle");
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [attempt, setAttempt] = useState(0);
  const startedAtRef = useRef(0);

  const pendingPlanId = input.pending?.planId ?? "";

  useEffect(() => {
    if (!input.active || !input.userId) {
      setPhase("idle");
      return;
    }

    startedAtRef.current = Date.now();
    const abort = new AbortController();
    let disposed = false;
    const pending = input.pending;

    async function poll() {
      setPhase("confirming");
      while (!disposed && !abort.signal.aborted) {
        const elapsed = Date.now() - startedAtRef.current;
        const snapshot = await getEntitlement(input.userId).catch(() => null);
        if (disposed || abort.signal.aborted) return;
        if (snapshot) setEntitlement(snapshot);

        if (isConfirmationBlocked(snapshot)) {
          setPhase("cancelled");
          return;
        }
        if (isPaymentIssue(snapshot)) {
          setPhase("past_due");
          return;
        }
        if (entitlementMatchesPurchase(snapshot, pending)) {
          setPhase("success");
          return;
        }

        if (elapsed >= WINDOW_MS) {
          setPhase("timedOut");
          return;
        }

        setPhase(elapsed < 8_000 ? "confirming" : "waiting");
        await sleep(POLL_MS, abort.signal);
      }
    }

    void poll();
    return () => {
      disposed = true;
      abort.abort();
    };
  }, [attempt, input.active, input.userId, pendingPlanId]);

  const retry = useCallback(() => {
    startedAtRef.current = Date.now();
    setPhase("confirming");
    setAttempt((value) => value + 1);
  }, []);

  return { phase, entitlement, retry };
}

export { usePaymentVerification };
