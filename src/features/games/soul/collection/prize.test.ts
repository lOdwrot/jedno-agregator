import { describe, expect, it } from "vitest";
import { createRng } from "../../useGameLoop";
import { findOpponent, OPPONENTS } from "../data/opponents";
import { PACKS, rollPack } from "./packs";
import { canChallenge, grantBooster, newProfile, payFee, rollPrize } from "./profile";

describe("challenge fee & victory booster", () => {
  it("only the three hardest opponents charge a fee and give a booster", () => {
    const fees = Object.fromEntries(OPPONENTS.map((o) => [o.id, o.fee ?? 0]));
    expect(fees).toEqual({
      kanapa: 0,
      plotkary: 0,
      pycha: 0,
      zastepy: 30,
      otchlan: 50,
      niepokonany: 100,
    });
    expect(OPPONENTS.filter((o) => o.prize).map((o) => o.id)).toEqual([
      "zastepy",
      "otchlan",
      "niepokonany",
    ]);
  });

  it.each(OPPONENTS.filter((o) => o.prize).map((o) => [o.id, o] as const))(
    "%s: prize chances sum to 100% and name real packs",
    (_, o) => {
      const sum = o.prize!.reduce((s, x) => s + x.chance, 0);
      expect(sum).toBeCloseTo(1, 9);
      for (const { pack } of o.prize!) expect(PACKS.some((p) => p.id === pack)).toBe(true);
    },
  );

  it("draws the pack edition according to the chances", () => {
    const table = findOpponent("niepokonany")!.prize!;
    const rnd = createRng(11);
    const n = 20000;
    const hits: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      const id = rollPrize(table, rnd).id;
      hits[id] = (hits[id] ?? 0) + 1;
    }
    for (const { pack, chance } of table) expect((hits[pack] ?? 0) / n).toBeCloseTo(chance, 1);
    expect(Object.keys(hits).sort()).toEqual(table.map((x) => x.pack).sort());
  });

  it("pays the fee only when the player can afford it", () => {
    const p = { ...newProfile(), talents: 40 };
    expect(canChallenge(p, 30)).toBe(true);
    expect(payFee(p, 30).talents).toBe(10);
    expect(canChallenge(p, 50)).toBe(false);
    expect(payFee(p, 50)).toBe(p);
    expect(payFee(p)).toBe(p);
  });

  it("a prize booster is free: cards are added, talents and pack credits stay", () => {
    const p = newProfile();
    const cards = rollPack(
      PACKS.find((x) => x.id === "skarbiec")!,
      createRng(5),
    );
    const next = grantBooster(p, cards);
    expect(next.talents).toBe(p.talents);
    expect(next.packs).toBe(p.packs);
    const total = (x: typeof p) =>
      Object.values(x.collection).reduce<number>((s, c) => s + (c ?? 0), 0);
    expect(total(next) - total(p)).toBe(5);
  });
});
