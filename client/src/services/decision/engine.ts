import { ENGINE_VERSION } from "@/config/plans";
import { createId, nowIso } from "@/lib/format";
import type {
  Confidence,
  DecisionCriterion,
  DecisionRecord,
  DecisionResult,
  OptionRating,
  ScoredOption,
  WhatIf,
} from "@/types/decision";

const RELATIVE_SCORE: Record<OptionRating["relative"], number> = {
  best: 9,
  similar: 6.5,
  weaker: 4,
  unset: 5,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function priceOf(option: DecisionRecord["options"][number]): number | null {
  const value = option.attributes.price;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function autoPriceScore(
  option: DecisionRecord["options"][number],
  options: DecisionRecord["options"],
): number | null {
  const prices = options
    .map(priceOf)
    .filter((value): value is number => value !== null);
  const mine = priceOf(option);
  if (mine === null || prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return 7;
  return round1(10 - ((mine - min) / (max - min)) * 8);
}

function scoreFor(
  optionId: string,
  criterion: DecisionCriterion,
  ratings: OptionRating[],
  options: DecisionRecord["options"],
): number {
  const rating = ratings.find(
    (item) => item.optionId === optionId && item.criterionId === criterion.id,
  );
  if (rating && rating.relative !== "unset") {
    return RELATIVE_SCORE[rating.relative];
  }
  if (criterion.kind === "cost") {
    const option = options.find((item) => item.id === optionId);
    if (option) {
      const auto = autoPriceScore(option, options);
      if (auto !== null) return auto;
    }
  }
  return 5;
}

function scoreOptions(decision: DecisionRecord): ScoredOption[] {
  const activeCriteria = decision.criteria.filter((item) => item.weight > 0);
  const weightSum = activeCriteria.reduce((sum, item) => sum + item.weight, 0) || 1;

  return decision.options.map((option) => {
    const overBudget =
      decision.constraints.maxBudget !== null &&
      priceOf(option) !== null &&
      (priceOf(option) as number) > decision.constraints.maxBudget;

    const breakdown = activeCriteria.map((criterion) => {
      const raw = scoreFor(option.id, criterion, decision.ratings, decision.options);
      return {
        criterionId: criterion.id,
        label: criterion.label,
        kind: criterion.kind,
        weight: criterion.weight,
        raw,
        weighted: (raw * criterion.weight) / weightSum,
      };
    });

    const total = breakdown.reduce((sum, item) => sum + item.weighted, 0);

    return {
      optionId: option.id,
      name: option.name,
      total: round1(clamp(total, 0, 10)),
      breakdown,
      disqualified: overBudget,
      disqualifyReason: overBudget
        ? `Over your ₹${decision.constraints.maxBudget?.toLocaleString("en-IN")} budget`
        : undefined,
    };
  });
}

function eligible(scores: ScoredOption[]) {
  const kept = scores.filter((item) => !item.disqualified);
  return kept.length > 0 ? kept : scores;
}

function pickWinner(scores: ScoredOption[]): ScoredOption | null {
  const pool = eligible(scores);
  if (pool.length === 0) return null;
  return [...pool].sort((a, b) => b.total - a.total)[0] ?? null;
}

function confidenceOf(decision: DecisionRecord, scores: ScoredOption[]): Confidence {
  if (decision.options.length < 2) return "insufficient";
  const rated = decision.ratings.filter((item) => item.relative !== "unset").length;
  const needed = decision.options.length * decision.criteria.length;
  const coverage = needed === 0 ? 0 : rated / needed;
  const pool = eligible(scores);
  if (pool.length < 2) return coverage > 0.4 ? "medium" : "low";
  const ranked = [...pool].sort((a, b) => b.total - a.total);
  const spread = (ranked[0]?.total ?? 0) - (ranked[1]?.total ?? 0);
  if (coverage < 0.2 && spread < 0.6) return "insufficient";
  if (coverage >= 0.5 && spread >= 1.2) return "high";
  if (coverage >= 0.25 || spread >= 0.7) return "medium";
  return "low";
}

function whyFor(winner: ScoredOption, runnerUp: ScoredOption | null): string[] {
  const reasons: string[] = [];
  const sorted = [...winner.breakdown].sort((a, b) => b.weighted - a.weighted);
  for (const item of sorted.slice(0, 3)) {
    if (item.raw >= 7) {
      reasons.push(`Strongest on ${item.label.toLowerCase()}`);
    } else if (item.raw >= 5.5) {
      reasons.push(`Solid match for ${item.label.toLowerCase()}`);
    }
  }
  if (runnerUp) {
    const delta = round1(winner.total - runnerUp.total);
    if (delta >= 0.4) {
      reasons.push(`Better overall fit than ${runnerUp.name}`);
    }
  }
  if (reasons.length === 0) {
    reasons.push("Best overall match for the priorities you set");
  }
  return [...new Set(reasons)].slice(0, 4);
}

function tradeoffFor(
  winner: ScoredOption,
  others: ScoredOption[],
): DecisionResult["tradeoff"] {
  const rival = others.find((item) => item.optionId !== winner.optionId);
  if (!rival) return null;
  const weak = [...winner.breakdown]
    .filter((item) => {
      const other = rival.breakdown.find((row) => row.criterionId === item.criterionId);
      return other ? other.raw - item.raw >= 1.2 : false;
    })
    .sort((a, b) => {
      const otherA = rival.breakdown.find((row) => row.criterionId === a.criterionId);
      const otherB = rival.breakdown.find((row) => row.criterionId === b.criterionId);
      return (otherB?.raw ?? 0) - b.raw - ((otherA?.raw ?? 0) - a.raw);
    })[0];
  const strong = [...winner.breakdown]
    .filter((item) => {
      const other = rival.breakdown.find((row) => row.criterionId === item.criterionId);
      return other ? item.raw - other.raw >= 0.8 : item.raw >= 7;
    })
    .sort((a, b) => b.raw - a.raw)[0];

  if (!weak && !strong) return null;
  return {
    givingUp: weak
      ? `${rival.name} is stronger on ${weak.label.toLowerCase()}`
      : `${rival.name} may feel closer on a few details`,
    gaining: strong
      ? `you gain a better fit on ${strong.label.toLowerCase()}`
      : `you gain a better overall match for what you said matters`,
  };
}

function whatIfFor(decision: DecisionRecord, currentWinnerId: string | null): WhatIf[] {
  return decision.criteria
    .filter((item) => item.weight > 0)
    .map((criterion) => {
      const boosted: DecisionRecord = {
        ...decision,
        criteria: decision.criteria.map((item) =>
          item.id === criterion.id
            ? { ...item, weight: Math.min(10, item.weight * 2.4 + 1.5) }
            : item,
        ),
      };
      const winner = pickWinner(scoreOptions(boosted));
      return {
        criterionId: criterion.id,
        label: criterion.label,
        wouldRecommendOptionId: winner?.optionId ?? "",
        optionName: winner?.name ?? "",
        changesRecommendation: Boolean(
          winner && currentWinnerId && winner.optionId !== currentWinnerId,
        ),
      };
    })
    .filter((item) => item.changesRecommendation);
}

function missingFor(decision: DecisionRecord, confidence: Confidence): string[] {
  const missing: string[] = [];
  if (decision.options.length < 2) missing.push("At least two options to compare");
  const named = decision.options.filter((item) => item.name.trim().length > 0);
  if (named.length < decision.options.length) missing.push("A name for each option");
  const rated = decision.ratings.some((item) => item.relative !== "unset");
  const priced = decision.options.some((item) => priceOf(item) !== null);
  if (!rated && !priced) {
    missing.push("Which option is stronger on each thing that matters — or prices, so DECIDE can weigh cost");
  }
  if (confidence === "insufficient") {
    missing.push("A bit more contrast between the options");
  }
  return missing;
}

export function analyzeDecision(decision: DecisionRecord): DecisionResult {
  const scores = scoreOptions(decision);
  const winner = pickWinner(scores);
  const ranked = [...eligible(scores)].sort((a, b) => b.total - a.total);
  const runnerUp = ranked.find((item) => item.optionId !== winner?.optionId) ?? null;
  const confidence = confidenceOf(decision, scores);

  return {
    recommendedOptionId: winner?.optionId ?? null,
    scores: [...scores].sort((a, b) => {
      if (a.disqualified !== b.disqualified) return a.disqualified ? 1 : -1;
      return b.total - a.total;
    }),
    confidence,
    why: winner ? whyFor(winner, runnerUp) : [],
    tradeoff: winner ? tradeoffFor(winner, scores) : null,
    whatIf: whatIfFor(decision, winner?.optionId ?? null),
    missing: missingFor(decision, confidence),
    engineVersion: ENGINE_VERSION,
    createdAt: nowIso(),
  };
}

export function createDraft(question = ""): DecisionRecord {
  const timestamp = nowIso();
  return {
    id: createId(),
    userId: null,
    question,
    status: "draft",
    options: [],
    criteria: [],
    ratings: [],
    constraints: {
      maxBudget: null,
      currency: "INR",
      mustHaves: [],
      dealBreakers: [],
    },
    result: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function emptyOption(sortOrder: number): DecisionRecord["options"][number] {
  return {
    id: createId(),
    name: "",
    description: "",
    url: "",
    images: [],
    attributes: {},
    notes: "",
    sortOrder,
  };
}

export function setRating(
  ratings: OptionRating[],
  criterionId: string,
  optionId: string,
  relative: OptionRating["relative"],
  optionIds: string[],
): OptionRating[] {
  const next = ratings.filter((item) => item.criterionId !== criterionId);
  if (relative === "unset") return next;
  if (relative === "similar") {
    return [
      ...next,
      ...optionIds.map((id) => ({
        optionId: id,
        criterionId,
        relative: "similar" as const,
        score: RELATIVE_SCORE.similar,
      })),
    ];
  }
  return [
    ...next,
    ...optionIds.map((id) => ({
      optionId: id,
      criterionId,
      relative: id === optionId ? ("best" as const) : ("weaker" as const),
      score: id === optionId ? RELATIVE_SCORE.best : RELATIVE_SCORE.weaker,
    })),
  ];
}
