import { describe, expect, it } from "vitest";
import {
  ANIMALS,
  LEVELS,
  createArk,
  flip,
  hideMismatch,
  isFaceUp,
  rank,
  type Level,
} from "./engine";

describe("Ark engine", () => {
  it.each(Object.keys(LEVELS) as Level[])(
    "level %s deals each of its animals exactly twice",
    (lvl) => {
      const s = createArk(lvl, 3);
      const { pairs } = LEVELS[lvl];
      expect(s.deck).toHaveLength(pairs * 2);
      for (const a of ANIMALS.slice(0, pairs))
        expect(s.deck.filter((x) => x === a.id)).toHaveLength(2);
    },
  );

  it("levels get bigger and there are enough animals for the hardest", () => {
    expect(LEVELS.latwy.pairs).toBeLessThan(LEVELS.sredni.pairs);
    expect(LEVELS.sredni.pairs).toBeLessThan(LEVELS.trudny.pairs);
    expect(ANIMALS.length).toBeGreaterThanOrEqual(LEVELS.trudny.pairs);
    expect(new Set(ANIMALS.map((a) => a.emoji)).size).toBe(ANIMALS.length);
  });

  it("matching pair stays face up, mismatch waits to be hidden", () => {
    let s = createArk("latwy", 5);
    const a = s.deck[0]!;
    const pair = s.deck.indexOf(a, 1);
    const other = s.deck.findIndex((x) => x !== a);
    s = flip(flip(s, 0), other);
    expect(s.mismatch).toBe(true);
    expect(flip(s, pair)).toBe(s); // blocked until hidden
    s = hideMismatch(s);
    expect(isFaceUp(s, 0)).toBe(false);
    s = flip(flip(s, 0), pair);
    expect(s.matched).toEqual([a]);
    expect(s.lastMatch).toBe(a);
    expect(s.moves).toBe(2);
  });

  it("ignores clicks on face-up cards", () => {
    const s = flip(createArk("latwy", 1), 0);
    expect(flip(s, 0)).toBe(s);
  });

  it("wins after all pairs of the level", () => {
    let s = createArk("sredni", 9);
    for (const a of ANIMALS.slice(0, LEVELS.sredni.pairs)) {
      const i = s.deck.indexOf(a.id);
      s = flip(flip(s, i), s.deck.indexOf(a.id, i + 1));
    }
    expect(s.won).toBe(true);
    expect(s.moves).toBe(LEVELS.sredni.pairs);
    expect(rank(s.moves, s.pairs)).toMatch(/Kapitan/);
    expect(rank(40, 12)).toMatch(/żółwia/);
  });
});
