import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { getCard } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import type { CharacterDef } from "../data/types";
import { dispatch } from "./actions";
import { aiAction } from "./ai";
import { previewDamage } from "./combat";
import { toInPlay, type DeckList, type Game } from "./state";
import { startedGame } from "./testGame";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

function myTurn(): Game {
  let g = startedGame(deckList(newProfile()), ai, 1);
  g = dispatch(g, aiAction(g, "me")!);
  const next = structuredClone(g);
  next.turn = "me";
  next.phase = "main";
  next.players.me.bench = [];
  next.players.ai.bench = [];
  next.place = null;
  return next;
}
const card = (g: Game, cardId: string, energy = 0) => ({
  ...toInPlay({ uid: g.nextUid++, cardId, finish: "plain" }, 0),
  energy,
});
const hit = (damage: number) => ({ name: "test", cost: 0, damage });

describe("Seminarium w Paradyżu (guard place)", () => {
  it("cancels hits above 100 on clerics and pope candidates of both players", () => {
    for (const owner of ["me", "ai"] as const)
      for (const id of ["kleryk", "kandydat"]) {
        const g = myTurn();
        g.players.ai.active = card(g, id);
        g.players.me.active = card(g, "ministrant");
        const big = previewDamage(g, "me", hit(110));
        expect(big).toBeGreaterThan(100);
        g.place = { cardId: "paradyz", owner };
        expect(previewDamage(g, "me", hit(110))).toBe(0);
        // A hit of at most 100 still lands.
        const small = previewDamage(g, "me", hit(50));
        expect(small).toBeGreaterThan(0);
        expect(small).toBeLessThanOrEqual(100);
      }
  });

  it("cancels only hits above 100 — exactly 100 still lands", () => {
    const g = myTurn();
    g.players.ai.active = card(g, "kleryk");
    g.players.me.active = card(g, "ministrant");
    g.place = { cardId: "paradyz", owner: "me" };
    expect(previewDamage(g, "me", hit(100))).toBe(100);
    expect(previewDamage(g, "me", hit(101))).toBe(0);
  });

  it("does not protect other characters", () => {
    const g = myTurn();
    g.players.ai.active = card(g, "wikariusz");
    g.players.me.active = card(g, "ministrant");
    g.place = { cardId: "paradyz", owner: "me" };
    expect(previewDamage(g, "me", hit(150))).toBeGreaterThan(100);
  });

  it("a real attack leaves the candidate untouched and says why", () => {
    const g = myTurn();
    const priest = card(g, "proboszcz", 4);
    g.players.me.active = priest;
    const cand = card(g, "kandydat");
    g.players.ai.active = cand;
    g.place = { cardId: "paradyz", owner: "ai" };
    g.turnNo = 2;
    const index = (getCard("proboszcz") as CharacterDef).attacks.findIndex((a) => a.damage > 100);
    const next = dispatch(g, { type: "attack", index });
    expect(next.players.ai.active?.uid).toBe(cand.uid);
    expect(next.players.ai.active?.damage).toBe(0);
    expect(next.log.some((l) => l.includes("Seminarium w Paradyżu"))).toBe(true);
  });
});
