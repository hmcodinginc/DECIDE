import { Reveal } from "@/components/common/Reveal";
import { Section } from "@/components/common/Section";
import { ArrowRight } from "lucide-react";

const STEPS = ["Options", "Priorities", "DECIDE", "One recommendation"];

function SolutionSection() {
  return (
    <Section
      eyebrow="The solution"
      title="Not more information. A choice."
      description="DECIDE weighs what you care about against what you can live with — then names a winner."
    >
      <Reveal>
        <div className="flex flex-col items-stretch justify-center gap-3 md:flex-row md:items-center">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={
                  step === "DECIDE"
                    ? "rounded-2xl border border-gold/30 bg-gold-soft px-5 py-4 text-center font-display text-lg tracking-[0.2em]"
                    : "glass flex-1 rounded-2xl px-5 py-4 text-center text-sm md:flex-none"
                }
              >
                {step}
              </div>
              {index < STEPS.length - 1 ? (
                <ArrowRight className="hidden size-4 text-muted-foreground md:block" />
              ) : null}
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

export { SolutionSection };
