/**
 * The start of a duel: both hands are dealt (always with a basic character), each player may
 * shuffle the hand back and draw a new one once, then a coin decides who goes first — and who
 * sets up first. Solo: the computer keeps its hand and sets up when its turn to set up comes.
 */
import { BENCH_SIZE } from "../data/cards";
import { emit } from "./events";
import {
  bestBasic,
  bestBenchBasic,
  coin,
  dealHand,
  draw,
  log,
  say,
  toInPlay,
  type Game,
  type PlayerId,
} from "./state";

/** The one redraw of the opening hand. */
export function redraw(g: Game, pid: PlayerId): boolean {
  const o = g.opening;
  if (g.phase !== "opening" || !o || o.ready[pid] || o.redrawn[pid]) return false;
  o.redrawn[pid] = true;
  const p = g.players[pid];
  // the hand flies back into the deck, then a fresh one is dealt from the top
  p.deck.push(...p.hand.splice(0));
  emit(g, { t: "shuffle", pid });
  dealHand(g, p);
  const k = p.hand.length;
  p.deck.unshift(...p.hand.splice(0));
  draw(g, pid, k);
  say(
    g,
    pid,
    "Przetasowujesz talię i dobierasz nową rękę.",
    "",
    (n) => `${n} przetasowuje talię i dobiera nową rękę.`,
  );
  return true;
}

/** Keeps the hand; once both players are ready the coin is thrown. */
export function ready(g: Game, pid: PlayerId): boolean {
  const o = g.opening;
  if (g.phase !== "opening" || !o || o.ready[pid]) return false;
  o.ready[pid] = true;
  if (!o.ready.me || !o.ready.ai) return true;
  const heads = coin(g);
  g.first = heads ? "me" : "ai";
  g.opening = null;
  g.phase = "setup";
  say(
    g,
    g.first,
    `Rzut monetą: ${heads ? "orzeł" : "reszka"} — idziesz pierwszy!`,
    "Rzut monetą: reszka — pomioty idą pierwsze, Ty idziesz drugi.",
    (n) => `Rzut monetą: ${heads ? "orzeł" : "reszka"} — pierwszy idzie ${n}, Ty idziesz drugi.`,
  );
  emit(g, { t: "opening", pid: g.first, heads });
  if (!g.pvp && g.first === "ai") aiSetup(g);
  log(g, "Wybierz postać, która stanie do walki jako pierwsza.");
  return true;
}

/** Who picks the first character now (the winner of the coin toss sets up first). */
export function setupTurn(g: Game): PlayerId | null {
  if (g.phase !== "setup") return null;
  const { me, ai } = g.players;
  if (!g.pvp) return me.active ? null : "me";
  const first = g.players[g.first];
  if (!first.active) return g.first;
  return (g.first === "me" ? ai : me).active ? null : g.first === "me" ? "ai" : "me";
}

/** The computer sets up: strongest basic active, up to two more on the pew (bench). */
export function aiSetup(g: Game) {
  const p = g.players.ai;
  const act = bestBasic(p.hand);
  if (!act || p.active) return;
  p.hand = p.hand.filter((c) => c !== act);
  p.active = toInPlay(act, 0);
  emit(g, { t: "toActive", pid: "ai", uid: act.uid });
  for (let i = 0; i < 2 && p.bench.length < BENCH_SIZE; i++) {
    const b = bestBenchBasic(p.hand);
    if (!b) break;
    p.hand = p.hand.filter((c) => c !== b);
    p.bench.push(toInPlay(b, 0));
    emit(g, { t: "bench", pid: "ai", uid: b.uid });
  }
}
