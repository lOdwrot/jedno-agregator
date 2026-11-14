import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { tone } from "../audio/context";
import { packSfx } from "../audio/packSfx";
import type { PackType } from "../collection/packs";
import { BoosterPack } from "./BoosterPack";
import type { IntroPhase } from "./boosterTimeline";
import { CardBack } from "./CardBack";

/** Jagged tear line (x%, y%) shared by the strip and the body so they fit together. */
const TEAR_Y = 13;
const ZIG: (readonly [number, number])[] = [
  [-10, TEAR_Y],
  ...Array.from({ length: 21 }, (_, i) => [i * 5, TEAR_Y + (i % 2 ? 1.2 : -1.2)] as const),
  [110, TEAR_Y],
];
const pts = (list: readonly (readonly [number, number])[]) =>
  list.map(([x, y]) => `${x}% ${y}%`).join(", ");
const STRIP_CLIP = `polygon(-10% -10%, 110% -10%, ${pts([...ZIG].reverse())})`;
const BODY_CLIP = `polygon(${pts(ZIG)}, 110% 110%, -10% 110%)`;

const POP_START = 0.15;
const POP_GAP = 0.15;

interface Props {
  pack: PackType;
  count: number;
  phase: IntroPhase;
  /** Prefix of the layoutIds shared with the cards in the reveal grid. */
  layoutPrefix: string;
}

/**
 * The sealed pack is squeezed (charge), its top strip tears off right-to-left and flies away (tear),
 * then the cards pop out one by one into a fan while the empty pack falls away (burst).
 */
export function BoosterIntro({ pack, count, phase, layoutPrefix }: Props) {
  const opened = phase !== "charge";
  // cards that already left the pack are drawn in front of it
  const [out, setOut] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    if (phase === "charge") {
      packSfx.crinkle(1);
      for (let i = 0; i < 8; i++)
        tone(80 + i * 25, 0.25, {
          type: "sawtooth",
          gain: 0.015 + i * 0.005,
          delay: 0.2 + i * 0.1,
          cutoff: 500 + i * 120,
        });
    }
    if (phase === "tear") {
      packSfx.rip(0.48);
      at(470, packSfx.snap);
    }
    if (phase === "burst") {
      packSfx.whoosh();
      for (let i = 0; i < count; i++) {
        at((POP_START + i * POP_GAP) * 1000, () => packSfx.pop(i));
        at((POP_START + i * POP_GAP + 0.36) * 1000, () => setOut(i + 1));
      }
      at(1150, packSfx.drop);
    }
    return () => timers.forEach(clearTimeout);
  }, [phase, count]);

  const mid = (count - 1) / 2;
  return (
    <div className="relative mt-[12vh] aspect-[5/8] w-48 sm:w-60">
      {/* light escaping from the opening */}
      {opened && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[5%] top-[2%] h-[22%] rounded-full bg-logo-yellow/80 blur-2xl"
          initial={{ opacity: 0, scaleY: 0.2 }}
          animate={{ opacity: phase === "burst" ? [1, 0.9, 0] : 0.85, scaleY: 1 }}
          transition={{ duration: phase === "burst" ? 1.4 : 0.4 }}
        />
      )}

      {/* the cards, hidden inside the pack until they pop out */}
      {Array.from({ length: count }, (_, i) => {
        const fx = (i - mid) * 34;
        const rot = (i - mid) * 7;
        const delay = POP_START + i * POP_GAP;
        return (
          <motion.div
            key={i}
            layoutId={`${layoutPrefix}-${i}`}
            className="absolute inset-x-[12%] top-[15%] aspect-[5/7]"
            style={{ zIndex: i < out ? 30 : 0 }}
            animate={
              phase === "burst"
                ? {
                    y: ["0%", "-118%", "-92%"],
                    x: ["0%", `${fx * 0.4}%`, `${fx}%`],
                    rotate: [0, rot * 1.6, rot],
                    scale: [1, 1.06, 0.9],
                  }
                : { y: "0%" }
            }
            transition={{
              delay,
              duration: 0.75,
              times: [0, 0.45, 1],
              ease: "easeOut",
            }}
          >
            <CardBack foil={pack.foil} className="size-full" />
          </motion.div>
        );
      })}

      {/* the pack itself: body + top strip cut along the same jagged line */}
      <motion.div
        className={cn("absolute inset-0 z-10", phase === "charge" && "soul-pack-shake")}
        initial={{ scale: 0.6, y: 60, opacity: 0 }}
        animate={
          phase === "burst"
            ? { scale: 0.95, y: "70%", opacity: 0, rotate: -6 }
            : { scale: 1, y: 0, opacity: 1, rotate: 0 }
        }
        transition={
          phase === "burst"
            ? { delay: POP_START + count * POP_GAP + 0.3, duration: 0.6, ease: "easeIn" }
            : { duration: 0.45, ease: "easeOut" }
        }
      >
        <div className="absolute inset-0" style={{ clipPath: BODY_CLIP }}>
          <BoosterPack pack={pack} className="w-full sm:w-full" />
        </div>
        <motion.div
          className="absolute inset-0"
          style={{ clipPath: STRIP_CLIP, transformOrigin: `2% ${TEAR_Y}%` }}
          animate={
            opened
              ? {
                  rotate: [0, -4, -12, -55],
                  x: [0, 2, 8, 260],
                  y: [0, -4, -18, -320],
                  opacity: [1, 1, 1, 0],
                }
              : {}
          }
          transition={{ duration: 1, times: [0, 0.3, 0.5, 1], ease: "easeIn" }}
        >
          <BoosterPack pack={pack} className="w-full sm:w-full" />
        </motion.div>
        {/* bright seam running along the tear from right to left */}
        {phase === "tear" && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 h-1 origin-right rounded-full bg-surface ring-2 ring-logo-yellow/60"
            style={{ top: `${TEAR_Y - 0.5}%` }}
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: [1, 1, 0] }}
            transition={{ duration: 0.5, ease: "easeIn" }}
          />
        )}
      </motion.div>
    </div>
  );
}
