/**
 * The engine always calls the host "me" and the guest "ai". The guest's screen shows the same game
 * flipped: players swapped, and the log / end reason as written for the guest.
 */
import type { Frame, GameEvent } from "../engine/events";
import { other, type Game, type PlayerId } from "../engine/state";

const swap = <T>(r: Record<PlayerId, T>): Record<PlayerId, T> => ({ me: r.ai, ai: r.me });

export function flipGame(g: Game): Game {
  const pvp = g.pvp;
  return {
    ...g,
    players: swap(g.players),
    turn: other(g.turn),
    first: other(g.first),
    winner: g.winner && other(g.winner),
    opening: g.opening && {
      ready: swap(g.opening.ready),
      redrawn: swap(g.opening.redrawn),
    },
    promote: g.promote && { ...g.promote, who: other(g.promote.who) },
    place: g.place && { ...g.place, owner: other(g.place.owner) },
    peek: g.peek && { ...g.peek, pid: other(g.peek.pid) },
    search: g.search && { ...g.search, pid: other(g.search.pid) },
    log: pvp ? pvp.log : g.log,
    reason: pvp ? pvp.reason : g.reason,
    pvp: pvp && { names: swap(pvp.names), log: g.log, reason: g.reason },
  };
}

export function flipEvent(ev: GameEvent): GameEvent {
  if (ev.t === "over") return { ...ev, winner: other(ev.winner) };
  if ("pid" in ev) return { ...ev, pid: other(ev.pid) };
  return ev;
}

export const flipFrame = (f: Frame): Frame => ({ ev: flipEvent(f.ev), state: flipGame(f.state) });

/** The game as seen by `pov`. */
export const viewAs = (g: Game, pov: PlayerId) => (pov === "me" ? g : flipGame(g));
export const frameAs = (f: Frame, pov: PlayerId) => (pov === "me" ? f : flipFrame(f));
