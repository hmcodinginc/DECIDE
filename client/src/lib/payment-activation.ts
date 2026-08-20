import type { PlanId } from "@/config/plans";
import type { PendingCheckout } from "@/lib/checkout-session";
import type { Entitlement } from "@/types/billing";

export function isPaidEntitlementActive(entitlement: Entitlement | null): boolean {
  if (!entitlement) return false;
  return entitlement.status === "active" && entitlement.plan !== "free";
}

export function entitlementMatchesPurchase(
  entitlement: Entitlement | null,
  pending: PendingCheckout | null,
): boolean {
  if (!entitlement || entitlement.status !== "active") return false;
  if (pending) return entitlement.plan === pending.planId;
  return entitlement.plan !== "free";
}

export function isConfirmationBlocked(entitlement: Entitlement | null): boolean {
  if (!entitlement) return false;
  return entitlement.status === "cancelled" || entitlement.status === "expired";
}

export function isPaymentIssue(entitlement: Entitlement | null): boolean {
  return entitlement?.status === "past_due";
}

export function planLabel(plan: PlanId) {
  if (plan === "premium") return "Premium";
  if (plan === "pro") return "Pro";
  return "Free";
}
