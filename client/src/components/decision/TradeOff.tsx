import type { TradeOff } from "@/types/decision";

function TradeOffBlock({ tradeoff }: { tradeoff: TradeOff | null }) {
  if (!tradeoff) return null;
  return (
    <section className="rounded-3xl border border-white/8 bg-white/3 p-6">
      <h2 className="font-display text-2xl">The trade-off</h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        You&apos;re giving up {tradeoff.givingUp}, but gaining {tradeoff.gaining}.
      </p>
    </section>
  );
}

export { TradeOffBlock };
