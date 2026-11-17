import { describe, expect, it } from "vitest";
import { COLLECTIBLE, ENERGY_ID, getCard } from "../data/cards";
import { deckStats, MAX_CARD_PROPS } from "./deckStats";

describe("deckStats", () => {
  it("counts copies by card name, merging finishes", () => {
    const deck = [
      { cardId: "kandydat", finish: "plain" as const },
      { cardId: "kandydat", finish: "gilded" as const },
      { cardId: ENERGY_ID.parish, finish: "plain" as const },
    ];
    expect(deckStats(deck)).toEqual({
      [getCard("kandydat").name]: 2,
      [getCard(ENERGY_ID.parish).name]: 1,
    });
  });

  it("keeps at most MAX_CARD_PROPS cards, most copies first", () => {
    const deck = COLLECTIBLE.slice(0, 60).map((c) => ({ cardId: c.id, finish: "plain" as const }));
    deck.push(
      { cardId: ENERGY_ID.parish, finish: "plain" },
      { cardId: ENERGY_ID.parish, finish: "plain" },
    );
    const stats = deckStats(deck);
    expect(Object.keys(stats).length).toBeLessThanOrEqual(MAX_CARD_PROPS);
    expect(stats[getCard(ENERGY_ID.parish).name]).toBe(2);
  });
});
