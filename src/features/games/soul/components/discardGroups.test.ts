import { describe, expect, it } from "vitest";
import type { CardInst } from "../engine/state";
import { groupDiscard } from "./discardGroups";

const c = (uid: number, cardId: string, finish: CardInst["finish"] = "plain"): CardInst => ({
  uid,
  cardId,
  finish,
});

describe("groupDiscard", () => {
  it("lists the pile from the top and merges identical cards at their newest copy", () => {
    const pile = [c(1, "a"), c(2, "b"), c(3, "a"), c(4, "c"), c(5, "a"), c(6, "b")];
    expect(groupDiscard(pile).map((g) => [g.card.uid, g.card.cardId, g.count])).toEqual([
      [6, "b", 2],
      [5, "a", 3],
      [4, "c", 1],
    ]);
  });

  it("keeps different prints of the same card apart", () => {
    const pile = [c(1, "a"), c(2, "a", "gilded"), c(3, "a")];
    expect(groupDiscard(pile).map((g) => [g.card.finish, g.count])).toEqual([
      ["plain", 2],
      ["gilded", 1],
    ]);
  });

  it("is empty for an empty pile", () => {
    expect(groupDiscard([])).toEqual([]);
  });
});
