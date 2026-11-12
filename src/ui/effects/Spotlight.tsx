import { useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "@/lib/cn";
import { useFinePointer, usePrefersReducedMotion } from "./useMediaQuery";

export interface SpotlightProps {
  children?: ReactNode;
  className?: string;
  /** Radius of the light in px. Default 360. */
  size?: number;
}

/** Container with a soft radial light that follows the cursor (decorative; hidden on touch). */
export function Spotlight({ children, className, size = 360 }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const bg = useMotionTemplate`radial-gradient(${size}px circle at ${x}px ${y}px, rgb(232 103 42 / 0.16), transparent 70%)`;
  const fine = useFinePointer();
  const reduce = usePrefersReducedMotion();
  const enabled = fine && !reduce;

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      onPointerMove={
        enabled
          ? (e) => {
              const r = ref.current?.getBoundingClientRect();
              if (r) {
                x.set(e.clientX - r.left);
                y.set(e.clientY - r.top);
              }
            }
          : undefined
      }
      onPointerLeave={() => {
        x.set(-1000);
        y.set(-1000);
      }}
    >
      {enabled && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: bg }}
        />
      )}
      {children}
    </div>
  );
}
