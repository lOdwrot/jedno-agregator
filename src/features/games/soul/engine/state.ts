/** Game state of a single duel + small pure helpers shared by the engine modules. */
import { getCard, HAND_START, isBasic, isBlessed, isCharacter, SOULS_TO_WIN } from "../data/cards";
import type { CharacterDef, Finish, PlaceRule, Side, Status, SupportDef } from "../data/types";
import { FINISH_BONUS } from "../data/types";
import { emit } from "./events";

export type PlayerId = "me" | "ai";
export const other = (p: PlayerId): PlayerId => (p === "me" ? "ai" : "me");

export interface CardInst {
  uid: number;
  cardId: string;
  finish: Finish;
}

export interface InPlay extends CardInst {
  damage: number;
  energy: number;
  statuses: Status[];
  /** Paralysis ends after this turn number. */
  paralyzedUntil: number;
  playedTurn: number;
  /** Earlier stages (evolution stack). */
  under: CardInst[];
  /** Damage reduction until the owner's next turn. */
  shield: number;
  abilityTurn: number;
}

export interface PlayerState {
  side: Side;
  deck: CardInst[];
  hand: CardInst[];
  discard: CardInst[];
  prizes: CardInst[];
  active: InPlay | null;
  bench: InPlay[];
  souls: number;
}

export interface Game {
  players: Record<PlayerId, PlayerState>;
  turn: PlayerId;
  turnNo: number;
  /** "opening": hands are dealt, each player may redraw once, then the coin decides who goes first. */
  phase: "opening" | "setup" | "main" | "promote" | "over";
  /** Opening hand decisions (phase "opening"): who already kept the hand, who used the one redraw. */
  opening: { ready: Record<PlayerId, boolean>; redrawn: Record<PlayerId, boolean> } | null;
  /** After the pick: end the turn, start the next one, or go on with the current turn (mid-turn knock-out). */
  promote: { who: PlayerId; then: "endTurn" | "startNext" | "continue" } | null;
  flags: { energy: boolean; supporter: boolean; retreated: boolean };
  place: { cardId: string; owner: PlayerId } | null;
  /** Top deck card revealed by a peek card — its owner must keep or discard it before moving on. */
  peek: { pid: PlayerId; uid: number } | null;
  /** Ultra-ball-like card played — its owner must discard `discard` cards and pick a character from the deck. */
  search: { pid: PlayerId; discard: number } | null;
  /** Extra cards the computer draws each turn — a stated rule of the opponent (Tron Bestii), never hidden. */
  aiExtraDraw: number;
  winner: PlayerId | null;
  reason: string;
  log: string[];
  /** Last damage dealt — drives the "−40" pop-up. */
  hit: { uid: number; amount: number; seq: number } | null;
  first: PlayerId;
  rng: number;
  nextUid: number;
  seq: number;
  /** Two-player duel (both decks belong to people) — see `pvp/`. */
  pvp?: PvpInfo;
}

/** Extra state of a two-player duel. `log`/`reason` above are written for "me" (the host);
 *  the same lines as read by the other player live here, so the guest can flip the game. */
export interface PvpInfo {
  names: Record<PlayerId, string>;
  log: string[];
  reason: string;
}

export type DeckList = { cardId: string; finish: Finish }[];

/* ── randomness (mulberry32 on the game state, so the engine stays deterministic) ── */
export function rand(g: Game): number {
  g.rng = (g.rng + 0x6d2b79f5) >>> 0;
  let t = g.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const coin = (g: Game) => rand(g) < 0.5;
export function shuffle<T>(g: Game, a: T[]): void {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand(g) * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
}

/* ── lookups ── */
export const charDef = (c: CardInst) => getCard(c.cardId) as CharacterDef;
export const supportDef = (c: CardInst) => getCard(c.cardId) as SupportDef;
export const inPlay = (p: PlayerState): InPlay[] =>
  p.active ? [p.active, ...p.bench] : [...p.bench];

/** Whether the place in play (whoever owns it) enforces this rule on both players. */
export function placeRule(g: Game, rule: PlaceRule): boolean {
  if (!g.place) return false;
  const e = (getCard(g.place.cardId) as SupportDef).effect;
  return e.k === "place" && e.rule === rule;
}

/** Owner of a character in play (null for a character that is not on the table). */
export const ownerOf = (g: Game, c: InPlay): PlayerId | null =>
  (["me", "ai"] as const).find((pid) => inPlay(g.players[pid]).some((x) => x.uid === c.uid)) ??
  null;

/** `blessedHp` ability: +n max HP for every other blessed character on the owner's side. */
function blessedBonus(g: Game, c: InPlay): number {
  const e = charDef(c).ability?.effect;
  if (e?.k !== "blessedHp" || placeRule(g, "noAbilities")) return 0;
  const owner = ownerOf(g, c);
  if (!owner) return 0;
  const others = inPlay(g.players[owner]).filter((x) => x.uid !== c.uid && isBlessed(charDef(x)));
  return e.n * others.length;
}

export const maxHp = (g: Game, c: InPlay) =>
  charDef(c).hp + FINISH_BONUS[c.finish].hp + blessedBonus(g, c);
export const hpLeft = (g: Game, c: InPlay) => Math.max(0, maxHp(g, c) - c.damage);
export const findInPlay = (p: PlayerState, uid: number) => inPlay(p).find((c) => c.uid === uid);
export const nameOf = (c: CardInst) => getCard(c.cardId).name;

const push = (l: string[], msg: string) => {
  l.push(msg);
  if (l.length > 40) l.splice(0, l.length - 40);
};

/** Adds a log line; `forAi` is how the other player reads it in a two-player duel. */
export function log(g: Game, msg: string, forAi = msg) {
  push(g.log, msg);
  if (g.pvp) push(g.pvp.log, forAi);
}

/** Name of a player in a two-player duel. */
export const nameOfPlayer = (g: Game, pid: PlayerId) => g.pvp?.names[pid] ?? "Rywal";

/**
 * A line about a move of `pid`: `mine` is what `pid` reads, `solo` what the human reads about the
 * computer, `rival(name)` what the other person reads in a two-player duel.
 */
export function say(
  g: Game,
  pid: PlayerId,
  mine: string,
  solo: string,
  rival: (name: string) => string,
) {
  const theirs = g.pvp ? rival(nameOfPlayer(g, pid)) : solo;
  log(g, pid === "me" ? mine : theirs, pid === "ai" ? mine : theirs);
}

export function draw(g: Game, pid: PlayerId, n: number): number {
  const p = g.players[pid];
  let k = 0;
  while (k < n && p.deck.length) {
    p.hand.push(p.deck.shift()!);
    k++;
  }
  if (k) emit(g, { t: "draw", pid, n: k });
  return k;
}

export function toInPlay(c: CardInst, turnNo: number): InPlay {
  return {
    ...c,
    damage: 0,
    energy: 0,
    statuses: [],
    paralyzedUntil: 0,
    playedTurn: turnNo,
    under: [],
    shield: 0,
    abilityTurn: -1,
  };
}

function makePlayer(g: Game, side: Side, list: DeckList): PlayerState {
  const deck = list.map((c) => ({ ...c, uid: g.nextUid++ }));
  const p: PlayerState = {
    side,
    deck,
    hand: [],
    discard: [],
    prizes: [],
    active: null,
    bench: [],
    souls: 0,
  };
  dealHand(g, p);
  p.prizes = p.deck.splice(0, SOULS_TO_WIN);
  return p;
}

const basicCard = (c: CardInst) => isBasic(getCard(c.cardId));

/**
 * Shuffles the hand back and deals a new one — always with a basic character for the active spot:
 * reshuffles until one shows up and, as a last resort, swaps one in from the deck or the prizes.
 */
export function dealHand(g: Game, p: PlayerState) {
  for (let tries = 0; tries < 50; tries++) {
    p.deck.push(...p.hand.splice(0));
    shuffle(g, p.deck);
    p.hand = p.deck.splice(0, HAND_START);
    if (p.hand.some(basicCard)) return;
  }
  for (const pile of [p.deck, p.prizes]) {
    const i = pile.findIndex(basicCard);
    if (i < 0 || !p.hand.length) continue;
    [pile[i], p.hand[0]] = [p.hand[0]!, pile[i]!];
    return;
  }
}

/** Best basic in hand by HP (used for AI setup and auto-promotion). */
export function bestBasic(hand: CardInst[]): CardInst | undefined {
  return hand
    .filter((c) => isBasic(getCard(c.cardId)))
    .sort((a, b) => charDef(b).hp - charDef(a).hp)[0];
}

/** Abilities that help the whole team from the bench — worth benching before the big hitters. */
const SUPPORT_ABILITIES = new Set([
  "noWeakness",
  "energyOnce",
  "handEnergyOnce",
  "attackBonus",
  "costMinus",
]);
export const benchValue = (c: CardInst) => {
  const d = charDef(c);
  return d.hp + (d.ability && SUPPORT_ABILITIES.has(d.ability.effect.k) ? 200 : 0);
};

/** Basic to put on the bench: team supporters first, then a base form whose evolution is in hand, then the toughest. */
export function bestBenchBasic(hand: CardInst[]): CardInst | undefined {
  const evolvable = new Set(
    hand
      .map((c) => getCard(c.cardId))
      .flatMap((d) => (isCharacter(d) && d.evolvesFrom ? [d.evolvesFrom] : [])),
  );
  const value = (c: CardInst) => benchValue(c) + (evolvable.has(c.cardId) ? 250 : 0);
  return hand.filter((c) => isBasic(getCard(c.cardId))).sort((a, b) => value(b) - value(a))[0];
}

export function createGame(
  me: DeckList,
  ai: DeckList,
  seed: number,
  aiExtraDraw = 0,
  pvp?: { names: Record<PlayerId, string> },
): Game {
  const g: Game = {
    players: {} as Game["players"],
    turn: "me",
    turnNo: 0,
    phase: "opening",
    opening: { ready: { me: false, ai: !pvp }, redrawn: { me: false, ai: false } },
    promote: null,
    flags: { energy: false, supporter: false, retreated: false },
    place: null,
    peek: null,
    search: null,
    aiExtraDraw,
    winner: null,
    reason: "",
    log: [],
    hit: null,
    first: "me",
    rng: seed >>> 0,
    nextUid: 1,
    seq: 0,
  };
  if (pvp) g.pvp = { names: { ...pvp.names }, log: [], reason: "" };
  g.players.me = makePlayer(g, "parish", me);
  g.players.ai = makePlayer(g, pvp ? "parish" : "demons", ai);
  log(
    g,
    "Twoja ręka startowa. Możesz raz przetasować talię i dobrać nowe karty — potem rzut monetą.",
  );
  return g;
}

/** A card choice (peek / search) is waiting for an answer — every other move is blocked. */
export const choicePending = (g: Game) => !!g.peek || !!g.search;

export const isCharCard = (c: CardInst) => isCharacter(getCard(c.cardId));
