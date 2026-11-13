/** Player's collection, deck, currency ("talenty") and boosters — pure functions + storage. */
import { COLLECTIBLE, DECK_SIZE, ENERGY_ID, getCard, isBasic, MAX_COPIES } from "../data/cards";
import type { Finish, Rarity } from "../data/types";
import type { DeckList } from "../engine/state";

/** Collection key: "cardId:finish". */
export type CardKey = `${string}:${Finish}`;
export const keyOf = (cardId: string, finish: Finish): CardKey => `${cardId}:${finish}`;
export function parseKey(k: CardKey): { cardId: string; finish: Finish } {
  const [cardId, finish] = k.split(":") as [string, Finish];
  return { cardId, finish };
}

export interface Profile {
  version: 1;
  talents: number;
  /** Booster openings earned by finished duels (one per duel). */
  packs: number;
  collection: Partial<Record<CardKey, number>>;
  /** Non-energy cards of the deck. */
  deck: CardKey[];
  energy: number;
  wins: number;
  losses: number;
  /** Opponents beaten at least once. */
  beaten: string[];
}

export const BOOSTER_PRICE = 100;
export const BOOSTER_SIZE = 5;

const STARTER: [string, number][] = [
  ["ministrant", 2],
  ["lektor", 1],
  ["kleryk", 2],
  ["wikariusz", 1],
  ["scholanka", 2],
  ["babcia", 2],
  ["oazowicz", 2],
  ["rozaniec", 2],
  ["woda", 1],
  ["koscielny", 1],
];

export function newProfile(): Profile {
  const collection: Profile["collection"] = {};
  const deck: CardKey[] = [];
  for (const [id, n] of STARTER) {
    collection[keyOf(id, "plain")] = n;
    for (let i = 0; i < n; i++) deck.push(keyOf(id, "plain"));
  }
  // starter has 16 cards + 8 grace = 24; a welcome booster is waiting
  return {
    version: 1,
    talents: BOOSTER_PRICE,
    packs: 1,
    collection,
    deck,
    energy: DECK_SIZE - deck.length,
    wins: 0,
    losses: 0,
    beaten: [],
  };
}

export const owned = (p: Profile, k: CardKey) => p.collection[k] ?? 0;
export const copiesInDeck = (p: Profile, cardId: string) =>
  p.deck.filter((k) => parseKey(k).cardId === cardId).length;
export const deckSize = (p: Profile) => p.deck.length + p.energy;

export function deckProblems(p: Profile): string[] {
  const out: string[] = [];
  if (deckSize(p) !== DECK_SIZE)
    out.push(`Talia musi mieć dokładnie ${DECK_SIZE} kart (teraz: ${deckSize(p)}).`);
  if (!p.deck.some((k) => isBasic(getCard(parseKey(k).cardId))))
    out.push("Talia potrzebuje co najmniej jednej postaci podstawowej.");
  if (p.energy < 4) out.push("Dodaj co najmniej 4 Łaski — bez nich postacie nie zaatakują.");
  return out;
}

export function canAddToDeck(p: Profile, k: CardKey): boolean {
  const { cardId } = parseKey(k);
  const inDeck = p.deck.filter((x) => x === k).length;
  return deckSize(p) < DECK_SIZE && inDeck < owned(p, k) && copiesInDeck(p, cardId) < MAX_COPIES;
}

export const addToDeck = (p: Profile, k: CardKey): Profile =>
  canAddToDeck(p, k) ? { ...p, deck: [...p.deck, k] } : p;
export function removeFromDeck(p: Profile, k: CardKey): Profile {
  const i = p.deck.indexOf(k);
  return i < 0 ? p : { ...p, deck: p.deck.filter((_, j) => j !== i) };
}
export const setEnergy = (p: Profile, n: number): Profile => ({
  ...p,
  energy: Math.max(0, Math.min(n, DECK_SIZE - p.deck.length)),
});

export function deckList(p: Profile): DeckList {
  return [
    ...p.deck.map(parseKey),
    ...Array.from({ length: p.energy }, () => ({
      cardId: ENERGY_ID.parish,
      finish: "plain" as Finish,
    })),
  ];
}

/* ── rewards & boosters ── */
export function reward(base: { win: number; loss: number }, won: boolean, souls: number) {
  return (won ? base.win : base.loss) + souls * 10;
}

export function finishDuel(p: Profile, opponentId: string, won: boolean, talents: number): Profile {
  return {
    ...p,
    talents: p.talents + talents,
    packs: p.packs + 1,
    wins: p.wins + (won ? 1 : 0),
    losses: p.losses + (won ? 0 : 1),
    beaten: won && !p.beaten.includes(opponentId) ? [...p.beaten, opponentId] : p.beaten,
  };
}

export const canOpenBooster = (p: Profile) => p.packs > 0 && p.talents >= BOOSTER_PRICE;

function pickRarity(r: number, slot: number): Rarity {
  if (slot < 3) return "common";
  if (slot === 3) return r < 0.85 ? "uncommon" : "rare";
  return r < 0.2 ? "legendary" : "rare";
}
function pickFinish(r: number): Finish {
  return r < 0.03 ? "stained" : r < 0.15 ? "gilded" : "plain";
}

/** 5 cards: 3 common, 1 uncommon (or rare), 1 rare (20% legendary). Rarest is revealed last. */
export function rollBooster(rnd: () => number = Math.random): CardKey[] {
  const out: CardKey[] = [];
  for (let slot = 0; slot < BOOSTER_SIZE; slot++) {
    const rarity = pickRarity(rnd(), slot);
    const pool = COLLECTIBLE.filter((c) => c.rarity === rarity);
    const card = pool[Math.floor(rnd() * pool.length)]!;
    out.push(keyOf(card.id, pickFinish(rnd())));
  }
  return out;
}

export function openBooster(p: Profile, cards: CardKey[]): Profile {
  if (!canOpenBooster(p)) return p;
  const collection = { ...p.collection };
  for (const k of cards) collection[k] = (collection[k] ?? 0) + 1;
  return { ...p, talents: p.talents - BOOSTER_PRICE, packs: p.packs - 1, collection };
}

/** Talents for copies above what a deck can use (more than 2 of the same print). */
export const SPARE_VALUE: Record<Rarity, number> = {
  common: 5,
  uncommon: 10,
  rare: 25,
  legendary: 60,
};

export function spares(p: Profile): { key: CardKey; extra: number }[] {
  return (Object.entries(p.collection) as [CardKey, number][])
    .map(([key, n]) => ({ key, extra: n - MAX_COPIES }))
    .filter((x) => x.extra > 0);
}

export function donateSpares(p: Profile): { profile: Profile; gained: number } {
  let gained = 0;
  const collection = { ...p.collection };
  for (const { key, extra } of spares(p)) {
    gained += extra * SPARE_VALUE[getCard(parseKey(key).cardId).rarity];
    collection[key] = MAX_COPIES;
  }
  return { profile: { ...p, collection, talents: p.talents + gained }, gained };
}
