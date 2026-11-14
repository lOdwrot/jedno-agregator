import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button, Dialog } from "@/ui";
import { getCard, isCharacter } from "../data/cards";
import type { Action } from "../engine/actions";
import { aiSearch } from "../engine/aiSearch";
import type { CardInst, Game } from "../engine/state";
import { CardMini } from "./CardMini";

interface Props {
  g: Game;
  open: boolean;
  onAction: (a: Action) => void;
}

function CardPick({
  c,
  on,
  label,
  onToggle,
}: {
  c: CardInst;
  on: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={on}
        aria-label={`${label}: ${getCard(c.cardId).name}`}
        onClick={onToggle}
        className={cn(
          "block aspect-[5/7] w-full rounded-card transition-transform",
          on ? "scale-95 ring-4 ring-accent" : "hover:scale-[1.02]",
        )}
      >
        <CardMini cardId={c.cardId} finish={c.finish} />
      </button>
    </li>
  );
}

/** Ultra-ball card (Ogłoszenia parafialne): choose the cards to discard and a character from the deck. */
export function SearchDialog({ g, open, onAction }: Props) {
  const me = g.players.me;
  const need = g.search?.discard ?? 2;
  const [discard, setDiscard] = useState<number[]>([]);
  const [pick, setPick] = useState<number | null>(null);
  // one tile per print (the deck may hold 3 identical copies)
  const chars = me.deck
    .filter((c) => isCharacter(getCard(c.cardId)))
    .filter(
      (c, i, all) => all.findIndex((x) => x.cardId === c.cardId && x.finish === c.finish) === i,
    )
    .sort((a, b) => getCard(a.cardId).name.localeCompare(getCard(b.cardId).name, "pl"));
  const toggle = (uid: number) =>
    setDiscard((d) =>
      d.includes(uid) ? d.filter((x) => x !== uid) : d.length < need ? [...d, uid] : d,
    );
  const done = (a: Action) => {
    setDiscard([]);
    setPick(null);
    onAction(a);
  };
  const auto = () => {
    const a = aiSearch(g, "me");
    if (a) done(a);
  };
  const ready = discard.length === need && pick !== null;
  return (
    <Dialog
      open={open}
      onClose={auto}
      title="Ogłoszenia parafialne"
      description={`Wybierz ${need} karty z ręki do odrzucenia i jedną postać z talii.`}
    >
      <div className="flex flex-col gap-4">
        <section aria-labelledby="soul-search-hand">
          <h3 id="soul-search-hand" className="font-display font-extrabold text-navy">
            Odrzuć z ręki ({discard.length}/{need})
          </h3>
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {me.hand.map((c) => (
              <CardPick
                key={c.uid}
                c={c}
                label="Odrzuć"
                on={discard.includes(c.uid)}
                onToggle={() => toggle(c.uid)}
              />
            ))}
          </ul>
        </section>
        <section aria-labelledby="soul-search-deck">
          <h3 id="soul-search-deck" className="font-display font-extrabold text-navy">
            Weź z talii
          </h3>
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {chars.map((c) => (
              <CardPick
                key={c.uid}
                c={c}
                label="Weź"
                on={pick === c.uid}
                onToggle={() => setPick(pick === c.uid ? null : c.uid)}
              />
            ))}
          </ul>
        </section>
        <Button
          fullWidth
          disabled={!ready}
          onClick={() => pick !== null && done({ type: "search", discard, pick })}
        >
          Odrzuć i weź postać
        </Button>
        <Button variant="link" onClick={auto}>
          Wybierz za mnie
        </Button>
      </div>
    </Dialog>
  );
}
