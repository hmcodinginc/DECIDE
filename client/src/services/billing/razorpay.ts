import { getPlan, type PlanId } from "@/config/plans";
import { supabase } from "@/lib/supabase/client";
import type { CheckoutSession } from "@/types/billing";

export const billingService = {
  async createCheckout(plan: Exclude<PlanId, "free">): Promise<CheckoutSession> {
    if (!supabase) throw new Error("Billing is not connected yet.");
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { plan },
    });
    if (error) throw error;
    return data as CheckoutSession;
  },

  describe(plan: PlanId) {
    return getPlan(plan);
  },
};
