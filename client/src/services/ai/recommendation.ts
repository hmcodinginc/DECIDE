import { analyzeDecision } from "@/services/decision/engine";
import type { DecisionRecord } from "@/types/decision";

export function recommend(decision: DecisionRecord) {
  return analyzeDecision(decision);
}
