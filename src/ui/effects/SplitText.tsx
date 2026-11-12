import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "./useMediaQuery";

export interface SplitTextProps {
  /** Plain text to animate. */
  text: string;
  /** Split into words (default) or individual letters. */
  by?: "word" | "letter";
  /** Seconds between pieces. */
  stagger?: number;
  delay?: number;
  className?: string;
  /** Run on mount (default) or when scrolled into view. */
  trigger?: "mount" | "inView";
}

/** Staggered reveal. The wrapper carries aria-label; the animated pieces are aria-hidden. */
export function SplitText({ text, by = "word", stagger, delay = 0, className, trigger = "mount" }: SplitTextProps) {
  const reduce = usePrefersReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;
  const gap = stagger ?? (by === "word" ? 0.07 : 0.025);
  const words = text.split(" ");
  let idx = 0;
  const anim =
    trigger === "inView"
      ? { initial: "hidden", whileInView: "show", viewport: { once: true } }
      : { initial: "hidden", animate: "show" };

  return (
    <motion.span
      aria-label={text}
      className={cn("inline", className)}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...anim}
    >
      {words.map((w, wi) => (
        <span key={wi} aria-hidden="true" className="inline-block whitespace-pre">
          <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            {(by === "word" ? [w] : [...w]).map((piece) => (
              <motion.span
                key={idx++}
                className="inline-block"
                variants={{
                  hidden: { y: "110%", rotate: 6, opacity: 0 },
                  show: { y: "0%", rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 140, damping: 18 } },
                }}
              >
                {piece}
              </motion.span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.span>
  );
}
