import { describe, expect, it } from "vitest";
import { OPPONENTS } from "../data/opponents";
import { ART } from "../data/art";
import { RANKS } from "./ranks";
import {
  afterDuel,
  lossXp,
  rankIndex,
  rankProgress,
  stepCost,
  THRESHOLDS,
  TOP,
  WIN_XP,
} from "./xp";

describe("rank points", () => {
  it("every next rank costs more points", () => {
    for (let i = 1; i < TOP; i++) expect(stepCost(i)).toBeGreaterThan(stepCost(i - 1));
    expect(THRESHOLDS[0]).toBe(0);
    for (let i = 1; i <= TOP; i++)
      expect(THRESHOLDS[i]! - THRESHOLDS[i - 1]!).toBe(stepCost(i - 1));
  });

  it("maps points to ranks and progress", () => {
    expect(rankIndex(0)).toBe(0);
    expect(rankIndex(THRESHOLDS[1]! - 1)).toBe(0);
    expect(rankIndex(THRESHOLDS[1]!)).toBe(1);
    expect(rankIndex(1e9)).toBe(TOP);
    expect(rankProgress(30)).toEqual({ index: 0, into: 30, need: 60, fraction: 0.5 });
    expect(rankProgress(1e9).fraction).toBe(1);
  });

  it("harder opponents give more points for a win", () => {
    const gains = OPPONENTS.map((o) => WIN_XP[o.difficulty]);
    for (let i = 1; i < gains.length; i++) expect(gains[i]).toBeGreaterThan(gains[i - 1]!);
  });

  it("a defeat costs the same at every difficulty and more at higher ranks", () => {
    const xp = THRESHOLDS[3]! + 10;
    const losses = OPPONENTS.map((o) => xp - afterDuel(xp, false, o.difficulty));
    expect(new Set(losses).size).toBe(1);
    expect(lossXp(THRESHOLDS[5]!)).toBeGreaterThan(lossXp(THRESHOLDS[2]!));
  });

  it("a defeat can take a rank away but never goes below zero", () => {
    const xp = THRESHOLDS[2]!;
    expect(rankIndex(afterDuel(xp, false, "łatwy"))).toBe(1);
    expect(afterDuel(2, false, "trudny")).toBe(0);
  });

  it("every patron has a picture with a credit", () => {
    for (const r of RANKS) expect(ART[r.patron.art], r.name).toBeDefined();
    expect(new Set(RANKS.map((r) => r.patron.art)).size).toBe(RANKS.length);
  });
});
