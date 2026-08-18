export const PLAN_IDS = {
  free: "free",
  pro: "pro",
  premium: "premium",
} as const;

export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS];

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthlyInr: number;
  decisionsPerPeriod: number | null;
  period: "lifetime" | "month";
  blurb: string;
  highlights: string[];
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthlyInr: 0,
    decisionsPerPeriod: 5,
    period: "lifetime",
    blurb: "Try DECIDE on the decisions that matter.",
    highlights: [
      "5 lifetime decision analyses",
      "Full recommendation & trade-offs",
      "Save decisions after you sign in",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthlyInr: 500,
    decisionsPerPeriod: 25,
    period: "month",
    blurb: "For people who decide often.",
    highlights: [
      "25 decisions every month",
      "Decision history",
      "Recalculate as priorities change",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    priceMonthlyInr: 2000,
    decisionsPerPeriod: null,
    period: "month",
    blurb: "Unlimited clarity.",
    featured: true,
    highlights: [
      "Unlimited decisions",
      "Everything in Pro",
      "Built for heavy, ongoing use",
    ],
  },
];

export function getPlan(id: PlanId): Plan {
  const plan = PLANS.find((item) => item.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export const GUEST_ANALYSIS_LIMIT = 2;
export const ENGINE_VERSION = "decide-engine/v1.1";
