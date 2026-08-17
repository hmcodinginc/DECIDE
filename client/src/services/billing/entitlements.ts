import { GUEST_ANALYSIS_LIMIT, getPlan, type PlanId } from "@/config/plans";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { localDecisionStore } from "@/services/decision/local-store";
import type { Entitlement } from "@/types/billing";

const UNLIMITED: Entitlement = {
  plan: "premium",
  status: "active",
  remaining: null,
  limit: null,
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

  if (!supabase || !isSupabaseConfigured) return UNLIMITED;

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
    localDecisionStore.incrementGuestAnalyses();
    return getEntitlement(null);
  }
  if (!supabase || !isSupabaseConfigured) return UNLIMITED;
  const { data, error } = await supabase.rpc("try_consume_decision", {
    p_decision_id: decisionId,
  });
  if (error) throw error;
  const row = data as { allowed: boolean; remaining: number | null; plan: PlanId; message?: string };
  if (!row.allowed) {
    const error = new Error(row.message ?? "You've used your free decisions.");
    (error as Error & { code: string }).code = "LIMIT_REACHED";
    throw error;
  }
  return getEntitlement(userId);
}

export function planCopy(plan: PlanId) {
  return getPlan(plan);
}
