import { describe, expect, it } from "vitest";
import { SOULS_TO_WIN } from "../data/cards";
import { anchors } from "./layout";
import { cardRects, coverage, pastures, reach, tufts } from "./meadowPlan";

describe("meadow of saved souls", () => {
  it("grows with every soul and covers the whole board only at the end", () => {
    const c = Array.from({ length: SOULS_TO_WIN + 1 }, (_, i) => coverage(i));
    expect(c[0]).toBe(0);
    for (let i = 1; i < c.length; i++) expect(c[i]!).toBeGreaterThan(c[i - 1]!);
    expect(c[SOULS_TO_WIN - 1]!).toBeLessThan(1);
    expect(c[SOULS_TO_WIN]).toBe(2);
  });

  it("starts at the player's edge", () => {
    expect(reach(640, 640, 300)).toBe(0);
    expect(reach(300, 640, 300)).toBe(1);
    expect(reach(0, 640, 300)).toBe(2);
    // below the middle of the hand counts as the edge
    expect(reach(620, 580, 300)).toBe(0);
  });

  it("is deterministic and stays on the board", () => {
    expect(tufts(390, 640, 300)).toEqual(tufts(390, 640, 300));
    for (const t of tufts(390, 640, 300)) {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThanOrEqual(390);
      expect(t.at).toBeGreaterThanOrEqual(0);
      expect(t.at).toBeLessThanOrEqual(2);
    }
  });

  it("sends the sheep to free spots away from the cards", () => {
    for (const [w, h] of [
      [390, 640],
      [1440, 800],
    ] as const) {
      const a = anchors(w, h);
      const rects = cardRects(a);
      const spots = pastures(a, w, h, 6);
      expect(spots).toHaveLength(6);
      for (const s of spots) {
        expect(s.x).toBeGreaterThan(0);
        expect(s.x).toBeLessThan(w);
        expect(rects.some((q) => s.x > q.x0 && s.x < q.x1 && s.y > q.y0 && s.y < q.y1)).toBe(false);
      }
    }
  });
});
