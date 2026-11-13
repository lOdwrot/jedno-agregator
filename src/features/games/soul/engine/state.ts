/** Game state of a single duel + small pure helpers shared by the engine modules. */
import { BENCH_SIZE, getCard, HAND_START, isBasic, isCharacter, SOULS_TO_WIN } from "../data/cards";
import type { CharacterDef, Finish, Side, Status, SupportDef } from "../data/types";
import { FINISH_BONUS } from "../data/types";

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
  phase: "setup" | "main" | "promote" | "over";
  promote: { who: PlayerId; then: "endTurn" | "startNext" } | null;
  flags: { energy: boolean; supporter: boolean; retreated: boolean };
  place: { cardId: string; owner: PlayerId } | null;
  winner: PlayerId | null;
  reason: string;
  log: string[];
  /** Last damage dealt — drives the "−40" pop-up. */
  hit: { uid: number; amount: number; seq: number } | null;
  first: PlayerId;
  rng: number;
  nextUid: number;
  seq: number;
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
export const maxHp = (c: InPlay) => charDef(c).hp + FINISH_BONUS[c.finish].hp;
export const hpLeft = (c: InPlay) => Math.max(0, maxHp(c) - c.damage);
export const inPlay = (p: PlayerState): InPlay[] =>
  p.active ? [p.active, ...p.bench] : [...p.bench];
export const findInPlay = (p: PlayerState, uid: number) => inPlay(p).find((c) => c.uid === uid);
export const nameOf = (c: CardInst) => getCard(c.cardId).name;

export function log(g: Game, msg: string) {
  g.log.push(msg);
  if (g.log.length > 40) g.log.splice(0, g.log.length - 40);
}

export function draw(g: Game, pid: PlayerId, n: number): number {
  const p = g.players[pid];
  let k = 0;
  while (k < n && p.deck.length) {
    p.hand.push(p.deck.shift()!);
    k++;
  }
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
  // mulligan: reshuffle until the opening hand has a basic character
  for (let tries = 0; tries < 50; tries++) {
    p.deck.push(...p.hand.splice(0));
    shuffle(g, p.deck);
    p.hand = p.deck.splice(0, HAND_START);
    if (p.hand.some((c) => isBasic(getCard(c.cardId)))) break;
  }
  p.prizes = p.deck.splice(0, SOULS_TO_WIN);
  return p;
}

/** Best basic in hand by HP (used for AI setup and auto-promotion). */
export function bestBasic(hand: CardInst[]): CardInst | undefined {
  return hand
    .filter((c) => isBasic(getCard(c.cardId)))
    .sort((a, b) => charDef(b).hp - charDef(a).hp)[0];
}

export function createGame(me: DeckList, ai: DeckList, seed: number): Game {
  const g: Game = {
    players: {} as Game["players"],
    turn: "me",
    turnNo: 0,
    phase: "setup",
    promote: null,
    flags: { energy: false, supporter: false, retreated: false },
    place: null,
    winner: null,
    reason: "",
    log: [],
    hit: null,
    first: "me",
    rng: seed >>> 0,
    nextUid: 1,
    seq: 0,
  };
  g.players.me = makePlayer(g, "parish", me);
  g.players.ai = makePlayer(g, "demons", ai);
  // the computer sets up right away: strongest basic active, up to two more on the pew (bench)
  const p = g.players.ai;
  const act = bestBasic(p.hand)!;
  p.hand = p.hand.filter((c) => c !== act);
  p.active = toInPlay(act, 0);
  for (let i = 0; i < 2 && p.bench.length < BENCH_SIZE; i++) {
    const b = bestBasic(p.hand);
    if (!b) break;
    p.hand = p.hand.filter((c) => c !== b);
    p.bench.push(toInPlay(b, 0));
  }
  g.first = coin(g) ? "me" : "ai";
  log(g, g.first === "me" ? "Rzut monetą: zaczynasz Ty!" : "Rzut monetą: zaczynają pomioty.");
  log(g, "Wybierz postać, która stanie do walki jako pierwsza.");
  return g;
}

export const isCharCard = (c: CardInst) => isCharacter(getCard(c.cardId));
