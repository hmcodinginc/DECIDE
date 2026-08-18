import { GUEST_ANALYSIS_LIMIT, getPlan, type PlanId } from "@/config/plans";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { localDecisionStore } from "@/services/decision/local-store";
import type { Entitlement } from "@/types/billing";

export class LimitReachedError extends Error {
  code = "LIMIT_REACHED" as const;
  constructor(message = "You've used your free decisions.") {
    super(message);
    this.name = "LimitReachedError";
  }
}

const LOCAL_DEV_OPEN: Entitlement = {
  plan: "free",
  status: "none",
  remaining: null,
  limit: 5,
  periodEnd: null,
  canAnalyze: true,
};

export async function getEntitlement(userId: string | null): Promise<Entitlement> {
  if (!userId) {
    const used = localDecisionStore.guestAnalyses();
    const remaining = Math.max(0, GUEST_ANALYSIS_LIMIT - used);
    return {
      plan: "free",
      status: "none",
      remaining,
      limit: GUEST_ANALYSIS_LIMIT,
      periodEnd: null,
      canAnalyze: remaining > 0,
    };
  }

  if (!supabase || !isSupabaseConfigured) return LOCAL_DEV_OPEN;

  const { data, error } = await supabase.rpc("get_entitlement");
  if (error) throw error;
  const row = data as {
    plan: PlanId;
    status: Entitlement["status"];
    remaining: number | null;
    limit: number | null;
    period_end: string | null;
    can_analyze: boolean;
  };
  return {
    plan: row.plan,
    status: row.status,
    remaining: row.remaining,
    limit: row.limit,
    periodEnd: row.period_end,
    canAnalyze: row.can_analyze,
  };
}

export async function consumeAnalysis(userId: string | null, decisionId: string) {
  if (!userId) {
    localDecisionStore.consumeGuestAnalysis(decisionId);
    return;
  }
  if (!supabase || !isSupabaseConfigured) return;
  const { data, error } = await supabase.rpc("try_consume_decision", {
    p_decision_id: decisionId,
  });
  if (error) throw error;
  if (!data) {
    throw new Error("We couldn't record this decision. Try again.");
  }
  const row = data as {
    allowed: boolean;
    remaining: number | null;
    plan: PlanId;
    message?: string;
  };
  if (!row.allowed) {
    throw new LimitReachedError(
      row.message ?? "You've used your free decisions.",
    );
  }
}

export function planCopy(plan: PlanId) {
  return getPlan(plan);
}
