import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";
import { usePrefersReducedMotion } from "./useMediaQuery";

export interface CounterProps {
  value: number;
  /** Seconds, default 1.6. */
  duration?: number;
  className?: string;
}

/** Counts up to `value` when scrolled into view. The final value is always in the DOM for screen readers. */
export function Counter({ value, duration = 1.6, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString("pl-PL");
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {value.toLocaleString("pl-PL")}
      </span>
      <span className="sr-only">{value.toLocaleString("pl-PL")}</span>
    </span>
  );
}
