import { getPlan, type PlanId } from "@/config/plans";
import { toUserMessage } from "@/lib/errors";
import {
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase/config";
import { authService } from "@/services/auth/auth-service";
import type { CheckoutSession } from "@/types/billing";

function isGatewayJwtRejection(status: number, body: string): boolean {
  const lower = body.toLowerCase();
  return (
    status === 401 &&
    (lower.includes("invalid jwt") ||
      lower.includes("unauthorized_legacy_jwt") ||
      lower.includes("authentication failed"))
  );
}

export const billingService = {
  async createCheckout(plan: Exclude<PlanId, "free">): Promise<CheckoutSession> {
    if (plan !== "pro" && plan !== "premium") {
      throw new Error("Unknown plan");
    }
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Billing is not connected yet.");
    }

    const prepared = await authService.prepareCheckoutAuth();
    if (!prepared) {
      throw new Error(
        "Couldn't confirm your session for checkout. Stay signed in and try again.",
      );
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${prepared.accessToken}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ plan }),
    });

    const raw = await response.text();
    let parsed: unknown = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }
    const errorMessage =
      parsed && typeof parsed === "object" && "error" in parsed
        ? String((parsed as { error?: unknown }).error ?? "")
        : parsed && typeof parsed === "object" && "message" in parsed
          ? String((parsed as { message?: unknown }).message ?? "")
          : raw;

    if (!response.ok) {
      if (isGatewayJwtRejection(response.status, `${errorMessage} ${raw}`)) {
        throw new Error(
          `Checkout was rejected by the billing function (${response.status}). ${errorMessage || "Invalid JWT at the gateway."}`,
        );
      }
      if (response.status === 401) {
        throw new Error(
          `Checkout was rejected by the billing function (${response.status}). ${errorMessage || "Authentication required."}`,
        );
      }
      throw new Error(
        toUserMessage(errorMessage || raw, "Couldn't start checkout. Try again."),
      );
    }

    if (parsed && typeof parsed === "object" && "error" in parsed) {
      const message = String((parsed as { error?: unknown }).error ?? "");
      if (message) {
        throw new Error(toUserMessage(message, "Couldn't start checkout. Try again."));
      }
    }

    return parsed as CheckoutSession;
  },

  describe(plan: PlanId) {
    return getPlan(plan);
  },
};
