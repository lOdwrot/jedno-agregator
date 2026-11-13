import { useState } from "react";
import { Badge, Button, Dialog, useToast } from "@/ui";
import { COLLECTIBLE, DECK_SIZE, getCard, MAX_COPIES } from "../data/cards";
import { FINISH_LABEL, RARITY_SYMBOL, type CardDef } from "../data/types";
import {
  addToDeck,
  canAddToDeck,
  deckProblems,
  deckSize,
  donateSpares,
  owned,
  parseKey,
  removeFromDeck,
  setEnergy,
  spares,
  type CardKey,
  type Profile,
} from "../collection/profile";
import { CardFace } from "./CardFace";

const ORDER: Record<CardDef["kind"], number> = {
  character: 0,
  supporter: 1,
  item: 2,
  place: 3,
  energy: 4,
};
const RANK = { common: 0, uncommon: 1, rare: 2, legendary: 3 } as const;

/** Edit the 24-card deck from the owned collection (max 2 copies of a card). */
export function DeckBuilder({
  profile,
  update,
}: {
  profile: Profile;
  update: (fn: (p: Profile) => Profile) => void;
}) {
  const [preview, setPreview] = useState<CardKey | null>(null);
  const { toast } = useToast();
  const keys = (Object.keys(profile.collection) as CardKey[])
    .filter((k) => owned(profile, k) > 0)
    .sort((a, b) => {
      const ca = getCard(parseKey(a).cardId);
      const cb = getCard(parseKey(b).cardId);
      return (
        ORDER[ca.kind] - ORDER[cb.kind] ||
        RANK[cb.rarity] - RANK[ca.rarity] ||
        ca.name.localeCompare(cb.name, "pl")
      );
    });
  const problems = deckProblems(profile);
  const distinct = new Set(keys.map((k) => parseKey(k).cardId)).size;
  const extra = spares(profile);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-card bg-surface p-4 shadow-card">
        <p className="font-display text-lg font-extrabold text-navy">
          Talia: {deckSize(profile)} / {DECK_SIZE}
        </p>
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Liczba kart Łaski w talii"
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => update((p) => setEnergy(p, p.energy - 1))}
            disabled={profile.energy === 0}
            aria-label="Usuń 1 Łaskę"
          >
            −1
          </Button>
          <span className="min-w-24 text-center font-bold text-navy">
            ✨ Łaska × {profile.energy}
          </span>
          <Button
            size="sm"
            variant="soft"
            onClick={() => update((p) => setEnergy(p, p.energy + 1))}
            disabled={deckSize(profile) >= DECK_SIZE}
            aria-label="Dodaj 1 Łaskę"
          >
            +1
          </Button>
        </div>
        <p className="text-sm text-ink-muted sm:ml-auto">
          Kolekcja: {distinct} / {COLLECTIBLE.length} różnych kart
        </p>
      </div>
      {deckSize(profile) >= DECK_SIZE && (
        <p className="text-sm text-ink-muted">
          Talia jest pełna — żeby dodać nową kartę, najpierw usuń inną albo jedną Łaskę (−1).
        </p>
      )}
      {problems.length > 0 && (
        <ul className="rounded-card bg-danger/12 p-3 text-sm text-danger" aria-live="polite">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <ul className="grid gap-2 sm:grid-cols-2">
        {keys.map((k) => {
          const { cardId, finish } = parseKey(k);
          const c = getCard(cardId);
          const inDeck = profile.deck.filter((x) => x === k).length;
          return (
            <li key={k} className="flex items-center gap-3 rounded-card bg-surface p-2 shadow-card">
              <button
                type="button"
                onClick={() => setPreview(k)}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface-muted text-2xl"
                >
                  {c.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold text-navy">
                    {c.name}
                    <span className="sr-only"> — podgląd karty</span>
                  </span>
                  <span className="flex flex-wrap gap-1 text-xs text-ink-muted">
                    <span aria-hidden="true">{RARITY_SYMBOL[c.rarity]}</span>
                    {finish !== "plain" && <Badge tone="accent">{FINISH_LABEL[finish]}</Badge>}
                    <span>masz × {owned(profile, k)}</span>
                  </span>
                </span>
              </button>
              <div
                className="flex shrink-0 items-center gap-1"
                role="group"
                aria-label={`${c.name} w talii`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => update((p) => removeFromDeck(p, k))}
                  disabled={!inDeck}
                  aria-label={`Usuń z talii: ${c.name}`}
                >
                  −
                </Button>
                <span
                  className="w-6 text-center font-bold text-navy"
                  aria-label={`w talii: ${inDeck}`}
                >
                  {inDeck}
                </span>
                <Button
                  size="sm"
                  variant="soft"
                  onClick={() => update((p) => addToDeck(p, k))}
                  disabled={!canAddToDeck(profile, k)}
                  aria-label={`Dodaj do talii: ${c.name}`}
                >
                  +
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-ink-muted">
        W talii możesz mieć najwyżej {MAX_COPIES} egzemplarze tej samej karty (dowolnej wersji).
        Łaska jest bez limitu.
      </p>
      {extra.length > 0 && (
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            const { profile: next, gained } = donateSpares(profile);
            update(() => next);
            toast(`Bóg zapłać! +${gained} talentów za ofiarę.`, { tone: "success" });
          }}
        >
          Oddaj nadmiarowe karty na tacę ({extra.reduce((s, x) => s + x.extra, 0)})
        </Button>
      )}

      <Dialog
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Podgląd karty"
        hideTitle
        size="sm"
      >
        {preview && (
          <CardFace cardId={parseKey(preview).cardId} finish={parseKey(preview).finish} />
        )}
      </Dialog>
    </div>
  );
}
