import { describe, expect, it } from "vitest";
import { findPack, PACKS } from "../collection/packs";
import { deckList, newProfile } from "../collection/profile";
import { DECK_SIZE } from "../data/cards";
import { ALL_OPPONENTS, IDEAL_OPPONENT, OPPONENTS } from "../data/opponents";
import { DEFAULT_BUDGET, forge, forgeRng, mutate, simulate, type ForgeBudget } from "./forge";
import { archetype, legal, repair, seedDecks, toDeckList, toRecord } from "./pool";

const TINY: ForgeBudget = { scoutGames: 2, climbSteps: 4, climbGames: 3, verifyGames: 4 };

function run(seed: number, budget = TINY) {
  const it = forge(deckList(newProfile()), seed, budget);
  const seen: string[] = [];
  for (let r = it.next(); ; r = it.next()) {
    if (r.done) return { result: r.value, seen };
    if (seen.at(-1) !== r.value.phase) seen.push(r.value.phase);
  }
}

describe("Idealny oponent — deck rules", () => {
  it("every starting deck, archetype and mutation is a legal 50-card deck", () => {
    const rnd = forgeRng(7);
    const decks = [...seedDecks(rnd), ...Array.from({ length: 30 }, () => archetype(rnd))];
    for (const g of decks) {
      expect(legal(g), JSON.stringify(g)).toBe(true);
      expect(toDeckList(g)).toHaveLength(DECK_SIZE);
      let m = g;
      for (let i = 0; i < 20; i++) {
        m = mutate(m, rnd).next;
        expect(legal(m), JSON.stringify(m)).toBe(true);
      }
    }
  });

  it("repair keeps at most 3 copies and brings back the previous stages", () => {
    const g = repair({ legion: 5 }, forgeRng(1));
    expect(g.legion).toBe(3);
    expect(g.kajdany).toBeGreaterThan(0);
    expect(g.raz).toBeGreaterThan(0);
    expect(legal(g)).toBe(true);
  });
});

describe("Idealny oponent — the search", () => {
  it("goes through scout → climb → verify and returns a legal deck, the same for the same seed", () => {
    const a = run(42);
    expect(a.seen).toEqual(["scout", "climb", "verify", "done"]);
    expect(legal(a.result.deck)).toBe(true);
    expect(a.result.winRate).toBeGreaterThanOrEqual(0);
    expect(a.result.winRate).toBeLessThanOrEqual(1);
    expect(toRecord(run(42).result.deck)).toEqual(toRecord(a.result.deck));
  });

  it("stops climbing when told to", () => {
    let calls = 0;
    const { result } = run(3, { ...TINY, climbSteps: 1000, stop: () => ++calls > 2 });
    expect(legal(result.deck)).toBe(true);
    expect(calls).toBe(3);
  });

  it(
    "against the starter deck it does at least as well as every fixed opponent deck",
    { timeout: 120_000 },
    () => {
      const { result } = run(5, DEFAULT_BUDGET);
      const player = deckList(newProfile());
      const rate = (d: ReturnType<typeof toDeckList>) => {
        let w = 0;
        for (let s = 1; s <= 80; s++) if (simulate(player, d, s * 104729).won) w++;
        return w / 80;
      };
      const forged = rate(toDeckList(result.deck));
      expect(forged).toBeGreaterThan(0.9);
      for (const o of OPPONENTS)
        expect(forged, o.id).toBeGreaterThanOrEqual(rate(toDeckList(repair(o.deck, forgeRng(1)))));
    },
  );
});

describe("Idealny oponent — the opponent card", () => {
  it("is the very last opponent, experimental, without fee or handicap", () => {
    expect(ALL_OPPONENTS.at(-1)).toBe(IDEAL_OPPONENT);
    expect(OPPONENTS).not.toContain(IDEAL_OPPONENT);
    expect(IDEAL_OPPONENT.adaptive).toBe(true);
    expect(IDEAL_OPPONENT.difficulty).toBe("eksperymentalny");
    expect(IDEAL_OPPONENT.fee).toBeUndefined();
    expect(IDEAL_OPPONENT.extraDraw).toBeUndefined();
    expect(IDEAL_OPPONENT.finish).toBeUndefined();
    expect(IDEAL_OPPONENT.reward.win).toBe(500);
  });

  it("a victory brings a booster of any edition, all equally likely", () => {
    const prize = IDEAL_OPPONENT.prize!;
    expect(prize.map((p) => p.pack).sort()).toEqual(PACKS.map((p) => p.id).sort());
    expect(prize.reduce((s, p) => s + p.chance, 0)).toBeCloseTo(1, 9);
    for (const p of prize) expect(findPack(p.pack).id).toBe(p.pack);
  });
});
