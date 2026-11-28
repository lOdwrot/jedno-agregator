import { useState } from "react";
import { Button, Dialog } from "@/ui";
import { getCard } from "../data/cards";
import type { CardInst } from "../engine/state";
import { DUEL_CARD_PANEL, DuelCardDetail } from "./DuelCardDetail";
import { CardMini } from "./CardMini";
import { groupDiscard } from "./discardGroups";

/**
 * A look at one discard pile: every card from the top down, identical cards merged ("×3")
 * at the place of their newest copy; tap a card for its full face.
 */
export function DiscardDialog({
  pile,
  title,
  open,
  lessons = false,
  onClose,
}: {
  pile: readonly CardInst[];
  title: string;
  open: boolean;
  /** The demons' pile: card faces show "Jak kusi / Jak się bronić". */
  lessons?: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<CardInst | null>(null);
  const close = () => {
    setDetail(null);
    onClose();
  };
  const groups = groupDiscard(pile);
  return (
    <Dialog
      open={open}
      onClose={close}
      title={detail ? getCard(detail.cardId).name : title}
      hideTitle={!!detail}
      description={
        detail
          ? undefined
          : pile.length
            ? `${pile.length} ${cardsWord(pile.length)}, od ostatnio odrzuconej. Dotknij karty, aby zobaczyć szczegóły.`
            : undefined
      }
      size={detail ? "lg" : "md"}
      panelClassName={detail ? DUEL_CARD_PANEL : undefined}
    >
      {detail ? (
        <DuelCardDetail cardId={detail.cardId} finish={detail.finish} showLesson={lessons}>
          <Button variant="navy" fullWidth onClick={() => setDetail(null)}>
            Wróć do stosu
          </Button>
        </DuelCardDetail>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.length ? (
            <ol className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {groups.map(({ card, count }) => {
                const name = getCard(card.cardId).name;
                return (
                  <li key={card.uid} className="relative">
                    <button
                      type="button"
                      aria-label={`Szczegóły karty: ${name}${count > 1 ? `, ${count} sztuki` : ""}`}
                      onClick={() => setDetail(card)}
                      className="block aspect-[5/7] w-full rounded-card transition-transform hover:scale-[1.02]"
                    >
                      <CardMini cardId={card.cardId} finish={card.finish} />
                    </button>
                    {count > 1 && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-2 -right-2 rounded-full bg-navy px-2 py-0.5 font-display text-sm font-extrabold text-logo-yellow shadow-lift"
                      >
                        ×{count}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p>Stos odrzuconych jest pusty.</p>
          )}
          <Button fullWidth onClick={close}>
            Zamknij
          </Button>
        </div>
      )}
    </Dialog>
  );
}

function cardsWord(n: number): string {
  if (n === 1) return "karta";
  const t = n % 10;
  const h = n % 100;
  return t >= 2 && t <= 4 && (h < 12 || h > 14) ? "karty" : "kart";
}
