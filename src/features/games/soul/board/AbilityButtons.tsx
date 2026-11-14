import { Button } from "@/ui";
import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import type { Action } from "../engine/actions";
import { readyAbilities } from "../engine/abilities";
import { charDef, type Game } from "../engine/state";
import { computeSlots, slotRect } from "./layout";

interface Props {
  /** State the canvas currently shows (positions). */
  view: Game;
  /** State the moves are checked against. */
  live: Game;
  busy: boolean;
  w: number;
  h: number;
  onAction: (a: Action) => void;
}

/**
 * A visible "✦ Moc" button on every own character in play whose ability is usable now — the ability
 * fires straight from the table, without opening the card details.
 */
export function AbilityButtons({ view, live, busy, w, h, onAction }: Props) {
  if (busy) return null;
  const ready = readyAbilities(live, "me");
  if (!ready.length) return null;
  const slots = computeSlots(view, w, h);
  return (
    <>
      {ready.map((c) => {
        const s = slots.find((x) => x.key === c.uid && x.pid === "me");
        if (!s) return null;
        const r = slotRect(s);
        const ability = charDef(c).ability!;
        return (
          <Button
            key={c.uid}
            size="sm"
            variant="navy"
            title={`${ability.name}: ${ability.text}`}
            aria-label={`Użyj mocy: ${ability.name} (${getCard(c.cardId).name})`}
            onClick={() => onAction({ type: "ability", target: c.uid })}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 gap-1 px-3 ring-2 ring-logo-yellow",
              "bg-logo-blue hover:bg-navy-600 focus-visible:outline-4 focus-visible:outline-logo-yellow",
            )}
            style={{ left: r.x + r.w / 2, top: r.y + r.h * 0.42, zIndex: 900 }}
          >
            <span aria-hidden="true">✦</span> Moc
          </Button>
        );
      })}
    </>
  );
}
