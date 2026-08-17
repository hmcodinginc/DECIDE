export const DECISION_STATUS = {
  draft: "draft",
  complete: "complete",
} as const;

export type DecisionStatus =
  (typeof DECISION_STATUS)[keyof typeof DECISION_STATUS];

export const CRITERION_KIND = {
  benefit: "benefit",
  cost: "cost",
} as const;

export type CriterionKind =
  (typeof CRITERION_KIND)[keyof typeof CRITERION_KIND];

export const RATING_RELATIVE = {
  best: "best",
  similar: "similar",
  weaker: "weaker",
  unset: "unset",
} as const;

export type RatingRelative =
  (typeof RATING_RELATIVE)[keyof typeof RATING_RELATIVE];

export const CONFIDENCE = {
  high: "high",
  medium: "medium",
  low: "low",
  insufficient: "insufficient",
} as const;

export type Confidence = (typeof CONFIDENCE)[keyof typeof CONFIDENCE];

export interface DecisionOption {
  id: string;
  name: string;
  description: string;
  url: string;
  images: string[];
  attributes: Record<string, string | number | boolean | null>;
  notes: string;
  sortOrder: number;
}

export interface DecisionCriterion {
  id: string;
  key: string;
  label: string;
  weight: number;
  kind: CriterionKind;
}

export interface OptionRating {
  optionId: string;
  criterionId: string;
  relative: RatingRelative;
  score: number;
}

export interface DecisionConstraints {
  maxBudget: number | null;
  currency: "INR";
  mustHaves: string[];
  dealBreakers: string[];
}

export interface ScoreBreakdown {
  criterionId: string;
  label: string;
  kind: CriterionKind;
  weight: number;
  raw: number;
  weighted: number;
}

export interface ScoredOption {
  optionId: string;
  name: string;
  total: number;
  breakdown: ScoreBreakdown[];
  disqualified: boolean;
  disqualifyReason?: string;
}

export interface TradeOff {
  givingUp: string;
  gaining: string;
}

export interface WhatIf {
  criterionId: string;
  label: string;
  wouldRecommendOptionId: string;
  optionName: string;
  changesRecommendation: boolean;
}

export interface DecisionResult {
  recommendedOptionId: string | null;
  scores: ScoredOption[];
  confidence: Confidence;
  why: string[];
  tradeoff: TradeOff | null;
  whatIf: WhatIf[];
  missing: string[];
  engineVersion: string;
  createdAt: string;
}

export interface DecisionRecord {
  id: string;
  userId: string | null;
  question: string;
  status: DecisionStatus;
  options: DecisionOption[];
  criteria: DecisionCriterion[];
  ratings: OptionRating[];
  constraints: DecisionConstraints;
  result: DecisionResult | null;
  createdAt: string;
  updatedAt: string;
}
