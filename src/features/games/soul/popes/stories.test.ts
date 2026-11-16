import { describe, expect, it } from "vitest";
import { isPope } from "../collection/deckGroups";
import { getCard } from "../data/cards";
import { PARISH_CARDS } from "../data/parish";
import { POPE_STORIES } from "./stories";

describe("pope stories", () => {
  const popes = PARISH_CARDS.filter((c) => c.rarity === "legendary" && isPope(c));

  it("every pope card has a story, and every story belongs to a pope card", () => {
    expect(POPE_STORIES.map((s) => s.id).sort()).toEqual(popes.map((p) => p.id).sort());
    for (const s of POPE_STORIES) expect(isPope(getCard(s.id)), s.id).toBe(true);
  });

  it("is told in order on the timeline, with enough to read", () => {
    const years = POPE_STORIES.map((s) => s.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    const numbers = POPE_STORIES.map((s) => s.number);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    for (const s of POPE_STORIES) {
      expect(s.facts.length, s.id).toBeGreaterThanOrEqual(4);
      expect(s.today.length, s.id).toBeGreaterThan(40);
    }
  });
});
