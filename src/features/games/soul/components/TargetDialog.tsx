import { useState } from "react";
import { Dialog } from "@/ui";
import { getCard } from "../data/cards";
import type { Action } from "../engine/actions";
import type { CardInst, Game } from "../engine/state";
import { dropChoices } from "../board/dropChoices";
import { CardMini } from "./CardMini";
import { CardDetailDialog, CardInfoButton } from "./CardPreview";

interface Props {
  g: Game;
  /** Hand card dropped on the table without a target (null = closed). */
  uid: number | null;
  onAction: (a: Action) => void;
  onClose: () => void;
  /** Moves the tutorial lets through right now (others are shown disabled). */
  allowed?: (a: Action) => boolean;
}

/** A card that must go on a chosen card was dropped on the table: pick the card from the tiles. */
export function TargetDialog({ g, uid, onAction, onClose, allowed = () => true }: Props) {
  const [info, setInfo] = useState<CardInst | null>(null);
  const card = uid === null ? undefined : g.players.me.hand.find((c) => c.uid === uid);
  const choices = card ? dropChoices(g, card) : [];
  const name = card ? getCard(card.cardId).name : "Karta";
  return (
    <>
      <Dialog
        open={!!card && choices.length > 0 && !info}
        onClose={onClose}
        title={name}
        description="Na którą kartę zagrać? Dotknij jej. Znaczek „i” pokazuje szczegóły karty."
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {choices.map((o, i) => {
            const ok = allowed(o.action);
            return (
              <li key={i} className="relative flex flex-col gap-1">
                <button
                  type="button"
                  disabled={!ok}
                  aria-label={`Zagraj ${name} na: ${getCard(o.card.cardId).name} (${o.note})`}
                  onClick={() => (onClose(), onAction(o.action))}
                  className="block aspect-[5/7] w-full rounded-card transition-transform hover:scale-[1.02] focus-visible:outline-4 focus-visible:outline-logo-yellow disabled:opacity-40 disabled:hover:scale-100"
                >
                  <CardMini cardId={o.card.cardId} finish={o.card.finish} />
                </button>
                <p className="text-center text-xs font-bold text-ink-muted">{o.note}</p>
                <CardInfoButton c={o.card} onInfo={setInfo} />
              </li>
            );
          })}
        </ul>
      </Dialog>
      <CardDetailDialog card={card ? info : null} onClose={() => setInfo(null)} />
    </>
  );
}
