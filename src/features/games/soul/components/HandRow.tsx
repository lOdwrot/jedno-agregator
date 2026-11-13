import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import { canAttach, canBench, evolveTargets } from "../engine/actions";
import { canPlaySupport } from "../engine/support";
import type { CardInst, Game } from "../engine/state";
import { FINISH_FRAME } from "./styles";

const KIND = {
  character: "postać",
  item: "przedmiot",
  supporter: "pomocnik",
  place: "miejsce",
  energy: "energia",
} as const;

function playable(g: Game, c: CardInst): boolean {
  const d = getCard(c.cardId);
  if (g.phase === "setup") return d.kind === "character" && !d.evolvesFrom;
  if (g.phase !== "main" || g.turn !== "me") return false;
  if (d.kind === "character")
    return d.evolvesFrom ? evolveTargets(g, "me", c).length > 0 : canBench(g, "me", c);
  if (d.kind === "energy") return canAttach(g, "me", c);
  return canPlaySupport(g, "me", c);
}

/** The player's hand — a scrollable row of small cards. */
export function HandRow({ g, onSelect }: { g: Game; onSelect: (uid: number) => void }) {
  const hand = g.players.me.hand;
  return (
    <section aria-labelledby="soul-hand">
      <h3 id="soul-hand" className="mb-2 text-sm font-extrabold text-navy">
        Twoja ręka ({hand.length})
      </h3>
      <ul className="flex gap-2 overflow-x-auto pt-1 pb-2">
        {hand.map((c) => {
          const d = getCard(c.cardId);
          const ok = playable(g, c);
          return (
            <li key={c.uid} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(c.uid)}
                className={cn(
                  "block w-20 rounded-card text-left transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none sm:w-24",
                  FINISH_FRAME[c.finish],
                  ok && "ring-2 ring-accent ring-offset-2 ring-offset-canvas",
                )}
              >
                <span className="flex h-28 flex-col items-center justify-between rounded-[0.8rem] bg-surface p-2 text-center shadow-card">
                  <span aria-hidden="true" className="text-3xl">
                    {d.emoji}
                  </span>
                  <span className="line-clamp-2 text-xs leading-tight font-bold text-navy">
                    {d.name}
                  </span>
                  <span className="text-[0.7rem] text-ink-muted">
                    {KIND[d.kind]}
                    <span className="sr-only">{ok ? ", można zagrać" : ""}. Szczegóły</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
