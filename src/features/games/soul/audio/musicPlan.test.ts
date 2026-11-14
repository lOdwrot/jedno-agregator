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
    expect(planBar(0, false, 0).chord).toContain(16); // calm music is in D major too
  });

  it("stays cheerful and calm: no tritones or minor seconds, bells inside D major", () => {
    const dMajor = [0, 2, 4, 5, 7, 9, 11].map((x) => (x + 2) % 12); // pitch classes above C
    for (const l of [0, 1, 2, 3] as const)
      for (let n = 0; n < 8; n++)
        for (const dark of [false, true]) {
          const p = planBar(l, dark, n);
          const c = p.chord;
          const clash = c.some((a) => c.some((b) => [1, 6, 11].includes(Math.abs(a - b) % 12)));
          expect(clash).toBe(false);
          for (const s of [...c, ...p.bells.map(([b]) => b)])
            expect(dMajor).toContain((((s + 2) % 12) + 12) % 12);
        }
  });

  it("keeps the bell melody inside the bar", () => {
    for (const l of [0, 1, 2, 3] as const)
      for (let n = 0; n < 8; n++)
        for (const [, at] of planBar(l, n % 2 === 0, n).bells) expect(at).toBeLessThan(4);
  });
});

describe("musicPlan — infernal theme", () => {
  const bar = (l: 0 | 1 | 2 | 3, dark = false, n = 0) => planBar(l, dark, n, "infernal");

  it("is slower, darker and its heartbeat speeds up with the score", () => {
    for (const l of [0, 1, 2, 3] as const) {
      expect(bar(l).bar).toBeGreaterThan(planBar(l, false, 0).bar);
      expect(bar(l).cutoff).toBeLessThan(planBar(l, false, 0).cutoff);
      expect(bar(l).drone).toBe(true);
      expect(bar(l).detune).toBeGreaterThan(1);
    }
    expect(bar(3).heartbeats!).toBeGreaterThan(bar(0).heartbeats!);
    expect(bar(3).bar).toBeLessThan(bar(0).bar);
  });

  it("has no bright finale: every chord keeps a tritone or a minor second", () => {
    for (const l of [0, 1, 2, 3] as const)
      for (let n = 0; n < 8; n++) {
        const c = bar(l, n % 2 === 1, n).chord;
        const uneasy = c.some((a) => c.some((b) => [1, 6].includes(Math.abs(a - b) % 12)));
        expect(uneasy).toBe(true);
        expect(c).not.toContain(16); // never the D-major third
      }
  });

  it("keeps the tolling bell inside the bar", () => {
    for (const l of [0, 1, 2, 3] as const)
      for (let n = 0; n < 8; n++)
        for (const [, at] of bar(l, false, n).bells) expect(at).toBeLessThan(4);
  });
});
