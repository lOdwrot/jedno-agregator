import { useEffect, useRef, useState } from "react";
import { animate, motion } from "motion/react";
import { Button, usePrefersReducedMotion } from "@/ui";
import { sfx } from "../audio/sfx";
import type { Opponent } from "../data/opponents";

interface Props {
  opponent: Opponent;
  fee: number;
  /** Talents before paying. */
  talents: number;
  onDone: () => void;
}

const DURATION = 1.6;

/**
 * Paying the entry fee: talents drop from the counter onto the collection plate while the balance
 * counts down, then the duel starts. Reduced motion: no flying coins, a short pause only.
 */
export function FeePayment({ opponent, fee, talents, onDone }: Props) {
  const reduce = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduce ? talents - fee : talents);
  const next = useRef<HTMLElement>(null);
  const finished = useRef(false);
  const coins = Math.min(10, Math.max(3, Math.round(fee / 10)));

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };
  const done = useRef(finish);
  useEffect(() => {
    done.current = finish;
  });

  useEffect(() => {
    next.current?.focus();
    sfx.coin();
    const end = setTimeout(() => done.current(), (reduce ? 0.7 : DURATION + 0.5) * 1000);
    if (reduce) return () => clearTimeout(end);
    const counter = animate(talents, talents - fee, {
      duration: DURATION,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    const clinks = Array.from({ length: 3 }, (_, i) => setTimeout(() => sfx.coin(), 450 + i * 400));
    return () => {
      clearTimeout(end);
      clinks.forEach(clearTimeout);
      counter.stop();
    };
  }, [fee, reduce, talents]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Wpisowe za wyzwanie: ${opponent.name}`}
      className="fixed inset-0 z-50 grid place-items-center bg-navy/95 p-4 text-white"
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-4 text-center">
        <p className="text-xs font-bold tracking-wide text-white/80 uppercase">
          Wpisowe za wyzwanie
        </p>
        <p className="font-display text-xl font-extrabold">
          {opponent.emoji} {opponent.name}
        </p>
        <p className="font-display text-4xl font-extrabold text-logo-yellow tabular-nums">
          <span aria-hidden="true">🪙 </span>
          {shown}
        </p>
        <div aria-hidden="true" className="relative h-36 w-full">
          {!reduce &&
            Array.from({ length: coins }, (_, i) => (
              <motion.span
                key={i}
                className="absolute top-0 left-1/2 text-3xl"
                initial={{ x: "-50%", y: 0, opacity: 0, rotate: 0, scale: 1.2 }}
                animate={{
                  x: `calc(-50% + ${((i % 5) - 2) * 10}px)`,
                  y: 96,
                  opacity: [0, 1, 1, 0],
                  rotate: 360 + i * 40,
                  scale: 0.8,
                }}
                transition={{
                  duration: 0.7,
                  delay: (i * (DURATION - 0.6)) / coins,
                  ease: "easeIn",
                }}
              >
                🪙
              </motion.span>
            ))}
          <motion.span
            className="absolute bottom-0 left-1/2 text-6xl"
            initial={{ x: "-50%", scale: 1 }}
            animate={reduce ? undefined : { x: "-50%", scale: [1, 1.15, 1] }}
            transition={{ duration: 0.4, delay: DURATION - 0.1 }}
          >
            🧺
          </motion.span>
        </div>
        <p role="status" className="text-lg font-bold">
          −{fee} talentów na tacę
        </p>
        <Button ref={next} onClick={finish}>
          Do walki!
        </Button>
      </div>
    </div>
  );
}
