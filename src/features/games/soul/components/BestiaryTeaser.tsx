import type { CardDef } from "../data/types";
import { RECOGNIZE_AT } from "../collection/bestiary";
import { CardArt } from "./CardArt";

const KIND: Record<CardDef["kind"], string> = {
  character: "Postać",
  item: "Przedmiot",
  supporter: "Pomocnik",
  place: "Miejsce",
  energy: "Energia",
};

/** A met but not yet recognized card: greyed-out art, name and how many sightings are left. */
export function BestiaryTeaser({ card, seen }: { card: CardDef; seen: number }) {
  const left = RECOGNIZE_AT - seen;
  return (
    <article
      aria-label={`Karta jeszcze nierozpoznana: ${card.name}`}
      className="flex h-full flex-col gap-2 rounded-card bg-surface-muted p-3 text-ink shadow-card"
    >
      <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">{KIND[card.kind]}</p>
      <h4 className="font-display text-lg leading-tight font-extrabold text-navy">{card.name}</h4>
      <div
        aria-hidden="true"
        className="relative grid h-32 place-items-center overflow-hidden rounded-xl bg-navy opacity-60 grayscale"
      >
        <CardArt cardId={card.id} emojiClass="text-6xl" />
      </div>
      <p className="text-sm text-ink-muted">
        Spotkana {seen} z {RECOGNIZE_AT} razy. Zobacz ją w walce jeszcze {left}{" "}
        {left === 1 ? "raz" : "razy"}, aby poznać szczegóły.
      </p>
      <div
        role="progressbar"
        aria-label={`Rozpoznawanie: ${card.name}`}
        aria-valuemin={0}
        aria-valuemax={RECOGNIZE_AT}
        aria-valuenow={seen}
        className="h-2 overflow-hidden rounded-full bg-white"
      >
        <div
          className="h-full origin-left bg-navy"
          style={{ transform: `scaleX(${seen / RECOGNIZE_AT})` }}
        />
      </div>
    </article>
  );
}
