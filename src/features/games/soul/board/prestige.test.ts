import { describe, expect, it } from "vitest";
import { panes, seeded } from "./prestige";
import { CARD_H, CARD_W } from "./layout";

describe("stained-glass panes", () => {
  it("are deterministic per card", () => {
    expect(panes("abc")).toEqual(panes("abc"));
    expect(panes("abc")).not.toEqual(panes("xyz"));
    expect(seeded("k")()).toBe(seeded("k")());
  });

  it("tile the inner panel without leaving the card", () => {
    const q = panes("card", 4, 6);
    expect(q).toHaveLength(24);
    for (const quad of q)
      for (const [x, y] of quad) {
        expect(Math.abs(x)).toBeLessThanOrEqual(CARD_W / 2);
        expect(Math.abs(y)).toBeLessThanOrEqual(CARD_H / 2);
      }
  });
});
