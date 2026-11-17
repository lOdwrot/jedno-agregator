import { getCard } from "../data/cards";
import type { DeckList } from "../engine/state";

/** Umami keeps at most 50 properties per event; 2 go to difficulty + mode. */
export const MAX_CARD_PROPS = 48;

/**
 * The deck as statistics properties: card name → copies (finishes merged), most copies first,
 * capped at `MAX_CARD_PROPS`. In Umami each card becomes a property, so its count = in how many
 * winning (or losing) decks the card was played.
 */
export function deckStats(deck: DeckList): Record<string, number> {
  const copies = new Map<string, number>();
  for (const { cardId } of deck) {
    const name = getCard(cardId).name;
    copies.set(name, (copies.get(name) ?? 0) + 1);
  }
  return Object.fromEntries(
    [...copies]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pl"))
      .slice(0, MAX_CARD_PROPS),
  );
}
