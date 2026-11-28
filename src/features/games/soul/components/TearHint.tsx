import { motion } from "motion/react";

/**
 * "Cut it open" hint over the sealed booster: a dashed cut line across the top with a finger
 * sliding along it, plus a short caption. Static under reduced motion.
 */
export function TearHint({ tearY, reduce }: { tearY: number; reduce: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: reduce ? 0 : 0.5 }}
    >
      <p className="absolute bottom-full left-1/2 mb-6 w-72 -translate-x-1/2 text-center font-display text-lg leading-tight font-extrabold text-white drop-shadow">
        Przeciągnij palcem po górze boostera, aby go rozerwać
      </p>
      <div className="absolute inset-x-[-6%]" style={{ top: `${tearY}%` }}>
        <motion.span
          className="absolute inset-x-0 -top-px block border-t-2 border-dashed border-surface"
          animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <span className="absolute -top-3.5 -left-7 text-2xl leading-none">✂️</span>
        {/* glowing trail following the finger */}
        {!reduce && (
          <motion.span
            className="absolute inset-x-0 -top-1 block h-2 origin-left rounded-full bg-logo-yellow/80 blur-[2px]"
            animate={{ scaleX: [0, 1, 1], opacity: [0.9, 0.9, 0] }}
            transition={{ duration: 1.6, times: [0, 0.7, 1], repeat: Infinity, repeatDelay: 0.5 }}
          />
        )}
        {/* full-width track moved by transform, so the finger slides along the whole line */}
        <motion.span
          className="absolute inset-x-0 top-1 block"
          initial={{ x: reduce ? "40%" : "-8%" }}
          animate={reduce ? undefined : { x: ["-8%", "92%", "92%"], opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, times: [0, 0.7, 1], repeat: Infinity, repeatDelay: 0.5 }}
        >
          <span className="block w-fit text-5xl leading-none drop-shadow-lg">👆</span>
        </motion.span>
      </div>
    </motion.div>
  );
}
