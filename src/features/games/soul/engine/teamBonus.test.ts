import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import { dispatch } from "./actions";
import { aiAction } from "./ai";
import { bonusDamage } from "./combat";
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
  next.place = null;
  return next;
}
const card = (g: Game, cardId: string) =>
  toInPlay({ uid: g.nextUid++, cardId, finish: "plain" }, 1);

describe("Ksiądz proboszcz — Dobry pasterz (teamBonus)", () => {
  it("gives +30 to clerics, vicars and other parish priests, also from the bench", () => {
    for (const id of ["kleryk", "wikariusz", "proboszcz"]) {
      const g = myTurn();
      const a = card(g, id);
      g.players.me.active = a;
      const before = bonusDamage(g, "me", a);
      g.players.me.bench.push(card(g, "proboszcz"));
      expect(bonusDamage(g, "me", a) - before).toBe(30);
    }
  });

  it("does not boost the priest himself, other characters or the rival, and does not stack", () => {
    const g = myTurn();
    const priest = card(g, "proboszcz");
    g.players.me.active = priest;
    expect(bonusDamage(g, "me", priest)).toBe(0);
    const ministrant = card(g, "ministrant");
    g.players.me.active = ministrant;
    g.players.me.bench.push(priest);
    expect(bonusDamage(g, "me", ministrant)).toBe(0);
    const vicar = card(g, "wikariusz");
    g.players.me.active = vicar;
    g.players.me.bench.push(card(g, "proboszcz"));
    expect(bonusDamage(g, "me", vicar)).toBe(30);
    const foe = g.players.ai.active!;
    expect(bonusDamage(g, "ai", foe)).toBe(bonusDamage(myTurn(), "ai", foe));
  });
});
