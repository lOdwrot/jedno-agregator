import { describe, expect, it } from "vitest";
import { ANIMALS, createArk, flip, hideMismatch, isFaceUp, rank } from "./engine";

describe("Ark engine", () => {
  it("deals every animal exactly twice", () => {
    const s = createArk(3);
    expect(s.deck).toHaveLength(ANIMALS.length * 2);
    for (const a of ANIMALS) expect(s.deck.filter((x) => x === a.id)).toHaveLength(2);
  });

  it("matching pair stays face up, mismatch waits to be hidden", () => {
    let s = createArk(5);
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
    const s = flip(createArk(1), 0);
    expect(flip(s, 0)).toBe(s);
  });

  it("wins after all pairs", () => {
    let s = createArk(9);
    for (const a of ANIMALS) {
      const i = s.deck.indexOf(a.id);
      s = flip(flip(s, i), s.deck.indexOf(a.id, i + 1));
    }
    expect(s.won).toBe(true);
    expect(s.moves).toBe(ANIMALS.length);
    expect(rank(s.moves)).toMatch(/Kapitan/);
  });
});
