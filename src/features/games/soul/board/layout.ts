/**
 * Pure board geometry shared by the Pixi renderer and the accessible hit layer.
 * Everything is in CSS pixels of the board area; (x, y) is the centre of a card.
 */
import { BENCH_SIZE } from "../data/cards";
import type { Game, PlayerId } from "../engine/state";

/** Card proportions: base card is 200 × 280 at scale 1. */
export const CARD_W = 200;
export const CARD_H = 280;

export type Zone = "hand" | "active" | "bench" | "discard" | "place";

export interface Slot {
  key: number;
  pid: PlayerId;
  zone: Zone;
  x: number;
  y: number;
  scale: number;
  rot: number;
  faceUp: boolean;
  z: number;
}

export interface Anchors {
  deck: Record<PlayerId, { x: number; y: number }>;
  discard: Record<PlayerId, { x: number; y: number }>;
  souls: Record<PlayerId, { x: number; y: number }>;
  active: Record<PlayerId, { x: number; y: number }>;
  bench: Record<PlayerId, { x: number; y: number }[]>;
  hand: Record<PlayerId, { x: number; y: number }>;
  place: { x: number; y: number };
  mid: number;
  /** Scale of an active card (others derive from it). */
  unit: number;
}

/** Key used for the place card sprite (it has no uid in the state). */
export const PLACE_KEY = -1;

export function anchors(w: number, h: number): Anchors {
  return w > h * 1.25 ? landscape(w, h) : portrait(w, h);
}

/** Phones: everything stacked in one column (~5.5 card heights). */
function portrait(w: number, h: number): Anchors {
  const ch = Math.min(h / 5.5, (w / 4.4) * 1.4, 190);
  const unit = ch / CARD_H;
  const cw = CARD_W * unit;
  const cx = w / 2;
  const y = (k: number) => k * ch + Math.max(0, (h - 5.5 * ch) / 2);
  const benchGap = cw * 0.78;
  const row = (yy: number) =>
    Array.from({ length: BENCH_SIZE }, (_, i) => ({
      x: cx + (i - (BENCH_SIZE - 1) / 2) * benchGap,
      y: yy,
    }));
  const side = Math.min(cw * 1.35, (w - cw) / 2 - cw * 0.42);
  return {
    unit,
    mid: y(2.48),
    hand: { ai: { x: cx, y: y(0.13) }, me: { x: cx, y: y(5.06) } },
    bench: { ai: row(y(0.84)), me: row(y(4.14)) },
    active: { ai: { x: cx, y: y(1.74) }, me: { x: cx, y: y(3.22) } },
    deck: { ai: { x: cx - cw / 2 - side, y: y(1.74) }, me: { x: cx + cw / 2 + side, y: y(3.22) } },
    discard: {
      ai: { x: cx + cw / 2 + side, y: y(1.74) },
      me: { x: cx - cw / 2 - side, y: y(3.22) },
    },
    souls: { ai: { x: cx + cw / 2 + side, y: y(1.12) }, me: { x: cx - cw / 2 - side, y: y(3.84) } },
    place: { x: cx - cw / 2 - side, y: y(2.48) },
  };
}

/** Tablets / desktops: the pew sits next to the active card, so cards can be much bigger. */
function landscape(w: number, h: number): Anchors {
  const ch = Math.min(h / 3.75, (w / 7.2) * 1.4, 260);
  const unit = ch / CARD_H;
  const cw = CARD_W * unit;
  const cx = w / 2 - cw * 0.4;
  const y = (k: number) => k * ch + Math.max(0, (h - 3.75 * ch) / 2);
  const row = (yy: number) =>
    Array.from({ length: BENCH_SIZE }, (_, i) => ({ x: cx + cw * 1.05 + i * cw * 0.8, y: yy }));
  return {
    unit,
    mid: y(1.62),
    hand: { ai: { x: w / 2, y: y(0.1) }, me: { x: w / 2, y: y(3.28) } },
    bench: { ai: row(y(0.97)), me: row(y(2.27)) },
    active: { ai: { x: cx, y: y(0.97) }, me: { x: cx, y: y(2.27) } },
    deck: { ai: { x: cx - cw * 2.3, y: y(0.97) }, me: { x: cx + cw * 3.75, y: y(2.27) } },
    discard: { ai: { x: cx + cw * 3.75, y: y(0.97) }, me: { x: cx - cw * 2.3, y: y(2.27) } },
    souls: { ai: { x: cx - cw * 1.2, y: y(0.72) }, me: { x: cx - cw * 1.2, y: y(2.52) } },
    place: { x: cx - cw * 2.3, y: y(1.62) },
  };
}

/** Where every visible card should be for the given state. */
export function computeSlots(g: Game, w: number, h: number): Slot[] {
  const a = anchors(w, h);
  const out: Slot[] = [];
  const u = a.unit;
  for (const pid of ["ai", "me"] as const) {
    const p = g.players[pid];
    // hand: a fan; the opponent's hand peeks from the top edge (backs)
    const n = p.hand.length;
    const hs = pid === "me" ? u * 0.86 : u * 0.45;
    const cw = CARD_W * hs;
    const span = Math.min(w - cw - 16, n * cw * 0.92);
    const step = n > 1 ? span / (n - 1) : 0;
    p.hand.forEach((c, i) => {
      const t = n > 1 ? i / (n - 1) - 0.5 : 0;
      const fan = pid === "me" ? 1 : -1;
      out.push({
        key: c.uid,
        pid,
        zone: "hand",
        x: a.hand[pid].x + (i - (n - 1) / 2) * step,
        y: a.hand[pid].y + fan * Math.abs(t) * cw * 0.18,
        scale: hs,
        rot: fan * t * Math.min(0.35, n * 0.04),
        faceUp: pid === "me",
        z: 100 + i,
      });
    });
    if (p.active)
      out.push({
        key: p.active.uid,
        pid,
        zone: "active",
        ...a.active[pid],
        scale: u,
        rot: 0,
        faceUp: true,
        z: 50,
      });
    p.bench.forEach((c, i) =>
      out.push({
        key: c.uid,
        pid,
        zone: "bench",
        ...a.bench[pid][i]!,
        scale: u * 0.7,
        rot: 0,
        faceUp: true,
        z: 40 + i,
      }),
    );
    const top = p.discard.at(-1);
    if (top)
      out.push({
        key: top.uid,
        pid,
        zone: "discard",
        ...a.discard[pid],
        scale: u * 0.62,
        rot: pid === "me" ? -0.06 : 0.06,
        faceUp: true,
        z: 10,
      });
  }
  if (g.place)
    out.push({
      key: PLACE_KEY,
      pid: g.place.owner,
      zone: "place",
      ...a.place,
      scale: u * 0.55,
      rot: 0,
      faceUp: true,
      z: 5,
    });
  return out;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Axis-aligned box of a slot (rotation ignored — good enough for hit testing). */
export function slotRect(s: Slot): Rect {
  const w = CARD_W * s.scale;
  const h = CARD_H * s.scale;
  return { x: s.x - w / 2, y: s.y - h / 2, w, h };
}

/** Drop area for benching a card: the whole own bench row. */
export function benchZone(g: Game, w: number, h: number): Rect {
  const a = anchors(w, h);
  const ch = CARD_H * a.unit * 0.7;
  const first = a.bench.me[0]!;
  const last = a.bench.me[BENCH_SIZE - 1]!;
  const cw = CARD_W * a.unit * 0.7;
  void g;
  return { x: first.x - cw / 2, y: first.y - ch / 2, w: last.x - first.x + cw, h: ch };
}

export const inside = (r: Rect, x: number, y: number) =>
  x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
