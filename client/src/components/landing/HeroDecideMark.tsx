import { motion, useReducedMotion } from "framer-motion";

const LETTERS = ["D", "E", "C", "I", "D", "E"];

function HeroDecideMark() {
  const reduce = useReducedMotion();

  return (
    <div className="mt-6 mb-6 w-full min-w-0 [container-type:inline-size]">
      <h1 className="font-display w-full min-w-0 text-center text-[clamp(2.35rem,13.5cqw,9.5rem)] leading-[0.85] font-extrabold text-foreground">
        <span className="sr-only">DECIDE</span>
        <span aria-hidden className="flex w-full max-w-full justify-center">
          {LETTERS.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              className="relative inline-block"
              initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{
                opacity: 1,
                y: reduce ? 0 : [0, index % 2 === 0 ? -3 : 3, 0],
                filter: "blur(0px)",
              }}
              transition={{
                opacity: { duration: 0.7, delay: 0.12 * index, ease: [0.22, 1, 0.36, 1] },
                filter: { duration: 0.7, delay: 0.12 * index },
                y: reduce
                  ? undefined
                  : {
                      duration: 6 + index * 0.35,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8 + index * 0.12,
                    },
              }}
            >
              {letter}
            </motion.span>
          ))}
        </span>
      </h1>
    </div>
  );
}

export { HeroDecideMark };
