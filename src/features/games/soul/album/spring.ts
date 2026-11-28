/** Rotation of the album card: free spin on Y, a limited tilt on X, springing back to a face. */
export interface Spin {
  ax: number;
  ay: number;
  vx: number;
  vy: number;
}

export const MAX_TILT = 50;
const K = 70;
const DAMP = 11;

/** The face the card settles on: the nearest multiple of 180° once the throw slows down. */
export const restingY = (s: Spin) => Math.round((s.ay + s.vy * 0.18) / 180) * 180;

/** One step (`dt` s) of the released card: it coasts, then springs to rest (X back to 0). */
export function settle(s: Spin, dt: number): Spin {
  const ty = restingY(s);
  const ay = s.ay + s.vy * dt;
  const ax = s.ax + s.vx * dt;
  const vy = s.vy + (-K * (s.ay - ty) - DAMP * s.vy) * dt;
  const vx = s.vx + (-K * s.ax - DAMP * s.vx) * dt;
  return { ax, ay, vx, vy };
}

/** Close enough to rest to stop animating. */
export const atRest = (s: Spin) =>
  Math.abs(s.ax) < 0.05 &&
  Math.abs(s.ay - restingY(s)) < 0.05 &&
  Math.abs(s.vx) < 0.5 &&
  Math.abs(s.vy) < 0.5;

export const clampTilt = (ax: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, ax));
