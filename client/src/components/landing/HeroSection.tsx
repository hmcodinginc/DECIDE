import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/common/Container";
import { FloatingOptions } from "@/components/landing/FloatingOptions";
import { HeroDecideMark } from "@/components/landing/HeroDecideMark";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute top-[-20%] left-1/2 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full bg-gold/12 blur-[120px]"
          animate={reduce ? undefined : { opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="grain absolute inset-0 opacity-[0.09] mix-blend-overlay" />
      </div>
      <FloatingOptions />
      <Container className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center pt-24 pb-16 text-center">
        <motion.p
          className="text-sm tracking-[0.28em] text-gold uppercase"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Too many choices?
        </motion.p>
        <HeroDecideMark />
        <motion.p
          className="max-w-xl text-xl text-balance text-foreground/90 sm:text-2xl"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7 }}
        >
          Stop comparing. Get a decision.
        </motion.p>
        <motion.p
          className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.7 }}
        >
          Give DECIDE your options, priorities and constraints. We&apos;ll help
          you choose what fits YOU.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Button asChild size="lg">
            <Link to={ROUTES.newDecision}>Make a Decision</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <a href="#how">See How It Works</a>
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}

export { HeroSection };
