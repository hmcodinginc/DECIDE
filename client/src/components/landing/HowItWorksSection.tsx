import { Reveal } from "@/components/common/Reveal";
import { Section } from "@/components/common/Section";

const STEPS = [
  {
    n: "01",
    title: "Tell us what you're choosing",
    body: "A laptop. An apartment. A plan. Your own words are enough.",
  },
  {
    n: "02",
    title: "Add your options",
    body: "Names, links, notes, a price if you have one. Two is enough to start.",
  },
  {
    n: "03",
    title: "Tell us what matters",
    body: "Budget, quality, speed, location — weighted to you, not the internet.",
  },
  {
    n: "04",
    title: "DECIDE weighs the trade-offs",
    body: "No leaderboard of 17 facts. A scored comparison against your priorities.",
  },
  {
    n: "05",
    title: "Get your recommendation",
    body: "One answer, why it won, what you're giving up, and what would change it.",
  },
];

function HowItWorksSection() {
  return (
    <Section
      id="how"
      eyebrow="How it works"
      title="Five steps. Then you're done."
      description="DECIDE should not take 30 minutes. You already spent that on research."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {STEPS.map((step, index) => (
          <Reveal key={step.n} delay={index * 0.06}>
            <div className="h-full rounded-3xl border border-white/8 bg-white/3 p-5">
              <p className="font-display text-sm tracking-[0.2em] text-gold">
                {step.n}
              </p>
              <h3 className="mt-4 text-base font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export { HowItWorksSection };
