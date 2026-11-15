import { describe, expect, it } from "vitest";
import { isPope } from "../collection/deckGroups";
import { PARISH_CARDS } from "./parish";
import { getCard, isBasic } from "./cards";

describe("popes", () => {
  const popes = PARISH_CARDS.filter(
    (c) => c.kind === "character" && c.rarity === "legendary" && isPope(c),
  );

  it("every pope evolves from the one papal candidate — none can be played straight from the hand", () => {
    expect(popes.length).toBeGreaterThanOrEqual(11);
    for (const p of popes) expect(p.kind === "character" && p.evolvesFrom, p.id).toBe("kandydat");
  });

  it("the candidate is a common basic character with its own attacks", () => {
    const c = getCard("kandydat");
    expect(isBasic(c)).toBe(true);
    expect(c.rarity).toBe("common");
    expect(c.kind === "character" && c.attacks.length).toBeGreaterThan(0);
  });
});
