import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "./useMediaQuery";

export interface BrushUnderlineProps {
  children: ReactNode;
  className?: string;
  /** Tailwind text colour class for the stroke, default text-accent. */
  strokeClassName?: string;
  delay?: number;
}

/** Wraps a word and draws a hand-painted SVG stroke beneath it when it enters the viewport. */
export function BrushUnderline({
  children,
  className,
  strokeClassName = "text-accent",
  delay = 0.2,
}: BrushUnderlineProps) {
  const reduce = usePrefersReducedMotion();
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        className={cn(
          "pointer-events-none absolute -bottom-[0.18em] left-0 h-[0.28em] w-full overflow-visible",
          strokeClassName,
        )}
      >
        <motion.path
          d="M3 8c30-6 62-7 95-4s64 3 98-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </span>
  );
}
