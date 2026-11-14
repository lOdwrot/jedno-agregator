import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import { CardArt } from "./CardArt";
import { FINISH_LABEL, RARITY_LABEL, RARITY_SYMBOL, type Finish } from "../data/types";

/** Compact card front (booster reveal, small grids): art, name, rarity and print. */
export function CardMini({
  cardId,
  finish,
  fresh,
}: {
  cardId: string;
  finish: Finish;
  fresh?: boolean;
}) {
  const c = getCard(cardId);
  return (
    <span className="relative block size-full overflow-hidden rounded-card p-1">
      {finish !== "plain" && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -inset-1/2",
            finish === "stained" ? "soul-holo" : "bg-logo-yellow",
          )}
        />
      )}
      <span
        className={cn(
          "relative flex size-full flex-col gap-1 rounded-[0.8rem] p-1.5 text-center",
          c.rarity === "legendary" ? "bg-accent-soft" : "bg-surface",
          finish === "plain" && "ring-1 ring-line",
        )}
      >
        <span className="relative grid flex-1 place-items-center overflow-hidden rounded-lg bg-gradient-to-b from-logo-blue/40 to-surface-muted">
          <CardArt cardId={cardId} emojiClass="text-4xl" />
        </span>
        <span className="line-clamp-2 text-xs leading-tight font-extrabold text-navy sm:text-sm">
          {c.name}
        </span>
        <span className="text-[0.7rem] font-bold text-ink-muted">
          <span aria-hidden="true">{RARITY_SYMBOL[c.rarity]} </span>
          {RARITY_LABEL[c.rarity]}
          {finish !== "plain" && ` · ${FINISH_LABEL[finish]}`}
        </span>
        {fresh && (
          <span className="absolute top-1 left-1 rounded-full bg-navy px-2 py-0.5 text-[0.65rem] font-extrabold text-white">
            nowa!
          </span>
        )}
      </span>
    </span>
  );
}
