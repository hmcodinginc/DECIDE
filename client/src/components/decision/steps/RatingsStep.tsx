import { Button } from "@/components/ui/button";
import { setRating } from "@/services/decision/engine";
import { cn } from "@/lib/utils";
import type { DecisionCriterion, DecisionOption, OptionRating } from "@/types/decision";

interface RatingsStepProps {
  options: DecisionOption[];
  criteria: DecisionCriterion[];
  ratings: OptionRating[];
  onChange: (ratings: OptionRating[]) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkipRatings: () => void;
}

function RatingsStep({
  options,
  criteria,
  ratings,
  onChange,
  onBack,
  onContinue,
  onSkipRatings,
}: RatingsStepProps) {
  const active = criteria.filter((item) => item.weight > 0);
  const optionIds = options.map((item) => item.id);

  const selected = (criterionId: string) => {
    const best = ratings.find(
      (item) => item.criterionId === criterionId && item.relative === "best",
    );
    const similar = ratings.some(
      (item) => item.criterionId === criterionId && item.relative === "similar",
    );
    if (similar) return "similar";
    return best?.optionId ?? "unset";
  };

  return (
    <div>
      <p className="text-xs tracking-[0.22em] text-gold uppercase">Step 4</p>
      <h1 className="font-display mt-3 text-3xl sm:text-5xl">
        Quickly, which is stronger?
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Tap a winner for each thing that matters. Skip any you&apos;re unsure about — DECIDE will say so.
      </p>
      <div className="mt-8 space-y-8">
        {active.map((criterion) => {
          const current = selected(criterion.id);
          return (
            <div key={criterion.id}>
              <p className="mb-3 text-sm font-medium">
                On {criterion.label.toLowerCase()}, which is better?
              </p>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm",
                      current === option.id
                        ? "border-gold/40 bg-gold-soft text-foreground"
                        : "border-white/10 text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() =>
                      onChange(
                        setRating(ratings, criterion.id, option.id, "best", optionIds),
                      )
                    }
                  >
                    {option.name}
                  </button>
                ))}
                <button
                  type="button"
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm",
                    current === "similar"
                      ? "border-gold/40 bg-gold-soft text-foreground"
                      : "border-white/10 text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() =>
                    onChange(
                      setRating(ratings, criterion.id, optionIds[0] ?? "", "similar", optionIds),
                    )
                  }
                >
                  They&apos;re similar
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm",
                    current === "unset"
                      ? "border-gold/40 bg-gold-soft text-foreground"
                      : "border-white/10 text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() =>
                    onChange(setRating(ratings, criterion.id, optionIds[0] ?? "", "unset", optionIds))
                  }
                >
                  Skip
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="outline" onClick={onSkipRatings}>
          Skip ratings
        </Button>
        <Button onClick={onContinue}>Get my decision</Button>
      </div>
    </div>
  );
}

export { RatingsStep };
