/** A connected two-player game, handed from the lobby to the duel screen. */
import { createGame, type DeckList, type Game, type PlayerId } from "../engine/state";
import type { Link } from "./link";
import type { Role } from "./sync";

export interface Session {
  role: Role;
  link: Link;
  /** First game, in the host's perspective (the guest flips it for the screen). */
  game: Game;
  /** Host only — to deal a rematch. */
  decks?: Record<PlayerId, DeckList>;
  names: Record<PlayerId, string>;
}

export const newPvpGame = (decks: Record<PlayerId, DeckList>, names: Record<PlayerId, string>) =>
  createGame(decks.me, decks.ai, Math.floor(Math.random() * 1e9), undefined, { names });

const NAME_KEY = "jedno-walka-o-dusze:name";
export function loadName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}
export function saveName(n: string) {
  try {
    localStorage.setItem(NAME_KEY, n);
  } catch {
    /* private mode */
  }
}
