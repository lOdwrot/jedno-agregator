import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "../effects/useMediaQuery";

const FIGURES = [
  { color: "var(--color-logo-orange)" },
  { color: "var(--color-logo-blue)" },
  { color: "var(--color-logo-yellow)" },
  { color: "var(--color-logo-red)" },
  { color: "var(--color-logo-dark)" },
];

const C = 50;
const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};

/** One figure: a head (circle) plus arms (an arc reaching toward both neighbours). */
function arms(deg: number) {
  const [x1, y1] = pt(deg - 30, 25);
  const [x2, y2] = pt(deg + 30, 25);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A25 25 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export interface JednoLogoProps {
  /** `full` = mark + wordmark, `mark` = figures only. */
  variant?: "full" | "mark";
  /** Figures assemble with a staggered spring on mount. */
  animated?: boolean;
  /** Height of the mark in px (wordmark scales with it). Default 40. */
  size?: number;
  className?: string;
  /** Accessible name; default "Jedno". */
  title?: string;
}

export function JednoLogo({ variant = "full", animated = false, size = 40, className, title = "Jedno" }: JednoLogoProps) {
  const reduce = usePrefersReducedMotion();
  const animate = animated && !reduce;
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} role="img" aria-label={title}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" focusable="false" className="shrink-0 overflow-visible">
        {FIGURES.map((f, i) => {
          const deg = -90 + i * 72;
          const [hx, hy] = pt(deg, 37);
          return (
            <motion.g
              key={i}
              style={{ transformOrigin: "50px 50px" }}
              initial={animate ? { scale: 0, rotate: -50, opacity: 0 } : false}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 14, delay: i * 0.12 }}
            >
              <circle cx={hx} cy={hy} r="7" fill={f.color} />
              <path d={arms(deg)} fill="none" stroke={f.color} strokeWidth="6.5" strokeLinecap="round" />
            </motion.g>
          );
        })}
      </svg>
      {variant === "full" && (
        <span aria-hidden="true" className="font-display font-extrabold tracking-tight text-navy" style={{ fontSize: size * 0.7, lineHeight: 1 }}>
          Jedno
        </span>
      )}
    </span>
  );
}
