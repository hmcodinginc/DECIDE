import { Reveal } from "@/components/common/Reveal";
import { Section } from "@/components/common/Section";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Options", "Priorities", "DECIDE", "One recommendation"];

function SolutionSection() {
  return (
    <Section
      eyebrow="The solution"
      title="Not more information. A choice."
      description="DECIDE weighs what you care about against what you can live with — then names a winner."
    >
      <Reveal>
        <div className="flex w-full min-w-0 flex-col items-center justify-center gap-3 xl:flex-row xl:flex-wrap xl:items-center">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className="flex w-full min-w-0 flex-col items-center gap-3 xl:w-auto xl:flex-row"
            >
              <div
                className={cn(
                  "w-full min-w-0 rounded-2xl px-4 py-4 text-center xl:w-auto",
                  "surface-hover",
                  step === "DECIDE"
                    ? "border border-gold/30 bg-gold-soft font-display text-base tracking-[0.12em] sm:text-lg sm:tracking-[0.16em]"
                    : "glass text-sm",
                )}
              >
                {step}
              </div>
              {index < STEPS.length - 1 ? (
                <ArrowRight className="size-4 shrink-0 rotate-90 text-muted-foreground xl:rotate-0" />
              ) : null}
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

export { SolutionSection };
