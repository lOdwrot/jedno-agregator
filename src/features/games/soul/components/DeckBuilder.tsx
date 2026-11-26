import { useState } from "react";
import { Button, Dialog, useToast } from "@/ui";
import { cn } from "@/lib/cn";
import { COLLECTIBLE, DECK_SIZE, getCard, MAX_COPIES } from "../data/cards";
import { groupDeckKeys } from "../collection/deckGroups";
import { activeDeckName } from "../collection/decks";
import {
  deckProblems,
  deckSize,
  donateSpares,
  owned,
  parseKey,
  setEnergy,
  spares,
  type CardKey,
  type Profile,
} from "../collection/profile";
import { CardFace } from "./CardFace";
import { DeckRow } from "./DeckRow";
import { DeckSlotTools } from "./DeckSlotTools";
import { DeckSwitcher } from "./DeckSwitcher";

/** Edit the active 50-card deck (one of several slots) from the owned collection (max 3 copies of a card). */
export function DeckBuilder({
  profile,
  update,
}: {
  profile: Profile;
  update: (fn: (p: Profile) => Profile) => void;
}) {
  const [preview, setPreview] = useState<CardKey | null>(null);
  const { toast } = useToast();
  const keys = (Object.keys(profile.collection) as CardKey[]).filter((k) => owned(profile, k) > 0);
  const groups = groupDeckKeys(keys);
  const problems = deckProblems(profile);
  const distinct = new Set(keys.map((k) => parseKey(k).cardId)).size;
  const extra = spares(profile);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-card bg-surface p-4 shadow-card">
        <DeckSwitcher profile={profile} update={update} />
        <DeckSlotTools profile={profile} update={update} />
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-card bg-surface p-4 shadow-card">
        <p className="font-display text-lg font-extrabold text-navy">
          {activeDeckName(profile)}: {deckSize(profile)} / {DECK_SIZE}
        </p>
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

      <section aria-labelledby="deck-group-energy" className="flex flex-col gap-2">
        <h3 id="deck-group-energy" className="font-display text-lg font-extrabold text-navy">
          Łaska
        </h3>
        <div className="flex items-center gap-3 self-start rounded-card bg-surface p-2 shadow-card">
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
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`deck-group-${g.id}`} className="flex flex-col gap-2">
          <h3 id={`deck-group-${g.id}`} className="font-display text-lg font-extrabold text-navy">
            {g.label}{" "}
            <span className="text-sm font-bold text-ink-muted">
              ({g.stacks.reduce((n, s) => n + s.length, 0)})
            </span>
          </h3>
          <ul className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2">
            {g.stacks.map((stack) => (
              <li key={stack[0]} className="min-w-0 rounded-card bg-surface shadow-card">
                {stack.length === 1 ? (
                  <DeckRow
                    cardKey={stack[0]!}
                    profile={profile}
                    update={update}
                    onPreview={setPreview}
                  />
                ) : (
                  <ol aria-label={`Linia ewolucji: ${getCard(parseKey(stack[0]!).cardId).name}`}>
                    {stack.map((k, i) => (
                      <li key={k} className={i > 0 ? "border-t border-line" : undefined}>
                        {i > 0 && isNextStage(stack, i) && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "-mb-2 block pt-1 text-xs text-ink-muted",
                              STAGE_PAD[stageOf(stack, i)],
                            )}
                          >
                            ↓ ewoluuje
                          </span>
                        )}
                        <DeckRow
                          cardKey={k}
                          profile={profile}
                          update={update}
                          onPreview={setPreview}
                          className={STAGE_PAD[stageOf(stack, i)]}
                        />
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
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
          <CardFace
            className="mt-10"
            cardId={parseKey(preview).cardId}
            finish={parseKey(preview).finish}
          />
        )}
      </Dialog>
    </div>
  );
}

const STAGE_PAD = ["pl-2", "pl-7", "pl-12", "pl-16"] as const;

/** Evolution depth of a card (0 = basic). */
function depth(cardId: string): number {
  const c = getCard(cardId);
  return c.kind === "character" && c.evolvesFrom ? 1 + depth(c.evolvesFrom) : 0;
}

/**
 * Evolution stage of row i, counted from the first card of the line (other finishes share the
 * stage; sibling evolutions — e.g. every pope from the candidate — share it too).
 */
function stageOf(stack: readonly CardKey[], i: number) {
  const stage = depth(parseKey(stack[i]!).cardId) - depth(parseKey(stack[0]!).cardId);
  return Math.min(stage, STAGE_PAD.length - 1);
}

/** Whether row i of an evolution stack is a later stage (not just another finish of the card above). */
function isNextStage(stack: readonly CardKey[], i: number) {
  return parseKey(stack[i]!).cardId !== parseKey(stack[i - 1]!).cardId;
}
