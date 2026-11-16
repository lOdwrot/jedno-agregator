/**
 * Pure geometry of the gentle fire that creeps over the demons' half with every soul they take:
 * it starts at their edge and spreads towards the middle line (never onto the player's half).
 */
import { SOULS_TO_WIN } from "../data/cards";
import { rng } from "./meadowPlan";

/** How far the fire reaches for `souls` taken souls: 0 = nothing, 1 = the demons' whole half. */
export function heat(souls: number): number {
  const n = Math.max(0, Math.min(SOULS_TO_WIN, Math.floor(souls)));
  if (n >= SOULS_TO_WIN) return 1;
  return [0, 0.35, 0.6, 0.82][Math.min(3, n)] ?? 0.82;
}

/** Heat of a point on the demons' half: 0 at their edge (`top`), 1 at the middle line. */
export function scorch(y: number, top: number, mid: number): number {
  return Math.max(0, Math.min(1, (y - top) / Math.max(1, mid - top)));
}

export interface Flame {
  x: number;
  y: number;
  /** Heat at which it catches (see `scorch`). */
  at: number;
  size: number;
  phase: number;
}

/** Small flames scattered over the demons' half (`0 … mid`), back to front. */
export function flames(w: number, mid: number, top = 0, seed = 13): Flame[] {
  const r = rng(seed);
  const count = Math.round(Math.min(48, Math.max(14, (w * mid) / 7000)));
  const out: Flame[] = [];
  for (let i = 0; i < count; i++) {
    const y = r() * Math.max(1, mid - 14);
    out.push({
      x: r() * w,
      y,
      at: scorch(y, top, mid),
      size: 9 + r() * 12,
      phase: r() * Math.PI * 2,
    });
  }
  return out.sort((a, b) => a.y - b.y);
}
