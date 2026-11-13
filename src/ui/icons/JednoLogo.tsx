import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "../effects/useMediaQuery";

/** Clockwise from the top — same order and colours as the Jedno mobile app logo. */
const FIGURES = [
  "var(--color-logo-blue)",
  "var(--color-logo-yellow)",
  "var(--color-logo-dark)",
  "var(--color-logo-orange)",
];

/*
 * Geometry traced from the app icon (1024×1024 grid, centre 512/512). The top figure is a head
 * plus one arm: a band (arc around 512/117, radii 236–324) with a rounded end at the upper right
 * and a slanted cut near the centre. The other three figures are the same shape rotated by 90°.
 */
const HEAD = { cx: 512, cy: 206, r: 71 };
const ARM =
  "M735.4 351.6A324 324 0 0 1 467 440L430 342A236 236 0 0 0 674.8 287.9A44 44 0 0 1 735.4 351.6Z";

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

export function JednoLogo({
  variant = "full",
  animated = false,
  size = 40,
  className,
  title = "Jedno",
}: JednoLogoProps) {
  const reduce = usePrefersReducedMotion();
  const animate = animated && !reduce;
  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label={title}
    >
      <svg
        viewBox="120 120 784 784"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        className="shrink-0 overflow-visible"
      >
        {FIGURES.map((color, i) => (
          <motion.g
            key={color}
            style={{ transformOrigin: "512px 512px", transformBox: "view-box" }}
            initial={animate ? { scale: 0, rotate: -50, opacity: 0 } : false}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 14, delay: i * 0.12 }}
          >
            <g transform={`rotate(${i * 90} 512 512)`} fill={color}>
              <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} />
              <path d={ARM} />
            </g>
          </motion.g>
        ))}
      </svg>
      {variant === "full" && (
        <span
          aria-hidden="true"
          className="font-display font-extrabold tracking-tight text-navy"
          style={{ fontSize: size * 0.7, lineHeight: 1 }}
        >
          Jedno
        </span>
      )}
    </span>
  );
}
