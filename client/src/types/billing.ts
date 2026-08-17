import type { PlanId } from "@/config/plans";

export const SUBSCRIPTION_STATUS = {
  none: "none",
  active: "active",
  cancelled: "cancelled",
  expired: "expired",
  past_due: "past_due",
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export interface Entitlement {
  plan: PlanId;
  status: SubscriptionStatus;
  remaining: number | null;
  limit: number | null;
  periodEnd: string | null;
  canAnalyze: boolean;
}

export interface CheckoutSession {
  keyId: string;
  subscriptionId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  name: string;
  description: string;
  prefillEmail?: string;
}
