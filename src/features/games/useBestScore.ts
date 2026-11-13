import { useCallback, useState } from "react";

const KEY = (game: string) => `jedno-game-best:${game}`;

function read(game: string): number | null {
  try {
    const raw = localStorage.getItem(KEY(game));
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * Best score kept in localStorage. `better(a, b)` says whether `a` beats `b`.
 * `submit` stores the score if it is a new record and returns true in that case.
 */
export function useBestScore(game: string, better: (a: number, b: number) => boolean) {
  const [best, setBest] = useState<number | null>(() => read(game));
  const submit = useCallback(
    (score: number) => {
      const prev = read(game);
      if (prev !== null && !better(score, prev)) return false;
      try {
        localStorage.setItem(KEY(game), String(score));
      } catch {
        /* private mode — keep in memory only */
      }
      setBest(score);
      return true;
    },
    [game, better],
  );
  return { best, submit };
}

export const higherIsBetter = (a: number, b: number) => a > b;
export const lowerIsBetter = (a: number, b: number) => a < b;
