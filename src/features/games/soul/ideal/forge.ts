/**
 * "Idealny oponent": a demon deck put together against the player's current deck.
 *
 * 1. scout   — the decks of the hardest opponents and a few random strong archetypes play
 *              short AI-vs-AI series against the player's deck;
 * 2. climb   — the best one is mutated card by card (hill climbing, common random seeds so two
 *              decks are compared on the same shuffles); a change stays only if it wins at least
 *              as often; the seed set rotates so the deck doesn't fit a few lucky shuffles;
 * 3. verify  — the result and the best starting deck play a fresh series, the better one fights.
 *
 * A generator: the caller runs it in small slices (Web Worker or main thread) and shows the
 * progress. Deterministic for a given seed and budget — no clock inside.
 */
import { getCard, isCharacter, MAX_COPIES, SOULS_TO_WIN } from "../data/cards";
import { dispatch } from "../engine/actions";
import { aiAction } from "../engine/ai";
import { createGame, type DeckList, type Game } from "../engine/state";
import { lineOf, repair, seedDecks, toDeckList, weightedCard, type Genome } from "./pool";

/** mulberry32 — own copy, so the worker doesn't pull React in through `useGameLoop`. */
export function forgeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type ForgePhase = "scout" | "climb" | "verify" | "done";

export interface ForgeProgress {
  phase: ForgePhase;
  /** Simulated duels so far. */
  games: number;
  /** 0..1 of the whole search. */
  fraction: number;
  /** Demons' win rate of the best deck found so far (on its last series). */
  best: number;
  /** Cards the last tried change brought in (for the animation). */
  spotlight: string[];
  /** Changes kept / tried. */
  kept: number;
  tried: number;
}

export interface ForgeResult {
  deck: Genome;
  /** Demons' win rate on the final, fresh series. */
  winRate: number;
  games: number;
}

export interface ForgeBudget {
  scoutGames: number;
  climbSteps: number;
  climbGames: number;
  verifyGames: number;
  /** Checked between climb steps: true = time is up, go straight to the verification. */
  stop?: () => boolean;
}

export const DEFAULT_BUDGET: ForgeBudget = {
  scoutGames: 16,
  climbSteps: 50,
  climbGames: 30,
  verifyGames: 80,
};

const MAX_STEPS = 3000;
/** Weight of the soul margin in a duel's score (a win is always worth more). */
const MARGIN = 0.2;
const TOP_SCORE = 1 + MARGIN;

/**
 * One AI-vs-AI duel, the player's deck as "me", the demons as "ai". Score for the demons:
 * 1 for a win plus a small margin bonus (souls taken minus souls lost), so two decks that both
 * win everything can still be told apart — a crushing deck beats a lucky one.
 */
export function simulate(
  player: DeckList,
  demons: DeckList,
  seed: number,
): { won: boolean; score: number } {
  let g: Game = createGame(player, demons, seed);
  g = dispatch(g, { type: "ready", pid: "me" });
  if (g.phase === "opening") g = dispatch(g, { type: "ready", pid: "ai" });
  for (let i = 0; i < MAX_STEPS && g.phase !== "over"; i++) {
    const who = g.phase === "promote" ? g.promote!.who : g.phase === "setup" ? "me" : g.turn;
    const a = aiAction(g, who);
    const next = a ? dispatch(g, a) : g;
    g = next === g ? dispatch(g, { type: "endTurn" }) : next;
  }
  const margin = (g.players.ai.souls - g.players.me.souls) / SOULS_TO_WIN;
  const won = g.winner === "ai";
  return { won, score: (won ? 1 : 0) + MARGIN * margin };
}

/** A small random change: a card out, a card in, a whole line in, more or less energy. */
export function mutate(g: Genome, rnd: () => number): { next: Genome; brought: string[] } {
  const next = { ...g };
  const brought: string[] = [];
  const ops = 1 + Math.floor(rnd() * 3);
  for (let i = 0; i < ops; i++) {
    const r = rnd();
    const ids = Object.keys(next);
    if (r < 0.35 && ids.length) {
      const id = ids[Math.floor(rnd() * ids.length)]!;
      if (--next[id]! <= 0) delete next[id];
    } else if (r < 0.75) {
      const c = weightedCard(rnd);
      if ((next[c.id] ?? 0) < MAX_COPIES) {
        next[c.id] = (next[c.id] ?? 0) + 1;
        brought.push(c.id);
      }
    } else if (r < 0.9) {
      const c = weightedCard(rnd);
      if (isCharacter(c) && c.evolvesFrom) {
        for (const id of [c.id, ...lineOf(c.id)])
          next[id] = Math.min(MAX_COPIES, (next[id] ?? 0) + 1);
        brought.push(c.id);
      }
    } else {
      // swap a copy for a copy (keeps the energy count)
      if (ids.length) {
        const out = ids[Math.floor(rnd() * ids.length)]!;
        const c = weightedCard(rnd);
        if (c.id !== out && (next[c.id] ?? 0) < MAX_COPIES) {
          if (--next[out]! <= 0) delete next[out];
          next[c.id] = (next[c.id] ?? 0) + 1;
          brought.push(c.id);
        }
      }
    }
  }
  // drop evolutions whose previous stage was taken out, then let `repair` fix the rest
  for (const id of Object.keys(next))
    if (lineOf(id).some((x) => !next[x]) && rnd() < 0.5) delete next[id];
  return { next: repair(next, rnd), brought: brought.filter((id) => getCard(id)) };
}

export function* forge(
  player: DeckList,
  seed: number,
  budget: ForgeBudget = DEFAULT_BUDGET,
): Generator<ForgeProgress, ForgeResult, void> {
  const rnd = forgeRng(seed);
  const seeds = (n: number) => Array.from({ length: n }, () => Math.floor(rnd() * 1e9));
  const seedsList = seedDecks(rnd);
  const total =
    seedsList.length * budget.scoutGames +
    budget.climbSteps * budget.climbGames +
    Math.ceil(budget.climbSteps / 10) * budget.climbGames +
    2 * budget.verifyGames;
  let games = 0;
  let kept = 0;
  let tried = 0;
  let best = 0;
  let spotlight: string[] = [];
  const progress = (phase: ForgePhase): ForgeProgress => ({
    phase,
    games,
    fraction: Math.min(1, games / total),
    best,
    spotlight,
    kept,
    tried,
  });

  /** Score and wins of `g` on the series; stops early (score -1) once it can no longer reach `beat`. */
  function* series(g: Genome, set: number[], phase: ForgePhase, beat = -Infinity) {
    const deck = toDeckList(g);
    let score = 0;
    let wins = 0;
    for (let i = 0; i < set.length; i++) {
      const s = simulate(player, deck, set[i]!);
      score += s.score;
      if (s.won) wins++;
      games++;
      yield progress(phase);
      if (score + (set.length - i - 1) * TOP_SCORE < beat) return { score: -1, wins };
    }
    return { score, wins };
  }

  // 1. scout
  const scoutSet = seeds(budget.scoutGames);
  let current = seedsList[0]!;
  let currentScore = -Infinity;
  let start = current;
  for (const s of seedsList) {
    spotlight = Object.keys(s)
      .filter((id) => getCard(id).rarity === "legendary")
      .slice(0, 4);
    const r = yield* series(s, scoutSet, "scout");
    if (r.score > currentScore) {
      current = s;
      start = s;
      currentScore = r.score;
      best = r.wins / scoutSet.length;
    }
  }

  // 2. climb
  let set = seeds(budget.climbGames);
  const rate = (r: { wins: number }) => r.wins / set.length;
  let r0 = yield* series(current, set, "climb");
  currentScore = r0.score;
  best = rate(r0);
  for (let step = 0; step < budget.climbSteps && !budget.stop?.(); step++) {
    if (step > 0 && step % 10 === 0) {
      set = seeds(budget.climbGames);
      r0 = yield* series(current, set, "climb");
      currentScore = r0.score;
      best = rate(r0);
    }
    const { next, brought } = mutate(current, rnd);
    spotlight = brought;
    tried++;
    const r = yield* series(next, set, "climb", currentScore);
    if (r.score >= currentScore) {
      current = next;
      currentScore = r.score;
      best = rate(r);
      kept++;
    }
  }

  // 3. verify against the best starting deck on fresh shuffles
  const fresh = seeds(budget.verifyGames);
  spotlight = [];
  const a = yield* series(current, fresh, "verify");
  const b = start === current ? a : yield* series(start, fresh, "verify");
  const [deck, won] = a.score >= b.score ? [current, a] : [start, b];
  best = won.wins / fresh.length;
  games = Math.max(games, total);
  yield progress("done");
  return { deck, winRate: best, games };
}
