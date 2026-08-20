import type { PlanId } from "@/config/plans";

const STORAGE_KEY = "decide:checkout-pending";

export type PaidCheckoutPlan = Exclude<PlanId, "free">;

export type PendingCheckout = {
  planId: PaidCheckoutPlan;
  userId: string;
};

export function setPendingCheckout(pending: PendingCheckout) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

export function readPendingCheckout(userId: string): PendingCheckout | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingCheckout;
    if (!parsed?.planId || parsed.userId !== userId) return null;
    if (parsed.planId !== "pro" && parsed.planId !== "premium") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Drop checkout state that belongs to a different DECIDE user. */
export function clearForeignPendingCheckout(userId: string) {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as PendingCheckout;
    if (parsed?.userId !== userId) clearPendingCheckout();
  } catch {
    clearPendingCheckout();
  }
}

export function bindCheckoutToAuthUser(
  previousUserId: string | null,
  nextUserId: string | null,
) {
  if (!nextUserId || (previousUserId && previousUserId !== nextUserId)) {
    clearPendingCheckout();
    return;
  }
  clearForeignPendingCheckout(nextUserId);
}
