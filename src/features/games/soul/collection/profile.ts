/** Player's collection, deck, currency ("talenty") and boosters — pure functions + storage. */
import {
  DECK_SIZE,
  ENERGY_ID,
  getCard,
  isBasic,
  isCharacter,
  MAX_COPIES,
  MIN_BASICS,
} from "../data/cards";
import type { Finish, Rarity } from "../data/types";
import type { DeckList } from "../engine/state";
import type { PrizeChance } from "../data/opponents";
import { findPack, PACKS, rollPack, type PackType } from "./packs";

/** Collection key: "cardId:finish". */
export type CardKey = `${string}:${Finish}`;
export const keyOf = (cardId: string, finish: Finish): CardKey => `${cardId}:${finish}`;
export function parseKey(k: CardKey): { cardId: string; finish: Finish } {
  const [cardId, finish] = k.split(":") as [string, Finish];
  return { cardId, finish };
}

export interface Profile {
  version: 4;
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
  /** Rank points (see `rank/xp.ts`); missing in older saves = 0. */
  xp?: number;
  /** Bestiary: how many times each demon card was seen in duels (see `bestiary.ts`). */
  bestiary?: Partial<Record<string, number>>;
}

export const BOOSTER_PRICE = 100;
export const BOOSTER_SIZE = 5;

/** Base deck: 21 characters (2 papal candidates), 15 supports (with a small draw engine) and 14 grace = 50. */
const STARTER: [string, number][] = [
  ["ministrant", 3],
  ["lektor", 3],
  ["kleryk", 3],
  ["wikariusz", 1],
  ["scholanka", 2],
  ["babcia", 3],
  ["oazowicz", 2],
  ["kandydat", 2],
  ["kancelaria", 2],
  ["rozaniec", 2],
  ["ogloszenia", 2],
  ["ksiega", 1],
  ["woda", 2],
  ["koscielny", 1],
  ["zbiorka", 2],
  ["zapisy", 1],
  ["paschal", 1],
  ["profesor", 1],
  ["rzecznik", 1],
];

export function newProfile(): Profile {
  const collection: Profile["collection"] = {};
  const deck: CardKey[] = [];
  for (const [id, n] of STARTER) {
    collection[keyOf(id, "plain")] = n;
    for (let i = 0; i < n; i++) deck.push(keyOf(id, "plain"));
  }
  // a welcome booster is waiting
  return {
    version: 4,
    talents: BOOSTER_PRICE,
    packs: 1,
    collection,
    deck,
    energy: DECK_SIZE - deck.length,
    wins: 0,
    losses: 0,
    beaten: [],
    xp: 0,
  };
}

/** Cards every player gets when the deck grows from 40 to 50 (version 2 → 3). */
const V3_GIFT: [string, number][] = [
  ["ogloszenia", 2],
  ["ksiega", 1],
];

type SavedProfile = Omit<Profile, "version"> & { version: number };

/**
 * Older saves: version 1 (24 cards) gets the whole base set, version 2 (40 cards) the new
 * Ogłoszenia parafialne. New cards go into the deck and grace fills it up to DECK_SIZE.
 * Version 3 → 4: every pope evolves from "Kandydat na papieża" (see `giveCandidates`).
 */
export function migrateProfile(old: SavedProfile): Profile {
  if (old.version === 4) return old as Profile;
  return giveCandidates(old.version === 3 ? old : toV3(old));
}

function toV3(old: SavedProfile): SavedProfile {
  const collection = { ...old.collection };
  const deck = [...old.deck];
  const gift = old.version === 1 ? STARTER : V3_GIFT;
  for (const [id, n] of gift) {
    const k = keyOf(id, "plain");
    const have = Object.entries(collection)
      .filter(([key]) => parseKey(key as CardKey).cardId === id)
      .reduce((s, [, c]) => s + (c ?? 0), 0);
    if (have < n) collection[k] = (collection[k] ?? 0) + n - have;
    const inDeck = deck.filter((x) => parseKey(x).cardId === id).length;
    for (let i = inDeck; i < n && deck.length < DECK_SIZE - 10; i++) deck.push(k);
  }
  return { ...old, version: 3, collection, deck, energy: DECK_SIZE - deck.length };
}

export const CANDIDATE_ID = "kandydat";
const CANDIDATE_GIFT = 2;
const MIN_ENERGY = 4;

/**
 * Popes became evolutions of "Kandydat na papieża": everyone gets 2 candidates, and a deck that
 * already holds popes gets them in place of grace (so the popes can still be played).
 */
function giveCandidates(old: SavedProfile): Profile {
  const k = keyOf(CANDIDATE_ID, "plain");
  const collection = { ...old.collection };
  const have = Object.entries(collection)
    .filter(([key]) => parseKey(key as CardKey).cardId === CANDIDATE_ID)
    .reduce((s, [, c]) => s + (c ?? 0), 0);
  if (have < CANDIDATE_GIFT) collection[k] = (collection[k] ?? 0) + CANDIDATE_GIFT - have;
  const deck = [...old.deck];
  let energy = old.energy;
  const hasPopes = deck.some((x) => {
    const c = getCard(parseKey(x).cardId);
    return isCharacter(c) && c.evolvesFrom === CANDIDATE_ID;
  });
  if (hasPopes) {
    const inDeck = deck.filter((x) => parseKey(x).cardId === CANDIDATE_ID).length;
    for (let i = inDeck; i < CANDIDATE_GIFT && energy > MIN_ENERGY; i++) {
      deck.push(k);
      energy--;
    }
  }
  return { ...old, version: 4, collection, deck, energy };
}

export const owned = (p: Profile, k: CardKey) => p.collection[k] ?? 0;
export const copiesInDeck = (p: Profile, cardId: string) =>
  p.deck.filter((k) => parseKey(k).cardId === cardId).length;
export const deckSize = (p: Profile) => p.deck.length + p.energy;

export function deckProblems(p: Profile): string[] {
  const out: string[] = [];
  if (deckSize(p) !== DECK_SIZE)
    out.push(`Talia musi mieć dokładnie ${DECK_SIZE} kart (teraz: ${deckSize(p)}).`);
  const basics = p.deck.filter((k) => isBasic(getCard(parseKey(k).cardId))).length;
  if (basics < MIN_BASICS)
    out.push(`Talia potrzebuje co najmniej ${MIN_BASICS} postaci podstawowych (teraz: ${basics}).`);
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

/* ── challenge fee & victory booster ── */
export const canChallenge = (p: Profile, fee = 0) => p.talents >= fee;

/** Pays the fee for challenging a harder opponent (unchanged when the player can't afford it). */
export const payFee = (p: Profile, fee = 0): Profile =>
  fee > 0 && canChallenge(p, fee) ? { ...p, talents: p.talents - fee } : p;

/** Draws the edition of the victory booster from the opponent's prize table. */
export function rollPrize(
  table: readonly PrizeChance[],
  rnd: () => number = Math.random,
): PackType {
  let r = rnd();
  for (const { pack, chance } of table) {
    if (r < chance) return findPack(pack);
    r -= chance;
  }
  return findPack(table.at(-1)!.pack);
}

/** Which cards of a freshly rolled booster are new to the collection (first copy only). */
export function freshFlags(p: Profile, cards: CardKey[]): boolean[] {
  const seen = new Set<CardKey>();
  return cards.map((k) => {
    const isNew = owned(p, k) === 0 && !seen.has(k);
    seen.add(k);
    return isNew;
  });
}

/** A free booster (victory prize): the cards go straight into the collection. */
export function grantBooster(p: Profile, cards: CardKey[]): Profile {
  const collection = { ...p.collection };
  for (const k of cards) collection[k] = (collection[k] ?? 0) + 1;
  return { ...p, collection };
}

export const canOpenBooster = (p: Profile, price = BOOSTER_PRICE) =>
  p.packs > 0 && p.talents >= price;

/** Classic "Wspólnota" pack (see `packs.ts` for all editions). */
export function rollBooster(rnd: () => number = Math.random): CardKey[] {
  return rollPack(PACKS[0]!, rnd);
}

export function openBooster(p: Profile, cards: CardKey[], price = BOOSTER_PRICE): Profile {
  if (!canOpenBooster(p, price)) return p;
  return { ...grantBooster(p, cards), talents: p.talents - price, packs: p.packs - 1 };
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
