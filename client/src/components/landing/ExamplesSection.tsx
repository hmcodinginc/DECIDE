import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/common/Reveal";
import { Section } from "@/components/common/Section";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  {
    title: "Laptop",
    question: "Which laptop should I buy?",
    pick: "MacBook Air",
    why: "Best match for battery, weight, and daily reliability.",
  },
  {
    title: "Phone",
    question: "Which phone is best for me?",
    pick: "Phone C",
    why: "Camera and battery win for the way you actually shoot.",
  },
  {
    title: "Apartment",
    question: "Which apartment should I rent?",
    pick: "Indiranagar 2BHK",
    why: "Fits the budget without giving up commute or safety.",
  },
  {
    title: "Travel",
    question: "Which hotel should I book?",
    pick: "Hotel B",
    why: "Location and rating outweigh the slightly higher nightly rate.",
  },
  {
    title: "Subscription",
    question: "Which plan should I keep?",
    pick: "Pro annual",
    why: "You use it enough that monthly billing costs more.",
  },
  {
    title: "Course",
    question: "Which course is worth it?",
    pick: "Course A",
    why: "Outcomes and time-to-complete beat the cheaper option.",
  },
  {
    title: "Restaurant",
    question: "Where should we eat tonight?",
    pick: "The quiet place two streets over",
    why: "Fits budget, distance, and the cuisine you wanted.",
  },
];

function ExamplesSection() {
  const [active, setActive] = useState(EXAMPLES[0].title);
  const current = EXAMPLES.find((item) => item.title === active) ?? EXAMPLES[0];

  return (
    <Section
      eyebrow="Example decisions"
      title="The same feeling, for almost anything."
      description="Tap an example. This is the DECIDE shape: one pick, and the reason it won."
    >
      <Reveal>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActive(item.title)}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-[color,background-color,border-color,box-shadow] duration-200",
                item.title === active
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "chip-hover border border-white/10 text-muted-foreground",
              )}
            >
              {item.title}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="glass mx-auto mt-10 max-w-xl rounded-3xl p-6 text-center sm:p-8"
          >
            <p className="text-sm text-muted-foreground">{current.question}</p>
            <p className="mt-4 text-xs tracking-[0.22em] text-gold uppercase">
              DECIDE recommends
            </p>
            <p className="font-display mt-2 text-3xl break-words text-balance">{current.pick}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {current.why}
            </p>
          </motion.div>
        </AnimatePresence>
      </Reveal>
    </Section>
  );
}

export { ExamplesSection };
