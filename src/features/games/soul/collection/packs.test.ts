import { describe, expect, it } from "vitest";
import { createRng } from "../../useGameLoop";
import { getCard } from "../data/cards";
import { parseKey } from "./profile";
import { PACKS, rollPack } from "./packs";

const rarityOf = (k: string) => getCard(parseKey(k as `${string}:plain`).cardId).rarity;

describe("booster editions", () => {
  it.each(PACKS.map((p) => [p.id, p] as const))(
    "%s: 5 cards, best slot last, no energy",
    (_, pack) => {
      const rnd = createRng(7);
      for (let i = 0; i < 100; i++) {
        const cards = rollPack(pack, rnd);
        expect(cards).toHaveLength(5);
        expect(["rare", "legendary"]).toContain(rarityOf(cards[4]!));
        expect(cards.every((k) => getCard(parseKey(k).cardId).kind !== "energy")).toBe(true);
      }
    },
  );

  it("the popes' pack gives a legendary card much more often", () => {
    const count = (id: string) => {
      const rnd = createRng(3);
      const pack = PACKS.find((p) => p.id === id)!;
      let n = 0;
      for (let i = 0; i < 400; i++) if (rarityOf(rollPack(pack, rnd)[4]!) === "legendary") n++;
      return n;
    };
    expect(count("papieze")).toBeGreaterThan(count("wspolnota") * 1.5);
  });

  it("the saints' pack favours saints in the rare slot", () => {
    const rnd = createRng(5);
    const pack = PACKS.find((p) => p.id === "swieci")!;
    let saints = 0;
    for (let i = 0; i < 300; i++) {
      const id = parseKey(rollPack(pack, rnd)[4]!).cardId;
      if (["wojciech", "dorota", "komorowski", "popieluszko"].includes(id)) saints++;
    }
    expect(saints).toBeGreaterThan(120);
  });
});
