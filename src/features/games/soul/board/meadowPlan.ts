/**
 * Pure geometry of the meadow that grows on the player's half with every saved soul:
 * grass spreads up from the player's edge, and when all souls are saved the whole board
 * turns green, a river runs along the middle line and sheep come to graze.
 */
import { BENCH_SIZE, SOULS_TO_WIN } from "../data/cards";
import { CARD_H, CARD_W, type Anchors } from "./layout";

/** Deterministic pseudo-random numbers, so the meadow doesn't jump on every resize. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * How far the meadow reaches for `souls` saved souls: 0 = nothing, 1 = the player's whole half,
 * 2 = the whole board (only once every soul is saved). Grows a bit more with every soul.
 */
export function coverage(souls: number): number {
  const n = Math.max(0, Math.min(SOULS_TO_WIN, Math.floor(souls)));
  if (n >= SOULS_TO_WIN) return 2;
  return [0, 0.4, 0.68, 0.9][Math.min(3, n)] ?? 0.88;
}

export interface Tuft {
  x: number;
  y: number;
  /** Coverage at which it sprouts (0 at the player's edge, 1 at the middle, 2 at the far edge). */
  at: number;
  size: number;
  blades: number;
  flower: boolean;
  phase: number;
}

/**
 * Coverage of a point: 0 at the player's `base` line (and below it), 1 at the middle line, 2 at the top.
 * `base` is the player's edge, or the middle of their hand when the hand hides the bottom of the board.
 */
export function reach(y: number, base: number, mid: number): number {
  if (y >= mid) return Math.max(0, (base - y) / Math.max(1, base - mid));
  return 1 + (mid - y) / Math.max(1, mid);
}

/** Grass tufts scattered over the whole board; denser on the player's half. */
export function tufts(w: number, h: number, mid: number, base = h, seed = 7): Tuft[] {
  const r = rng(seed);
  const area = w * h;
  const count = Math.round(Math.min(260, Math.max(60, area / 2600)));
  const out: Tuft[] = [];
  for (let i = 0; i < count; i++) {
    const mine = i < count * 0.6;
    const y = mine ? mid + r() * (h - mid) : r() * mid;
    const x = r() * w;
    out.push({
      x,
      y,
      at: reach(y, base, mid),
      size: 7 + r() * 9,
      blades: 3 + Math.floor(r() * 3),
      flower: r() < 0.22,
      phase: r() * Math.PI * 2,
    });
  }
  // back to front, so lower tufts overlap the ones behind them
  return out.sort((a, b) => a.y - b.y);
}

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Rectangles of the card slots, which sheep keep away from (they'd hide under the cards). */
export function cardRects(a: Anchors): Rect[] {
  const box = (p: { x: number; y: number }, s: number, pad = 6): Rect => ({
    x0: p.x - (CARD_W * s) / 2 - pad,
    y0: p.y - (CARD_H * s) / 2 - pad,
    x1: p.x + (CARD_W * s) / 2 + pad,
    y1: p.y + (CARD_H * s) / 2 + pad,
  });
  const u = a.unit;
  const out: Rect[] = [];
  for (const pid of ["ai", "me"] as const) {
    out.push(box(a.active[pid], u), box(a.deck[pid], u * 0.62), box(a.discard[pid], u * 0.62));
    for (let i = 0; i < BENCH_SIZE; i++) out.push(box(a.bench[pid][i]!, u * 0.7));
  }
  out.push(box(a.place, u * 0.55));
  // both hands, the whole width (the fan spreads wide)
  const mine = (CARD_H * u * 0.86) / 2 + 12;
  const theirs = (CARD_H * u * 0.45) / 2 + 12;
  out.push({ x0: -1e4, y0: a.hand.me.y - mine, x1: 1e4, y1: 1e4 });
  out.push({ x0: -1e4, y0: -1e4, x1: 1e4, y1: a.hand.ai.y + theirs });
  return out;
}

/** Spots where the sheep graze: free of cards, off the river, inside the board. */
export function pastures(a: Anchors, w: number, h: number, n: number, seed = 11) {
  const r = rng(seed);
  const rects = cardRects(a);
  const margin = 22;
  const river = Math.max(18, h * 0.035);
  const free = (x: number, y: number) =>
    Math.abs(y - a.mid) > river + 16 &&
    !rects.some((q) => x > q.x0 && x < q.x1 && y > q.y0 && y < q.y1);
  const out: { x: number; y: number }[] = [];
  for (let k = 0; k < 400 && out.length < n; k++) {
    const x = margin + r() * (w - 2 * margin);
    const y = margin + r() * (h - 2 * margin);
    if (!free(x, y) || out.some((s) => Math.hypot(s.x - x, s.y - y) < 46)) continue;
    out.push({ x, y });
  }
  // a crowded phone board: fall back to the side edges
  for (let i = 0; out.length < n; i++)
    out.push({
      x: i % 2 ? w - margin : margin,
      y: margin + ((i * 97) % Math.max(1, h - 2 * margin)),
    });
  return out;
}

/** The river's centre line along the middle of the board (gently meandering). */
export function riverY(x: number, w: number, mid: number, amp: number, t = 0): number {
  return mid + Math.sin((x / Math.max(1, w)) * Math.PI * 2.4 + t * 0.6) * amp;
}
