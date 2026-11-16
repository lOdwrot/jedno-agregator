import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { ALL_CARDS, isSaint } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
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
const card = (g: Game, cardId: string) =>
  toInPlay({ uid: g.nextUid++, cardId, finish: "plain" }, 0);
const hit = (damage: number) => ({ name: "test", cost: 0, damage });

describe("Sobór św. Jura (saintArmor place)", () => {
  it("knows the saints by name", () => {
    const saints = ALL_CARDS.filter(isSaint).map((c) => c.id);
    expect(saints).toContain("jerzy");
    expect(saints).toContain("wojciech");
    expect(saints).not.toContain("dorota");
    expect(saints).not.toContain("kleryk");
  });

  it("takes 20 off every hit on a saint, whoever owns the place", () => {
    for (const owner of ["me", "ai"] as const) {
      const g = myTurn();
      g.players.ai.active = card(g, "jerzy");
      g.players.me.active = card(g, "ministrant");
      const before = previewDamage(g, "me", hit(60));
      g.place = { cardId: "jur", owner };
      expect(previewDamage(g, "me", hit(60))).toBe(before - 20);
    }
  });

  it("does not protect characters that are not saints", () => {
    const g = myTurn();
    g.players.ai.active = card(g, "wikariusz");
    g.players.me.active = card(g, "ministrant");
    const before = previewDamage(g, "me", hit(60));
    g.place = { cardId: "jur", owner: "ai" };
    expect(previewDamage(g, "me", hit(60))).toBe(before);
  });

  it("never makes damage negative", () => {
    const g = myTurn();
    g.players.ai.active = card(g, "wojciech");
    g.players.me.active = card(g, "ministrant");
    g.place = { cardId: "jur", owner: "ai" };
    expect(previewDamage(g, "me", hit(10))).toBe(0);
  });
});
