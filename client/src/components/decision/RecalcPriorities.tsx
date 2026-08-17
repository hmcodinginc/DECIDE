import { Slider } from "@/components/ui/slider";
import { analyzeDecision } from "@/services/decision/engine";
import type { DecisionRecord } from "@/types/decision";

interface RecalcPrioritiesProps {
  decision: DecisionRecord;
  onChange: (decision: DecisionRecord) => void;
}

function RecalcPriorities({ decision, onChange }: RecalcPrioritiesProps) {
  return (
    <section>
      <h2 className="font-display text-2xl">Change a priority</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Move a slider. The recommendation updates immediately — you stay in control.
      </p>
      <div className="mt-6 space-y-5">
        {decision.criteria.map((criterion) => (
          <div key={criterion.id}>
            <div className="mb-2 flex justify-between text-sm">
              <span>{criterion.label}</span>
              <span className="text-muted-foreground">{criterion.weight}/10</span>
            </div>
            <Slider
              min={0}
              max={10}
              step={1}
              value={[criterion.weight]}
              onValueChange={([weight]) => {
                const next = {
                  ...decision,
                  criteria: decision.criteria.map((item) =>
                    item.id === criterion.id ? { ...item, weight: weight ?? 0 } : item,
                  ),
                };
                onChange({ ...next, result: analyzeDecision(next) });
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export { RecalcPriorities };
