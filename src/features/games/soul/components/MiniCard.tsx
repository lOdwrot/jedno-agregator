import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import { ENERGY_LABEL, STATUS_INFO, type CharacterDef } from "../data/types";
import { hpLeft, maxHp, type Game, type InPlay } from "../engine/state";
import { ELEMENT_ART, FINISH_FRAME } from "./styles";

interface Props {
  c: InPlay;
  g: Game;
  role: string;
  big?: boolean;
  highlight?: boolean;
  onSelect: () => void;
}

/** A character on the table (active spot or pew/bench). */
export function MiniCard({ c, g, role, big, highlight, onSelect }: Props) {
  const d = getCard(c.cardId) as CharacterDef;
  const left = hpLeft(c);
  const max = maxHp(c);
  const energy = ENERGY_LABEL[d.side];
  const statuses = c.statuses.map((s) => STATUS_INFO[s].label.toLowerCase()).join(", ");
  const details = `, ${role}, wytrwałość ${left} z ${max}, ${energy.name}: ${c.energy}${statuses ? `, ${statuses}` : ""}. Szczegóły`;
  const hit = g.hit?.uid === c.uid ? g.hit : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative block rounded-card text-left transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none",
        FINISH_FRAME[c.finish],
        big ? "w-28 sm:w-40" : "w-[5.5rem] sm:w-28",
        highlight && "ring-4 ring-accent",
      )}
    >
      <span
        className={cn(
          "flex flex-col gap-1 rounded-[0.8rem] p-1.5 shadow-card",
          d.side === "demons" ? "bg-navy-800 text-white" : "bg-surface text-ink",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "grid place-items-center rounded-lg bg-gradient-to-br",
            ELEMENT_ART[d.element],
            big ? "h-14 text-4xl sm:h-24 sm:text-6xl" : "h-10 text-2xl sm:h-14 sm:text-3xl",
          )}
        >
          {d.emoji}
        </span>
        <span className="truncate text-xs font-extrabold sm:text-sm">
          {d.name}
          <span className="sr-only">{details}</span>
        </span>
        <span aria-hidden="true" className="block h-1.5 overflow-hidden rounded-full bg-pill">
          <span
            className={cn(
              "block h-full origin-left rounded-full transition-transform duration-500",
              left / max > 0.35 ? "bg-success" : "bg-danger",
            )}
            style={{ transform: `scaleX(${left / max})` }}
          />
        </span>
        <span aria-hidden="true" className="flex items-center justify-between text-xs font-bold">
          <span>
            {left}/{max}
          </span>
          <span className="truncate">
            {c.statuses.map((s) => STATUS_INFO[s].emoji).join("")}
            {c.energy > 0 && ` ${energy.emoji}${c.energy}`}
          </span>
        </span>
      </span>
      <AnimatePresence>
        {hit && (
          <motion.span
            key={hit.seq}
            aria-hidden="true"
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -36, scale: 1.15 }}
            transition={{ duration: 1.2 }}
            className="pointer-events-none absolute inset-x-0 top-1/3 text-center font-display text-2xl font-extrabold text-danger drop-shadow"
          >
            −{hit.amount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/** Empty spot placeholder. */
export function EmptySlot({ big, label, dark }: { big?: boolean; label: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        "grid place-items-center rounded-card border-2 border-dashed text-center text-xs",
        dark ? "border-white/30 text-white/80" : "border-navy/20 text-ink-muted",
        big ? "h-28 w-28 sm:h-44 sm:w-40" : "h-[5.5rem] w-[5.5rem] sm:h-28 sm:w-28",
      )}
    >
      {label}
    </span>
  );
}
