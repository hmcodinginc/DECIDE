import type { ReactNode } from "react";
import { Container } from "@/components/common/Container";
import { usePageTitle } from "@/hooks/usePageTitle";

interface LegalPageProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

function LegalPage({ eyebrow, title, description, children }: LegalPageProps) {
  usePageTitle(`${title} — DECIDE`);

  return (
    <Container className="max-w-3xl pt-28 pb-24">
      <p className="text-xs tracking-[0.22em] text-gold uppercase">{eyebrow}</p>
      <h1 className="font-display mt-3 text-4xl text-balance sm:text-5xl">{title}</h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-10 space-y-10">{children}</div>
    </Container>
  );
}

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export { LegalPage, LegalSection };
