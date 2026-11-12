import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/ui";

const TILES = [
  "bg-logo-orange", "bg-logo-yellow", "bg-logo-blue", "bg-logo-red",
  "bg-logo-blue", "bg-logo-orange", "bg-logo-red", "bg-logo-yellow",
  "bg-logo-yellow", "bg-logo-red", "bg-logo-orange", "bg-logo-blue",
] as const;

/** Decorative animated mosaic of colour tiles (aria-hidden, static under reduced motion). */
export function MosaicDecor() {
  const reduce = usePrefersReducedMotion();
  return (
    <div aria-hidden="true" className="grid grid-cols-6 gap-2 p-4 sm:grid-cols-12 sm:p-6">
      {[...TILES, ...TILES].map((c, i) => (
        <motion.span
          key={i}
          className={`${c} aspect-square rounded-xl`}
          initial={{ opacity: 0.85, scale: 1 }}
          animate={reduce ? undefined : { scale: [1, 0.78, 1], rotate: [0, i % 2 ? 8 : -8, 0], opacity: [0.85, 0.5, 0.85] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: ((i * 137) % 1800) / 1000, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
