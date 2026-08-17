import { createId } from "@/lib/format";
import type { DecisionCriterion } from "@/types/decision";

interface CriterionTemplate {
  key: string;
  label: string;
  kind: DecisionCriterion["kind"];
  match: RegExp;
}

const LIBRARY: CriterionTemplate[] = [
  { key: "performance", label: "Performance", kind: "benefit", match: /laptop|computer|phone|pc|tablet|gpu|chip/i },
  { key: "battery", label: "Battery", kind: "benefit", match: /laptop|phone|tablet|earbuds|watch/i },
  { key: "weight", label: "Weight", kind: "cost", match: /laptop|bag|camera|bike/i },
  { key: "camera", label: "Camera", kind: "benefit", match: /phone|camera/i },
  { key: "location", label: "Location", kind: "benefit", match: /apartment|hotel|house|flat|rent|restaurant|office/i },
  { key: "space", label: "Space", kind: "benefit", match: /apartment|house|flat|rent|office/i },
  { key: "safety", label: "Safety", kind: "benefit", match: /apartment|car|insurance|house|rent/i },
  { key: "amenities", label: "Amenities", kind: "benefit", match: /hotel|apartment|gym/i },
  { key: "duration", label: "Duration", kind: "cost", match: /flight|travel|trip|course/i },
  { key: "stops", label: "Fewer stops", kind: "benefit", match: /flight/i },
  { key: "rating", label: "Rating", kind: "benefit", match: /hotel|restaurant|course/i },
  { key: "distance", label: "Distance", kind: "cost", match: /hotel|restaurant|apartment|office/i },
  { key: "features", label: "Features", kind: "benefit", match: /subscription|plan|software|course/i },
  { key: "usage", label: "How much I'll use it", kind: "benefit", match: /subscription|plan|gym/i },
  { key: "reliability", label: "Reliability", kind: "benefit", match: /car|laptop|phone|insurance|plan/i },
  { key: "appearance", label: "Appearance", kind: "benefit", match: /phone|car|laptop|apartment|clothes/i },
];

const DEFAULTS: Omit<DecisionCriterion, "id">[] = [
  { key: "price", label: "Price", kind: "cost", weight: 8 },
  { key: "quality", label: "Quality", kind: "benefit", weight: 7 },
  { key: "convenience", label: "Convenience", kind: "benefit", weight: 5 },
  { key: "reliability", label: "Reliability", kind: "benefit", weight: 6 },
];

export function suggestCriteria(question: string): DecisionCriterion[] {
  const matched = LIBRARY.filter((item) => item.match.test(question)).map(
    (item, index) => ({
      id: createId(),
      key: item.key,
      label: item.label,
      kind: item.kind,
      weight: 7 - Math.min(index, 3),
    }),
  );

  const hasPrice = matched.some((item) => item.key === "price");
  const base = hasPrice
    ? matched
    : [
        {
          id: createId(),
          key: "price",
          label: "Price",
          kind: "cost" as const,
          weight: 8,
        },
        ...matched,
      ];

  if (base.length >= 4) return base.slice(0, 6);

  const extras = DEFAULTS.filter(
    (item) => !base.some((criterion) => criterion.key === item.key),
  ).map((item) => ({ ...item, id: createId() }));

  return [...base, ...extras].slice(0, 6);
}

export const QUESTION_EXAMPLES = [
  "Which laptop should I buy?",
  "Which apartment should I rent?",
  "Which phone is best for me?",
  "Which plan should I choose?",
  "Which hotel should I book?",
  "Which course is worth it?",
] as const;
