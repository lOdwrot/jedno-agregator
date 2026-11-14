import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/ui";
import { ART, artSrc } from "../data/art";
import type { Rank } from "./ranks";

interface Props {
  rank: Rank;
  /** Last rank change — picks the swap animation (card flip + light burst up, sinking down). */
  change: "up" | "down" | null;
  onClick?: () => void;
}

const RAYS = 10;

/** The patron's picture in a golden frame; swaps with a flip when the rank changes. */
export function PatronPortrait({ rank, change, onClick }: Props) {
  const reduce = usePrefersReducedMotion();
  const { patron } = rank;
  const src = artSrc(patron.art);
  const up = change !== "down";
  const frame = (
    <span className="relative block size-24 [perspective:600px]">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={patron.art}
          className="absolute inset-0 block overflow-hidden rounded-full border-4 border-logo-yellow bg-navy-800 shadow-lift"
          initial={
            reduce
              ? { opacity: 0 }
              : { rotateY: up ? -180 : 0, y: up ? 0 : -30, opacity: 0, scale: 0.6 }
          }
          animate={{ rotateY: 0, y: 0, opacity: 1, scale: 1 }}
          exit={
            reduce
              ? { opacity: 0 }
              : { rotateY: up ? 180 : 0, y: up ? 0 : 40, opacity: 0, scale: up ? 1.2 : 0.7 }
          }
          transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 170, damping: 16 }}
        >
          {src && (
            <img
              src={src}
              alt=""
              className="size-full object-cover"
              style={{ objectPosition: `50% ${(ART[patron.art]?.focus ?? 0.25) * 100}%` }}
            />
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );

  return (
    <div className="relative grid place-items-center">
      {change && !reduce && (
        <span
          key={`${patron.art}-${change}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <motion.span
            className={cn("absolute size-24 rounded-full", up ? "bg-logo-yellow" : "bg-white/40")}
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: up ? 2.6 : 1.6, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
          {up &&
            Array.from({ length: RAYS }, (_, i) => {
              const a = (i / RAYS) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="absolute text-lg"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                  animate={{ x: Math.cos(a) * 90, y: Math.sin(a) * 70, opacity: 0, scale: 1.2 }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.05 }}
                >
                  ✨
                </motion.span>
              );
            })}
        </span>
      )}
      {change && (
        <motion.span
          key={`badge-${patron.art}-${change}`}
          className={cn(
            "absolute -top-1 z-10 rounded-pill px-2 py-0.5 text-xs font-extrabold uppercase shadow-card",
            up ? "bg-logo-yellow text-navy" : "bg-surface text-navy",
          )}
          initial={reduce ? false : { scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 14 }}
        >
          {up ? "Awans!" : "Spadek"}
        </motion.span>
      )}
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={`Patron rangi: ${patron.name} — przeczytaj o nim`}
          className="rounded-full transition-transform hover:scale-105 focus-visible:scale-105"
        >
          {frame}
        </button>
      ) : (
        frame
      )}
    </div>
  );
}
