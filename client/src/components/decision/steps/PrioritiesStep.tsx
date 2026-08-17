import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { DecisionConstraints, DecisionCriterion } from "@/types/decision";

interface PrioritiesStepProps {
  criteria: DecisionCriterion[];
  constraints: DecisionConstraints;
  onCriteriaChange: (criteria: DecisionCriterion[]) => void;
  onConstraintsChange: (constraints: DecisionConstraints) => void;
  onBack: () => void;
  onContinue: () => void;
}

function PrioritiesStep({
  criteria,
  constraints,
  onCriteriaChange,
  onConstraintsChange,
  onBack,
  onContinue,
}: PrioritiesStepProps) {
  return (
    <div>
      <p className="text-xs tracking-[0.22em] text-gold uppercase">Step 3</p>
      <h1 className="font-display mt-3 text-3xl sm:text-5xl">What actually matters?</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Drag importance. Leave something low if you don&apos;t care. Add a budget if it&apos;s a hard line.
      </p>
      <div className="mt-8 space-y-6">
        {criteria.map((criterion) => (
          <div key={criterion.id}>
            <div className="mb-3 flex items-center justify-between">
              <Label>{criterion.label}</Label>
              <span className="text-sm text-muted-foreground">{criterion.weight}/10</span>
            </div>
            <Slider
              min={0}
              max={10}
              step={1}
              value={[criterion.weight]}
              onValueChange={([weight]) =>
                onCriteriaChange(
                  criteria.map((item) =>
                    item.id === criterion.id ? { ...item, weight: weight ?? 0 } : item,
                  ),
                )
              }
            />
          </div>
        ))}
      </div>
      <div className="mt-10 max-w-xs">
        <Label htmlFor="budget">Max budget (₹, optional)</Label>
        <Input
          id="budget"
          className="mt-2"
          inputMode="numeric"
          value={constraints.maxBudget ?? ""}
          onChange={(event) => {
            const raw = event.target.value.replace(/[^\d]/g, "");
            onConstraintsChange({
              ...constraints,
              maxBudget: raw ? Number(raw) : null,
            });
          }}
          placeholder="100000"
        />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </div>
  );
}

export { PrioritiesStep };
