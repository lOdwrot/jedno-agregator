/**
 * Pure math of the "cut the booster open" swipe: the finger has to sweep sideways across the top
 * of the pack. The covered stretch of the pack's width grows while the finger stays in the band
 * around the tear line; the swipe may start and end anywhere on the screen (off-pack x is clamped).
 */

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Cut {
  /** Where the finger entered the band, 0..1 of the pack width. */
  start: number;
  /** Covered stretch, 0..1 of the pack width (from ≤ to). */
  from: number;
  to: number;
  /** Last position, 0..1. */
  at: number;
}

/** Share of the pack width that must be swept to tear it. */
export const TEAR_DONE = 0.7;

/** Vertical band (fractions of the pack height) where the swipe counts — generous for thumbs. */
export const BAND = { above: 0.3, below: 0.42 } as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function inBand(box: Box, y: number): boolean {
  return y >= box.top - BAND.above * box.height && y <= box.top + BAND.below * box.height;
}

/** Extends the cut with a new pointer position (unchanged outside the band). */
export function extendCut(cut: Cut | null, box: Box, x: number, y: number): Cut | null {
  if (box.width <= 0 || !inBand(box, y)) return cut;
  const f = clamp01((x - box.left) / box.width);
  if (!cut) return { start: f, from: f, to: f, at: f };
  return { start: cut.start, from: Math.min(cut.from, f), to: Math.max(cut.to, f), at: f };
}

export const cutProgress = (cut: Cut | null) => (cut ? cut.to - cut.from : 0);

export const cutDone = (cut: Cut | null) => cutProgress(cut) >= TEAR_DONE;

/** Direction of the swipe: 1 = left → right, -1 = right → left. */
export const cutDir = (cut: Cut | null): 1 | -1 => (cut && cut.at < cut.start ? -1 : 1);
