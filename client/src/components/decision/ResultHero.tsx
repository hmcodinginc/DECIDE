import { Badge } from "@/components/ui/badge";
import type { DecisionRecord } from "@/types/decision";

interface ResultHeroProps {
  decision: DecisionRecord;
}

function ResultHero({ decision }: ResultHeroProps) {
  const result = decision.result;
  const winner = result?.scores.find(
    (item) => item.optionId === result.recommendedOptionId,
  );

  if (!result || !winner) {
    return (
      <div>
        <p className="text-xs tracking-[0.22em] text-gold uppercase">DECIDE</p>
        <h1 className="font-display mt-3 text-3xl sm:text-5xl">
          I don&apos;t have enough information to make a reliable recommendation yet.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Based on the information you provided, the options are too close — or too incomplete.
        </p>
      </div>
    );
  }

  const confidenceLabel = {
    high: "Clear match",
    medium: "Good match",
    low: "Tentative match",
    insufficient: "Not enough contrast",
  }[result.confidence];

  return (
    <div className="text-center">
      <p className="text-xs tracking-[0.22em] text-gold uppercase">
        Based on the information you provided, DECIDE recommends
      </p>
      <h1 className="font-display mt-4 text-4xl text-balance sm:text-6xl">
        {winner.name}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {winner.total.toFixed(1)} / 10 match
      </p>
      <Badge className="mt-4">{confidenceLabel}</Badge>
    </div>
  );
}

export { ResultHero };
