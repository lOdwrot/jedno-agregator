import { describe, expect, it } from "vitest";
import { SOULS_TO_WIN } from "../data/cards";
import { flames, heat, scorch } from "./blazePlan";

describe("fire on the demons' half", () => {
  it("spreads with every soul the demons take and fills their half at the end", () => {
    const c = Array.from({ length: SOULS_TO_WIN + 1 }, (_, i) => heat(i));
    expect(c[0]).toBe(0);
    for (let i = 1; i < c.length; i++) expect(c[i]!).toBeGreaterThan(c[i - 1]!);
    expect(c[SOULS_TO_WIN]).toBe(1);
  });

  it("starts at the demons' edge and stops at the middle line", () => {
    expect(scorch(0, 0, 300)).toBe(0);
    expect(scorch(300, 0, 300)).toBe(1);
    expect(scorch(500, 0, 300)).toBe(1);
  });

  it("is deterministic and never burns on the player's half", () => {
    expect(flames(390, 300)).toEqual(flames(390, 300));
    for (const f of flames(390, 300, 20)) {
      expect(f.y).toBeLessThan(300);
      expect(f.at).toBeGreaterThanOrEqual(0);
      expect(f.at).toBeLessThanOrEqual(1);
    }
  });
});
