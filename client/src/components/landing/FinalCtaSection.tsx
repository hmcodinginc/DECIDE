import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/common/Section";
import { ROUTES } from "@/config/routes";

function FinalCtaSection() {
  return (
    <Section className="pb-28">
      <div className="rounded-[2rem] border border-gold/20 bg-gold-soft px-6 py-16 text-center sm:px-12">
        <p className="text-xs tracking-[0.28em] text-gold uppercase">DECIDE</p>
        <h2 className="font-display mt-4 text-4xl sm:text-6xl">
          Stop comparing. DECIDE.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          You have options. You don&apos;t know what to choose. That&apos;s the
          whole product.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to={ROUTES.newDecision}>Make a Decision</Link>
        </Button>
      </div>
    </Section>
  );
}

export { FinalCtaSection };
