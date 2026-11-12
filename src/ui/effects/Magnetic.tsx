import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/cn";
import { useFinePointer, usePrefersReducedMotion } from "./useMediaQuery";

export interface MagneticProps {
  children: ReactNode;
  /** How far (0-1) the element follows the pointer. Default 0.25. */
  strength?: number;
  className?: string;
}

/** Wrapper that gently pulls its content toward the pointer. No-op on touch / reduced motion. */
export function Magnetic({ children, strength = 0.25, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  const enabled = fine && !reduce;

  return (
    <motion.span
      ref={ref}
      className={cn("inline-block", className)}
      style={enabled ? { x: sx, y: sy } : undefined}
      onPointerMove={
        enabled
          ? (e) => {
              const r = ref.current?.getBoundingClientRect();
              if (!r) return;
              x.set((e.clientX - (r.left + r.width / 2)) * strength);
              y.set((e.clientY - (r.top + r.height / 2)) * strength);
            }
          : undefined
      }
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
