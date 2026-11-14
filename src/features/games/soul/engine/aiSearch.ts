/** Computer choices for ultra-ball cards (Ogłoszenia parafialne / Algorytm). */
import { BENCH_SIZE, getCard, isBasic, isCharacter } from "../data/cards";
import type { CardDef } from "../data/types";
import type { Action } from "./actions";
import { inPlay, type CardInst, type Game, type PlayerId } from "./state";

const def = (c: CardInst): CardDef => getCard(c.cardId);
const hp = (c: CardInst) => {
  const d = def(c);
  return d.kind === "character" ? d.hp : 0;
};

/** The character worth fetching most: an evolution for something in play, else a basic, else the biggest. */
export function searchPick(
  g: Game,
  pid: PlayerId,
  from: CardInst[] = g.players[pid].deck,
): CardInst | undefined {
  const me = g.players[pid];
  const chars = from.filter((c) => isCharacter(def(c)));
  const field = new Set(inPlay(me).map((c) => c.cardId));
  const inHand = new Set(me.hand.map((c) => c.cardId));
  const evo = chars
    .filter((c) => {
      const d = def(c);
      return (
        d.kind === "character" && !!d.evolvesFrom && field.has(d.evolvesFrom) && !inHand.has(d.id)
      );
    })
    .sort((a, b) => hp(b) - hp(a))[0];
  if (evo) return evo;
  const roomOnBench = me.bench.length < BENCH_SIZE && !me.hand.some((c) => isBasic(def(c)));
  const basic = chars.filter((c) => isBasic(def(c))).sort((a, b) => hp(b) - hp(a))[0];
  if (roomOnBench && basic) return basic;
  return undefined;
}

/** Character worth recovering from the discard pile (falls back to the biggest one). */
export const recoverPick = (g: Game, pid: PlayerId): CardInst | undefined =>
  searchPick(g, pid, g.players[pid].discard) ??
  g.players[pid].discard.filter((c) => isCharacter(def(c))).sort((a, b) => hp(b) - hp(a))[0];

/** Lowest-value hand cards (never the search card itself, keep one energy if possible). */
export function searchDiscards(g: Game, pid: PlayerId, n: number, except = -1): number[] {
  const me = g.players[pid];
  const field = new Set(inPlay(me).map((c) => c.cardId));
  let energyKept = false;
  const value = (c: CardInst): number => {
    const d = def(c);
    if (d.kind === "energy") {
      if (!energyKept) {
        energyKept = true;
        return 50;
      }
      return 5;
    }
    if (d.kind === "character")
      return d.evolvesFrom
        ? field.has(d.evolvesFrom)
          ? 60
          : 15
        : me.bench.length < BENCH_SIZE
          ? 40
          : 10;
    if (d.kind === "place") return g.place?.cardId === d.id ? 0 : 20;
    return d.kind === "supporter" ? 30 : 25;
  };
  return me.hand
    .filter((c) => c.uid !== except)
    .map((c) => ({ uid: c.uid, v: value(c) }))
    .sort((a, b) => a.v - b.v)
    .slice(0, n)
    .map((x) => x.uid);
}

/** Answer to a pending search: discard the cheapest cards, take the best character. */
export function aiSearch(g: Game, pid: PlayerId): Action | null {
  const s = g.search;
  if (!s || s.pid !== pid) return null;
  const me = g.players[pid];
  const pick =
    searchPick(g, pid) ??
    me.deck.filter((c) => isCharacter(def(c))).sort((a, b) => hp(b) - hp(a))[0];
  if (!pick) return null;
  return { type: "search", discard: searchDiscards(g, pid, s.discard), pick: pick.uid };
}
