import { motion, useScroll, useSpring } from "motion/react";
import { cn } from "@/lib/cn";

/** Thin reading-progress bar fixed to the top of the viewport (decorative, aria-hidden). */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className={cn("fixed inset-x-0 top-0 z-50 h-1 origin-left bg-linear-to-r from-logo-orange via-logo-yellow to-logo-red", className)}
    />
  );
}
