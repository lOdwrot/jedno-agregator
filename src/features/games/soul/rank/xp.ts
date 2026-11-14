/** Rank points ("punkty rangi"): won by victories (more for harder opponents), lost by defeats (more at higher ranks). */
import type { Opponent } from "../data/opponents";
import { RANKS, type Rank } from "./ranks";

/** Points needed to climb from rank `i` to rank `i + 1` — every step costs more. */
export const stepCost = (i: number) => 60 + 30 * i + 10 * i * i;

/** Total points at which each rank starts (THRESHOLDS[0] = 0). */
export const THRESHOLDS: readonly number[] = RANKS.map((_, i) =>
  Array.from({ length: i }, (_, j) => stepCost(j)).reduce((a, b) => a + b, 0),
);

export const TOP = RANKS.length - 1;

/** Index of the rank held with `xp` points. */
export function rankIndex(xp: number): number {
  let i = 0;
  while (i < TOP && xp >= THRESHOLDS[i + 1]!) i++;
  return i;
}

export const rankOf = (xp: number): Rank => RANKS[rankIndex(xp)]!;

/** Progress inside the current rank: points gained in it, points it takes, fraction 0..1 (1 at the top rank). */
export function rankProgress(xp: number) {
  const i = rankIndex(xp);
  if (i === TOP) return { index: i, into: xp - THRESHOLDS[i]!, need: 0, fraction: 1 };
  const need = stepCost(i);
  const into = xp - THRESHOLDS[i]!;
  return { index: i, into, need, fraction: Math.min(1, into / need) };
}

export const WIN_XP: Record<Opponent["difficulty"], number> = {
  łatwy: 20,
  średni: 30,
  trudny: 45,
  "bardzo trudny": 60,
  ekstremalny: 80,
  niepokonany: 120,
};

/** A defeat costs the same against every opponent — only the player's rank matters. */
export const lossXp = (xp: number) => 5 + 5 * rankIndex(xp);

/** Points after a duel (never below zero). */
export function afterDuel(xp: number, won: boolean, difficulty: Opponent["difficulty"]): number {
  return won ? xp + WIN_XP[difficulty] : Math.max(0, xp - lossXp(xp));
}

const EPS = 1e-6;

/** Stops between `from` and `to`: every rank boundary crossed on the way, then the target. */
export function rankStops(from: number, to: number): number[] {
  const stops: number[] = [];
  if (to > from) {
    for (const t of THRESHOLDS) if (t > from && t <= to) stops.push(t);
  } else {
    for (const t of [...THRESHOLDS].reverse())
      if (t > 0 && t <= from && t > to) stops.push(t - EPS);
  }
  if (stops.at(-1) !== to) stops.push(to);
  return stops;
}
