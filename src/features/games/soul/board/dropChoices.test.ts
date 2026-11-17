import { describe, expect, it } from "vitest";
import { dispatch } from "../engine/actions";
import { toInPlay } from "../engine/state";
import { dropChoices } from "./dropChoices";
import { dropsFor } from "./dnd";
import { give, myTurn } from "./mainTurn.fixture";

describe("dropChoices — a card dropped on the table instead of on a card", () => {
  it("offers every pope for the council (no drop target with two popes)", () => {
    const g = myTurn();
    const sobor = give(g, "sobor");
    give(g, "laska");
    const jp2 = give(g, "jp2");
    const piotr = give(g, "piotr");
    expect(dropsFor(g, sobor)).toEqual([]);
    const choices = dropChoices(g, sobor);
    expect(choices.map((c) => c.card.uid)).toEqual([jp2.uid, piotr.uid]);
    const after = dispatch(g, choices[1]!.action);
    expect(after.players.me.bench.map((c) => c.cardId)).toEqual(["piotr"]);
  });

  it("offers the rival's benched demons for the retreat invitation", () => {
    const g = myTurn();
    const inv = give(g, "rekolekcje");
    const opp = g.players.ai;
    opp.bench = [toInPlay({ uid: g.nextUid++, cardId: opp.active!.cardId, finish: "plain" }, 1)];
    const choices = dropChoices(g, inv);
    expect(choices.map((c) => c.card.uid)).toEqual([opp.bench[0]!.uid]);
    expect(choices[0]!.note).toMatch(/^ławka rywala/);
    const after = dispatch(g, choices[0]!.action);
    expect(after.players.ai.active!.uid).toBe(opp.bench[0]!.uid);
  });

  it("offers nothing for cards that need no target", () => {
    const g = myTurn();
    const basic = give(g, "kandydat");
    expect(dropChoices(g, basic)).toEqual([]);
  });

  it("offers own characters for an energy card", () => {
    const g = myTurn();
    const grace = give(g, "laska");
    expect(dropChoices(g, grace).map((c) => c.card.uid)).toEqual([g.players.me.active!.uid]);
  });
});
