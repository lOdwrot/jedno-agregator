import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { createGame, type DeckList } from "../engine/state";
import { ABYSS_CARDS } from "./abyss";
import { DECK_SIZE, getCard, isCharacter } from "./cards";
import { DEMON_CARDS } from "./demons";
import { OPPONENTS } from "./opponents";

const o = OPPONENTS.find((x) => x.id === "niepokonany")!;
const deck = (): DeckList =>
  Object.entries(o.deck).flatMap(([cardId, n]) =>
    Array.from({ length: n }, () => ({ cardId, finish: o.finish ?? "plain" })),
  );

describe("Niepokonany (Tron Bestii)", () => {
  it("is the last and hardest opponent, with the infernal board", () => {
    expect(OPPONENTS.at(-1)).toBe(o);
    expect(o.difficulty).toBe("niepokonany");
    expect(o.theme).toBe("infernal");
    expect(o.finish).toBe("stained");
    const otchlan = OPPONENTS.find((x) => x.id === "otchlan")!;
    expect(o.boost!.startEnergy).toBeGreaterThan(otchlan.boost!.startEnergy);
    expect(o.reward.win).toBeGreaterThan(otchlan.reward.win);
  });

  it("plays every new apocalyptic card and all of them are in the bestiary with a lesson", () => {
    for (const c of ABYSS_CARDS) {
      expect(o.deck[c.id], c.id).toBeGreaterThan(0);
      expect(DEMON_CARDS).toContain(c);
      expect("lesson" in c && c.lesson?.tempts && c.lesson.defend, c.id).toBeTruthy();
    }
    expect(Object.values(o.deck).reduce((a, b) => a + b, 0)).toBe(DECK_SIZE);
    for (const id of Object.keys(o.deck)) expect(getCard(id).side).toBe("demons");
  });

  it("starts with 3 energy on a stained (stronger) active", () => {
    const g = createGame(deckList(newProfile()), deck(), 11, o.boost);
    const a = g.players.ai.active!;
    expect(a.energy).toBe(3);
    expect(a.finish).toBe("stained");
    const def = getCard(a.cardId);
    expect(isCharacter(def) && def.hp >= 60).toBe(true);
  });
});
