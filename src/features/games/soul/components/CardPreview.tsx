import { useState } from "react";
import { Button, Dialog, Icon, IconButton } from "@/ui";
import { getCard } from "../data/cards";
import type { CardInst } from "../engine/state";
import { TiltCard } from "../album/TiltCard";
import { CardMini } from "./CardMini";

/** Small "i" badge on a card tile: opens the card details without choosing the card. */
export function CardInfoButton({ c, onInfo }: { c: CardInst; onInfo: (c: CardInst) => void }) {
  return (
    <IconButton
      variant="glass"
      label={`Szczegóły karty: ${getCard(c.cardId).name}`}
      onClick={() => onInfo(c)}
      className="absolute -top-2 -right-2 z-10"
    >
      <Icon name="info" className="size-5" />
    </IconButton>
  );
}

/** Full card face in a dialog — a look only, no actions. */
export function CardDetailDialog({
  card,
  onClose,
}: {
  card: CardInst | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!card}
      onClose={onClose}
      title={card ? getCard(card.cardId).name : "Karta"}
      hideTitle
      size="sm"
    >
      {card && (
        <div className="flex flex-col gap-3 pt-10">
          <TiltCard cardId={card.cardId} finish={card.finish} />
          <Button variant="navy" fullWidth onClick={onClose}>
            Wróć do wyboru
          </Button>
        </div>
      )}
    </Dialog>
  );
}

/** "Spójrz na rękę" — the hand at a glance while a choice is pending; tap a card for its details. */
export function HandDialog({
  hand,
  open,
  onClose,
}: {
  hand: CardInst[];
  open: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<CardInst | null>(null);
  const close = () => {
    setDetail(null);
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={close}
      title={detail ? getCard(detail.cardId).name : "Twoja ręka"}
      hideTitle={!!detail}
      description={detail ? undefined : "Dotknij karty, aby zobaczyć jej szczegóły."}
    >
      {detail ? (
        <div className="flex flex-col gap-3 pt-10">
          <TiltCard cardId={detail.cardId} finish={detail.finish} />
          <Button variant="navy" fullWidth onClick={() => setDetail(null)}>
            Wróć do ręki
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {hand.length ? (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {hand.map((c) => (
                <li key={c.uid}>
                  <button
                    type="button"
                    aria-label={`Szczegóły karty: ${getCard(c.cardId).name}`}
                    onClick={() => setDetail(c)}
                    className="block aspect-[5/7] w-full rounded-card transition-transform hover:scale-[1.02]"
                  >
                    <CardMini cardId={c.cardId} finish={c.finish} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nie masz kart na ręce.</p>
          )}
          <Button fullWidth onClick={close}>
            Wróć do wyboru
          </Button>
        </div>
      )}
    </Dialog>
  );
}
