import { describe, expect, it } from "vitest";
import { isCharacter } from "./cards";
import { DEMON_CARDS } from "./demons";
import { OPPONENTS } from "./opponents";
import { SLOTH_CARDS } from "./sloth";

const HARD = ["zastepy", "otchlan", "niepokonany"] as const;

describe("court of sloth (lenistwo)", () => {
  it("are sloth demons in the bestiary, each with a lesson", () => {
    for (const c of SLOTH_CARDS) {
      expect(DEMON_CARDS).toContain(c);
      expect(isCharacter(c) && c.element, c.id).toBe("lenistwo");
      expect("lesson" in c && c.lesson?.tempts && c.lesson.defend, c.id).toBeTruthy();
    }
  });

  it("are played only by the harder opponents, and every one of them is used", () => {
    const ids = SLOTH_CARDS.map((c) => c.id);
    for (const o of OPPONENTS) {
      const used = ids.filter((id) => o.deck[id]);
      if ((HARD as readonly string[]).includes(o.id)) expect(used.length, o.id).toBeGreaterThan(0);
      else expect(used, o.id).toEqual([]);
    }
    for (const id of ids)
      expect(
        OPPONENTS.some((o) => o.deck[id]),
        id,
      ).toBe(true);
  });

  it("every evolution in a deck comes with its previous stage", () => {
    for (const o of OPPONENTS)
      for (const c of SLOTH_CARDS)
        if (o.deck[c.id] && isCharacter(c) && c.evolvesFrom)
          expect(o.deck[c.evolvesFrom], `${o.id}: ${c.id}`).toBeGreaterThan(0);
  });
});
