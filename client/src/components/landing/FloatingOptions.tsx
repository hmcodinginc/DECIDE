import { motion, useReducedMotion } from "framer-motion";

const CARDS = [
  { label: "MacBook", x: "8%", y: "22%", delay: 0.8 },
  { label: "ThinkPad", x: "78%", y: "18%", delay: 1.05 },
  { label: "XPS 14", x: "12%", y: "68%", delay: 1.2 },
  { label: "Hotel B", x: "76%", y: "64%", delay: 1.35, chosen: true },
];

function FloatingOptions() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      {CARDS.map((card) => (
        <motion.div
          key={card.label}
          className="absolute"
          style={{ left: card.x, top: card.y }}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{
            opacity: 1,
            y: reduce ? 0 : [0, card.chosen ? -6 : 8, 0],
          }}
          transition={{
            opacity: { delay: card.delay, duration: 0.7 },
            y: {
              delay: card.delay,
              duration: card.chosen ? 5.5 : 7,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <div
            className={
              card.chosen
                ? "glass rounded-2xl px-4 py-3 text-sm shadow-[0_0_40px_-12px_oklch(0.86_0.09_82/0.8)]"
                : "glass rounded-2xl px-4 py-3 text-sm text-muted-foreground"
            }
          >
            <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              {card.chosen ? "Recommended" : "Option"}
            </p>
            <p className="mt-1 font-medium text-foreground">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export { FloatingOptions };
