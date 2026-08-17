import { Reveal } from "@/components/common/Reveal";
import { Section } from "@/components/common/Section";

const PILLARS = [
  {
    title: "Personalized",
    body: "The recommendation is for your budget, your constraints, your taste — not a generic best-of list.",
  },
  {
    title: "Transparent",
    body: "You always see why it won, where it loses, and what would flip the answer.",
  },
  {
    title: "Simple",
    body: "Progressive questions. No 20-field form. No chatbot that talks in circles.",
  },
  {
    title: "Decision-focused",
    body: "DECIDE doesn't just give information. It helps you choose.",
  },
];

function WhySection() {
  return (
    <Section eyebrow="Why DECIDE" title="Built to close the tab.">
      <div className="grid gap-4 sm:grid-cols-2">
        {PILLARS.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.05}>
            <div className="h-full rounded-3xl border border-white/8 p-7">
              <h3 className="font-display text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export { WhySection };
