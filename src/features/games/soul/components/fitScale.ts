/** Below this the text would be unreadable — the dialog scrolls instead. */
const MIN_SCALE = 0.45;
/** Big boxes get a bigger card, but not a blown-up one. */
const MAX_SCALE = 1.5;

/** Largest scale that fits a `w`×`h` box into `boxW`×`boxH` (between the minimum and maximum scale). */
export function fitScale(w: number, h: number, boxW: number, boxH: number): number {
  if (!w || !h || !boxW || !boxH) return 1;
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, boxW / w, boxH / h));
}
