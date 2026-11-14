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

  it("Skarbiec Katedry guarantees a rare and a legendary card", () => {
    const rnd = createRng(9);
    const pack = PACKS.find((p) => p.id === "skarbiec")!;
    expect(pack.price).toBe(1000);
    let special = 0;
    for (let i = 0; i < 200; i++) {
      const cards = rollPack(pack, rnd);
      expect(rarityOf(cards[3]!)).toBe("rare");
      expect(rarityOf(cards[4]!)).toBe("legendary");
      special += cards.filter((k) => !k.endsWith(":plain")).length;
    }
    expect(special / 1000).toBeGreaterThan(0.35);
  });

  it("Witraże Katedry is pricey and always has at least 2 stained-glass cards", () => {
    const rnd = createRng(11);
    const pack = PACKS.find((p) => p.id === "witraze")!;
    expect(pack.price).toBeGreaterThan(PACKS.find((p) => p.id === "papieze")!.price);
    let extra = 0;
    for (let i = 0; i < 300; i++) {
      const stained = rollPack(pack, rnd).filter((k) => k.endsWith(":stained")).length;
      expect(stained).toBeGreaterThanOrEqual(2);
      if (stained > 2) extra++;
    }
    expect(extra).toBeGreaterThan(0);
  });

  it("other packs have no stained-glass guarantee", () => {
    const rnd = createRng(13);
    const pack = PACKS.find((p) => p.id === "wspolnota")!;
    let none = 0;
    for (let i = 0; i < 100; i++)
      if (!rollPack(pack, rnd).some((k) => k.endsWith(":stained"))) none++;
    expect(none).toBeGreaterThan(50);
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
