/**
 * Several decks (`DECK_SLOTS`). The ACTIVE deck always lives in `Profile.deck` / `Profile.energy`
 * (everything else — duels, PvP, stats — reads only those), the other slots wait in
 * `Profile.decks`. Older saves have no slots: their deck simply becomes "Talia 1".
 */
import type { CardKey, Profile } from "./profile";

export const DECK_SLOTS = 3;
export const MAX_DECK_NAME = 24;

export interface DeckSlot {
  name: string;
  deck: CardKey[];
  energy: number;
}

export const defaultDeckName = (i: number) => `Talia ${i + 1}`;

export const activeDeckIndex = (p: Profile) => {
  const i = p.activeDeck ?? 0;
  return i >= 0 && i < DECK_SLOTS ? i : 0;
};

/** All slots, the active one filled from the live deck. */
export function deckSlots(p: Profile): DeckSlot[] {
  const active = activeDeckIndex(p);
  return Array.from({ length: DECK_SLOTS }, (_, i) => {
    const saved = p.decks?.[i];
    const name = saved?.name ?? defaultDeckName(i);
    if (i === active) return { name, deck: [...p.deck], energy: p.energy };
    return saved ? { name, deck: [...saved.deck], energy: saved.energy } : emptySlot(i);
  });
}

const emptySlot = (i: number): DeckSlot => ({ name: defaultDeckName(i), deck: [], energy: 0 });

/** Name to show (a blank name falls back to "Talia N"). */
export const shownName = (s: DeckSlot, i: number) => s.name.trim() || defaultDeckName(i);
export const activeDeckName = (p: Profile) =>
  shownName(deckSlots(p)[activeDeckIndex(p)]!, activeDeckIndex(p));
export const slotSize = (s: DeckSlot) => s.deck.length + s.energy;

/** Makes slot `i` the active deck (the current one is stored in its slot). */
export function switchDeck(p: Profile, i: number): Profile {
  if (i < 0 || i >= DECK_SLOTS || i === activeDeckIndex(p)) return p;
  const slots = deckSlots(p);
  const next = slots[i]!;
  return { ...p, decks: slots, activeDeck: i, deck: [...next.deck], energy: next.energy };
}

/** Copies the active deck into slot `i` (its name stays). */
export function copyActiveDeck(p: Profile, i: number): Profile {
  if (i < 0 || i >= DECK_SLOTS || i === activeDeckIndex(p)) return p;
  const slots = deckSlots(p);
  slots[i] = { name: slots[i]!.name, deck: [...p.deck], energy: p.energy };
  return { ...p, decks: slots };
}

/** Empties the active deck (a fresh start in this slot). */
export const clearActiveDeck = (p: Profile): Profile => ({ ...p, deck: [], energy: 0 });

export function renameDeck(p: Profile, i: number, name: string): Profile {
  if (i < 0 || i >= DECK_SLOTS) return p;
  const slots = deckSlots(p);
  // kept as typed (spaces too) — `deckSlots` shows the default name for a blank one
  slots[i] = { ...slots[i]!, name: name.slice(0, MAX_DECK_NAME) };
  return { ...p, decks: slots };
}
