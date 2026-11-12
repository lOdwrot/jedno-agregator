import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "./useMediaQuery";

export interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Total travel in px across the viewport pass; positive = moves slower than scroll. Default 60. */
  distance?: number;
}

/** Translates its content along Y as it scrolls through the viewport. */
export function Parallax({ children, className, distance = 60 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}
