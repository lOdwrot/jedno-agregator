import { Badge, Button } from "@/ui";
import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import { FINISH_LABEL, RARITY_SYMBOL } from "../data/types";
import {
  addToDeck,
  canAddToDeck,
  owned,
  parseKey,
  removeFromDeck,
  type CardKey,
  type Profile,
} from "../collection/profile";
import { CardArt } from "./CardArt";

/** One owned card version in the deck builder: preview button + −/+ deck counter. */
export function DeckRow({
  cardKey: k,
  profile,
  update,
  onPreview,
  className,
}: {
  cardKey: CardKey;
  profile: Profile;
  update: (fn: (p: Profile) => Profile) => void;
  onPreview: (k: CardKey) => void;
  className?: string;
}) {
  const { cardId, finish } = parseKey(k);
  const c = getCard(cardId);
  const inDeck = profile.deck.filter((x) => x === k).length;
  return (
    <div className={cn("flex items-center gap-3 p-2", className)}>
      <button
        type="button"
        onClick={() => onPreview(k)}
        className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          aria-hidden="true"
          className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-muted"
        >
          <CardArt cardId={cardId} emojiClass="text-2xl" />
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
        <span className="w-6 text-center font-bold text-navy" aria-label={`w talii: ${inDeck}`}>
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
    </div>
  );
}
