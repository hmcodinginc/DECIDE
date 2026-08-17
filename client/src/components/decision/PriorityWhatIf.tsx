import type { WhatIf } from "@/types/decision";

function PriorityWhatIf({ items }: { items: WhatIf[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-2xl">If your priority changes…</h2>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <p
            key={item.criterionId}
            className="rounded-2xl border border-white/8 px-4 py-3 text-sm"
          >
            If {item.label.toLowerCase()} matters more →{" "}
            <span className="text-foreground">{item.optionName}</span>
          </p>
        ))}
      </div>
    </section>
  );
}

export { PriorityWhatIf };
