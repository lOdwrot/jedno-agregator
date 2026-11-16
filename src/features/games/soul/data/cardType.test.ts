import { describe, expect, it } from "vitest";
import { ALL_CARDS, getCard, POPE_CANDIDATE } from "./cards";
import { CARD_TYPE_INFO, cardType, cardTypeBadge } from "./cardType";

describe("cardType", () => {
  it("tells basics from evolution stages", () => {
    expect(cardType(getCard(POPE_CANDIDATE))).toBe("basic");
    const pope = ALL_CARDS.find((c) => c.kind === "character" && c.evolvesFrom === POPE_CANDIDATE)!;
    expect(cardType(pope)).toBe("stage1");
    const stage2 = ALL_CARDS.find(
      (c) => c.kind === "character" && c.evolvesFrom && cardType(getCard(c.evolvesFrom)) === "stage1",
    )!;
    expect(cardType(stage2)).toBe("stage2");
  });

  it("gives every card a type icon", () => {
    for (const c of ALL_CARDS) expect(cardTypeBadge(c).icon).toBeTruthy();
    const kinds = new Set(ALL_CARDS.map(cardType));
    expect([...kinds].sort()).toEqual(Object.keys(CARD_TYPE_INFO).sort());
  });

  it("energy shows its side's symbol", () => {
    expect(cardTypeBadge(getCard("laska")).icon).toBe("✨");
    expect(cardTypeBadge(getCard("pokusa")).icon).toBe("🔥");
  });
});
