/** Messages exchanged by the two browsers of a two-player duel (WebRTC data channel, JSON). */
import { DECK_SIZE, ENERGY_ID, isBasic, MAX_COPIES } from "../data/cards";
import { PARISH_CARDS } from "../data/parish";
import { FINISH_BONUS } from "../data/types";
import type { Action } from "../engine/actions";
import type { DeckList, Game } from "../engine/state";

/** Bump when the engine or the messages change — older clients are turned away politely. */
export const PROTOCOL = 4;

export type Msg =
  /** guest → host, right after connecting */
  | { t: "hello"; v: number; name: string; deck: DeckList }
  /** host → guest: a new game (also a rematch), in the host's ("me") perspective */
  | { t: "start"; game: Game }
  /** guest → host: a move the guest wants to make */
  | { t: "act"; a: Action }
  /** host → guest: the n-th move of the game (either player's) + checksum of the state after it */
  | { t: "apply"; n: number; a: Action; h: number }
  /** guest → host: states differ, send the whole game */
  | { t: "resync" }
  | { t: "state"; n: number; game: Game }
  /** guest → host: wants another game */
  | { t: "rematch" }
  /** host → guest: refused (old version, invalid deck…) */
  | { t: "refuse"; reason: string }
  /** the other player left */
  | { t: "bye" };

const TYPES = new Set<Msg["t"]>([
  "hello",
  "start",
  "act",
  "apply",
  "resync",
  "state",
  "rematch",
  "refuse",
  "bye",
]);

/** Shallow check of anything that arrives over the wire (the deck is checked by `validDeck`). */
export function asMsg(x: unknown): Msg | null {
  if (!x || typeof x !== "object") return null;
  const m = x as { t?: unknown; a?: unknown };
  if (typeof m.t !== "string" || !TYPES.has(m.t as Msg["t"])) return null;
  if ((m.t === "act" || m.t === "apply") && (!m.a || typeof m.a !== "object")) return null;
  return x as Msg;
}

const PARISH = new Map(PARISH_CARDS.map((c) => [c.id, c]));

/** A deck sent by the guest — same rules as the deck builder (50 cards, ≤3 copies, a basic). */
export function validDeck(deck: unknown): deck is DeckList {
  if (!Array.isArray(deck) || deck.length !== DECK_SIZE) return false;
  const copies = new Map<string, number>();
  let basic = false;
  for (const c of deck as unknown[]) {
    if (!c || typeof c !== "object") return false;
    const { cardId, finish } = c as { cardId?: unknown; finish?: unknown };
    if (typeof cardId !== "string" || typeof finish !== "string") return false;
    const def = PARISH.get(cardId);
    if (!def || !(finish in FINISH_BONUS)) return false;
    if (isBasic(def)) basic = true;
    if (cardId === ENERGY_ID.parish) continue;
    const n = (copies.get(cardId) ?? 0) + 1;
    if (n > MAX_COPIES) return false;
    copies.set(cardId, n);
  }
  return basic;
}

export const cleanName = (s: unknown, fallback: string) =>
  (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, 20) : "") || fallback;

/** FNV-1a of the serialized game — both browsers must arrive at the same state after each move. */
export function hashGame(g: Game): number {
  const s = JSON.stringify(g);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
