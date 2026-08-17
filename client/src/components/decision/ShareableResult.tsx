import type { DecisionRecord } from "@/types/decision";

function ShareableResult({ decision }: { decision: DecisionRecord }) {
  const result = decision.result;
  const winner = result?.scores.find(
    (item) => item.optionId === result.recommendedOptionId,
  );
  if (!result || !winner) return null;

  return (
    <aside className="rounded-[2rem] border border-gold/20 bg-[#0A0A0E] p-8">
      <p className="text-[11px] tracking-[0.28em] text-gold uppercase">
        DECIDE RESULT
      </p>
      <p className="mt-4 text-xs text-muted-foreground">{decision.question}</p>
      <p className="mt-4 text-sm text-muted-foreground">Recommended</p>
      <p className="font-display mt-1 text-3xl">{winner.name}</p>
      <p className="mt-2 text-sm text-gold">{winner.total.toFixed(1)} / 10 match</p>
      <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
        {result.why.slice(0, 3).map((reason) => (
          <li key={reason}>✓ {reason}</li>
        ))}
      </ul>
    </aside>
  );
}

export { ShareableResult };
