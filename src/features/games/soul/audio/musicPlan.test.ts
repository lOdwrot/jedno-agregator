import { describe, expect, it } from "vitest";
import { SOULS_TO_WIN } from "../data/cards";
import { musicLevel, planBar } from "./musicPlan";

describe("musicPlan", () => {
  it("reaches the finale level when one soul is left to win", () => {
    expect(musicLevel(0)).toBe(0);
    expect(musicLevel(SOULS_TO_WIN - 1)).toBe(3);
    expect(musicLevel(SOULS_TO_WIN + 2)).toBe(3);
    expect(musicLevel(-1)).toBe(0);
  });

  it("gets faster and busier with every level", () => {
    const bars = ([0, 1, 2, 3] as const).map((l) => planBar(l, false, 0));
    for (let i = 1; i < bars.length; i++) {
      expect(bars[i]!.bar).toBeLessThan(bars[i - 1]!.bar);
      expect(bars[i]!.cutoff).toBeGreaterThan(bars[i - 1]!.cutoff);
    }
    expect(bars[0]!.pulse + bars[0]!.arp + bars[0]!.hats).toBe(0);
    expect(bars[3]!.kick).toBe(true);
    expect(bars[3]!.arp).toBeGreaterThan(bars[2]!.arp);
  });

  it("plays a major chord with a major third in the cheerful finale", () => {
    const tonic = planBar(3, false, 0).chord;
    expect(tonic).toContain(16); // F# above D: D major
    expect(planBar(0, false, 0).chord).toContain(15); // F: calm D dorian
  });

  it("keeps the bell melody inside the bar", () => {
    for (const l of [0, 1, 2, 3] as const)
      for (let n = 0; n < 8; n++)
        for (const [, at] of planBar(l, n % 2 === 0, n).bells) expect(at).toBeLessThan(4);
  });
});
