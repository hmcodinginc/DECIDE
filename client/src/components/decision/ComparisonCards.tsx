import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DecisionResult } from "@/types/decision";

function ComparisonCards({ result }: { result: DecisionResult }) {
  return (
    <section>
      <h2 className="font-display text-2xl">Compared with the others</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {result.scores.map((score) => {
          const recommended = score.optionId === result.recommendedOptionId;
          return (
            <div
              key={score.optionId}
              className={cn(
                "rounded-3xl border p-5",
                recommended ? "border-gold/35 bg-gold-soft" : "border-white/8",
              )}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <h3 className="min-w-0 font-medium break-words">{score.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {score.total.toFixed(1)}
                </p>
              </div>
              {recommended ? (
                <p className="mt-1 text-xs tracking-[0.16em] text-gold uppercase">
                  Recommended
                </p>
              ) : null}
              {score.disqualified ? (
                <p className="mt-2 text-xs text-red-300">{score.disqualifyReason}</p>
              ) : null}
              <Progress className="mt-4" value={score.total * 10} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { ComparisonCards };
