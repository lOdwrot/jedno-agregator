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

  it("its apocalyptic characters outclass the arch-demons of Otchłań", () => {
    const arch = ["lucyfer", "abaddon", "acedia"].map(getCard).filter(isCharacter);
    const top = (c: (typeof arch)[number]) => Math.max(...c.attacks.map((a) => a.damage));
    const archHp = Math.min(...arch.map((c) => c.hp));
    for (const c of ABYSS_CARDS.filter(isCharacter)) {
      expect(c.hp, c.id).toBeGreaterThanOrEqual(180);
      if (c.attacks.length > 1) expect(top(c), c.id).toBeGreaterThanOrEqual(130);
    }
    expect(Math.max(...ABYSS_CARDS.filter(isCharacter).map((c) => c.hp))).toBeGreaterThan(archHp);
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

describe("Duch tego świata — weakness off, even from the bench", () => {
  it("cancels the weakness of every demon while it is in play", async () => {
    const { toInPlay } = await import("../engine/state");
    const { applyDefense } = await import("../engine/combat");
    const g = createGame(deckList(newProfile()), deck(), 3, o.boost);
    const bestia = toInPlay({ uid: 9001, cardId: "bestia", finish: "plain" }, 0); // weak to modlitwa
    const prayer = toInPlay({ uid: 9002, cardId: "scholanka", finish: "plain" }, 0); // modlitwa
    g.players.ai.active = bestia;
    g.players.ai.bench = [];
    g.players.me.active = prayer;
    expect(applyDefense(g, "ai", prayer, bestia, 40)).toBe(80);
    g.players.ai.bench = [toInPlay({ uid: 9003, cardId: "duch-swiata", finish: "plain" }, 0)];
    expect(applyDefense(g, "ai", prayer, bestia, 40)).toBe(40);
    // the parish keeps its own weaknesses
    const zlosnik = toInPlay({ uid: 9004, cardId: "zlosnik", finish: "plain" }, 0); // gniew
    const scholanka = toInPlay({ uid: 9005, cardId: "scholanka", finish: "plain" }, 0);
    g.players.me.active = scholanka;
    expect(applyDefense(g, "me", zlosnik, scholanka, 40)).toBe(80);
  });

  it("the computer benches team helpers (Duch, Jeździec) before big hitters", async () => {
    const { bestBenchBasic } = await import("../engine/state");
    const hand = ["bestia", "duch-swiata", "lucyfer"].map((cardId, i) => ({
      uid: 100 + i,
      cardId,
      finish: "plain" as const,
    }));
    expect(bestBenchBasic(hand)?.cardId).toBe("duch-swiata");
  });
});
