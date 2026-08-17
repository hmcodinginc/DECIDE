interface WhyThisOneProps {
  reasons: string[];
}

function WhyThisOne({ reasons }: WhyThisOneProps) {
  if (reasons.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-2xl">Why this one?</h2>
      <ol className="mt-5 space-y-3">
        {reasons.map((reason, index) => (
          <li key={reason} className="flex gap-3 text-sm leading-relaxed">
            <span className="font-display text-gold">{index + 1}.</span>
            {reason}
          </li>
        ))}
      </ol>
    </section>
  );
}

export { WhyThisOne };
