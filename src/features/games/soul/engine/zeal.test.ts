import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import { dispatch } from "./actions";
import { aiAction, bestAttack } from "./ai";
import { fuelMax, previewDamage } from "./combat";
import { charDef, createGame, toInPlay, type DeckList, type Game } from "./state";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

/** The player's turn 3 with `cardId` active (energy attached) against a fresh demon. */
function duel(cardId: string, energy: number, handEnergy: number): Game {
  let g = createGame(deckList(newProfile()), ai, 4);
  g = dispatch(g, aiAction(g, "me")!);
  const n = structuredClone(g);
  n.turn = "me";
  n.turnNo = 3;
  n.phase = "main";
  n.flags = { energy: false, supporter: false, retreated: false };
  n.players.me.active = { ...toInPlay({ uid: n.nextUid++, cardId, finish: "plain" }, 1), energy };
  n.players.me.hand = Array.from({ length: handEnergy }, () => ({
    uid: n.nextUid++,
    cardId: "laska",
    finish: "plain" as const,
  }));
  n.players.ai.active = toInPlay({ uid: n.nextUid++, cardId: "belzebub", finish: "plain" }, 1);
  return n;
}

describe("zeal attacks", () => {
  it("fuel: burns chosen grace from hand for extra damage, never more than allowed", () => {
    const g = duel("kaznodzieja", 2, 3);
    const atk = charDef(g.players.me.active!).attacks[0]!;
    expect(fuelMax(g, "me", atk)).toBe(2);
    expect(previewDamage(g, "me", atk, 2) - previewDamage(g, "me", atk)).toBe(60);
    expect(dispatch(g, { type: "attack", index: 0, fuel: 3 })).toBe(g);
    const next = dispatch(g, { type: "attack", index: 0, fuel: 2 });
    expect(next.players.me.hand.filter((c) => c.cardId === "laska")).toHaveLength(1);
    const plain = dispatch(g, { type: "attack", index: 0 });
    expect(next.players.ai.active!.damage - plain.players.ai.active!.damage).toBe(60);
  });

  it("selfDiscard: the big attack empties the attacker's grace", () => {
    const g = duel("pielgrzym", 4, 0);
    const next = dispatch(g, { type: "attack", index: 1 });
    expect(next.players.ai.active?.damage ?? 999).toBeGreaterThan(0);
    const me = next.players.me.active!;
    expect(me.energy).toBe(0);
    expect(next.players.me.discard.filter((c) => c.cardId === "laska")).toHaveLength(4);
  });

  it("the computer burns hand energy only when it secures a knock-out", () => {
    const g = duel("kaznodzieja", 2, 2);
    g.players.ai.active!.damage = 100; // Belzebub has 60 left: 30 + 30 is enough (armor −10 → needs 2)
    const best = bestAttack(g, "me")!;
    expect(best.ko).toBe(true);
    expect(best.fuel).toBe(2);
    g.players.ai.active!.damage = 0;
    expect(bestAttack(g, "me")!.fuel).toBe(0);
  });
});
