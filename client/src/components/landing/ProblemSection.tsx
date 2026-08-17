import { Reveal } from "@/components/common/Reveal";
import { Section } from "@/components/common/Section";

const NOISE = [
  "47 reviews say buy A",
  "Forum thread: actually B",
  "₹1,29,990 vs ₹94,500",
  "Best of 2026 list",
  "Your friend prefers C",
  "Out of stock tomorrow?",
  "4.6★ but 1-star battery",
  "Wait for the next model",
];

function ProblemSection() {
  return (
    <Section
      id="problem"
      eyebrow="The problem"
      title="Too many options. Too much information. Still don't know what to choose."
      description="Tabs, reviews, prices, opinions — and the decision is still yours to make at 1am."
    >
      <Reveal>
        <div className="relative mx-auto max-w-3xl">
          <div className="grid gap-3 sm:grid-cols-2">
            {NOISE.map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4 text-sm text-muted-foreground"
                style={{
                  transform: `rotate(${index % 2 === 0 ? -0.6 : 0.8}deg)`,
                  opacity: 0.55 + (index % 3) * 0.12,
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        </div>
      </Reveal>
    </Section>
  );
}

export { ProblemSection };
