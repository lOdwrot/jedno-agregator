import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/ui";
import { sfx } from "../audio/sfx";
import { PatronPortrait } from "./PatronPortrait";
import { RANKS } from "./ranks";
import { rankIndex, rankProgress, rankStops } from "./xp";

interface Props {
  xp: number;
  /** Points before the duel: the bar fills / drains from here, promotions and demotions are animated. */
  from?: number;
  /** Makes the patron a button (the hub opens the patron's story). */
  onPatron?: () => void;
  className?: string;
}

const SPEED = 140; // points per second
const HOLD = 0.9; // seconds on a rank change

/** Rank, patron (above the bar) and the progress bar to the next rank; animates a duel's gain or loss. */
export function RankMeter({ xp, from, onPatron, className }: Props) {
  const reduce = usePrefersReducedMotion();
  const animated = from !== undefined && from !== xp && !reduce;
  const [v, setV] = useState(animated ? from : xp);
  const [change, setChange] = useState<"up" | "down" | null>(
    from !== undefined && reduce && rankIndex(from) !== rankIndex(xp)
      ? rankIndex(xp) > rankIndex(from)
        ? "up"
        : "down"
      : null,
  );
  const startRef = useRef(from);

  useEffect(() => {
    const start = startRef.current;
    if (!animated || start === undefined) {
      setV(xp);
      return;
    }
    let stopped = false;
    let ctl: ReturnType<typeof animate> | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const run = async () => {
      let at = start;
      await new Promise((r) => (timer = setTimeout(r, 400)));
      for (const stop of rankStops(start, xp)) {
        if (stopped) return;
        const before = rankIndex(at);
        ctl = animate(at, stop, {
          duration: Math.max(0.35, Math.abs(stop - at) / SPEED),
          ease: "easeInOut",
          onUpdate: setV,
        });
        await ctl;
        at = stop;
        const after = rankIndex(stop);
        if (stopped || after === before) continue;
        const up = after > before;
        setChange(up ? "up" : "down");
        if (up) sfx.evolve();
        else sfx.weak();
        await new Promise((r) => (timer = setTimeout(r, HOLD * 1000)));
      }
    };
    void run();
    return () => {
      stopped = true;
      ctl?.stop();
      clearTimeout(timer);
    };
  }, [animated, xp]);

  const { index, into, need, fraction } = rankProgress(v);
  const rank = RANKS[index]!;
  const next = RANKS[index + 1];
  const delta = from === undefined ? 0 : xp - from;
  const finalIndex = rankIndex(xp);

  return (
    <section
      aria-label="Ranga"
      className={cn(
        "relative flex flex-col items-center gap-2 overflow-hidden rounded-card bg-navy px-4 pt-4 pb-3 text-center text-white",
        className,
      )}
    >
      <PatronPortrait rank={rank} change={change} onClick={onPatron} />
      <div className="flex flex-col items-center">
        <p className="text-xs font-bold tracking-wide text-white/80 uppercase">
          Ranga {index + 1} z {RANKS.length}
        </p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={rank.name}
            className="font-display text-2xl font-extrabold"
            initial={{ opacity: 0, y: change === "down" ? -12 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: change === "down" ? 12 : -12 }}
            transition={{ duration: 0.3 }}
          >
            <span aria-hidden="true">{rank.emoji} </span>
            {rank.name}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm text-white/85">Patron: {rank.patron.name}</p>
      </div>
      <div className="w-full max-w-sm">
        <div
          role="progressbar"
          aria-label={next ? `Postęp do rangi ${next.name}` : "Najwyższa ranga"}
          aria-valuemin={0}
          aria-valuemax={need || 1}
          aria-valuenow={need ? Math.round(into) : 1}
          className="relative h-3 overflow-hidden rounded-pill bg-white/15"
        >
          <div
            className="absolute inset-0 origin-left rounded-pill bg-logo-yellow"
            style={{ transform: `scaleX(${fraction})` }}
          />
        </div>
        <p className="mt-1 flex justify-between gap-2 text-xs font-bold text-white/85 tabular-nums">
          <span>{next ? `${Math.round(into)} / ${need} pkt` : `${Math.round(v)} pkt`}</span>
          <span>{next ? `dalej: ${next.name}` : "najwyższa ranga"}</span>
        </p>
      </div>
      {from !== undefined && (
        <p role="status" className="text-sm font-bold">
          <span className={delta >= 0 ? "text-logo-yellow" : "text-white"}>
            {delta >= 0 ? `+${delta}` : `−${-delta}`} pkt rangi
          </span>
          {finalIndex !== rankIndex(from) && (
            <span className="sr-only">
              {finalIndex > rankIndex(from) ? " Awans na rangę: " : " Spadek do rangi: "}
              {RANKS[finalIndex]!.name}.
            </span>
          )}
        </p>
      )}
    </section>
  );
}
