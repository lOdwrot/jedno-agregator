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

  it("Papieże wieków always brings Kandydat na papieża, often gilded or stained", () => {
    const rnd = createRng(5);
    const pack = PACKS.find((p) => p.id === "papieze")!;
    const finishes = { plain: 0, gilded: 0, stained: 0 };
    for (let i = 0; i < 1000; i++) {
      const { cardId, finish } = parseKey(rollPack(pack, rnd)[0]!);
      expect(cardId).toBe("kandydat");
      finishes[finish]++;
    }
    expect(finishes.stained).toBeGreaterThan(100);
    expect(finishes.gilded).toBeGreaterThan(250);
    expect(finishes.plain).toBeGreaterThan(400);
  });

  it("Kandydat na papieża can come gilded and stained from the other packs too", () => {
    const rnd = createRng(21);
    const pack = PACKS.find((p) => p.id === "witraze")!;
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++)
      for (const k of rollPack(pack, rnd)) if (k.startsWith("kandydat:")) seen.add(k);
    expect(seen).toEqual(new Set(["kandydat:plain", "kandydat:gilded", "kandydat:stained"]));
  });

  it("Przyspieszony Sobór Watykański is a very rare legendary pull", () => {
    const rnd = createRng(31);
    const pack = PACKS.find((p) => p.id === "skarbiec")!;
    let sobor = 0;
    const n = 4000;
    for (let i = 0; i < n; i++) if (rollPack(pack, rnd)[4]!.startsWith("sobor:")) sobor++;
    // 14 legendary cards, the council weighs 0.4 — about 3% even with a guaranteed legendary
    expect(sobor).toBeGreaterThan(0);
    expect(sobor / n).toBeLessThan(0.05);
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

  it("Rozeta Pelplińska costs 6000 and gives only stained glass with a legendary card", () => {
    const rnd = createRng(19);
    const pack = PACKS.find((p) => p.id === "rozeta")!;
    expect(pack.price).toBe(6000);
    for (let i = 0; i < 300; i++) {
      const cards = rollPack(pack, rnd);
      expect(cards.every((k) => k.endsWith(":stained"))).toBe(true);
      expect(cards.some((k) => rarityOf(k) === "legendary")).toBe(true);
    }
  });

  it("Zakrystia i sanktuaria gives only items and places", () => {
    const rnd = createRng(17);
    const pack = PACKS.find((p) => p.id === "zakrystia")!;
    const kinds = new Set<string>();
    for (let i = 0; i < 300; i++)
      for (const k of rollPack(pack, rnd)) kinds.add(getCard(parseKey(k).cardId).kind);
    expect([...kinds].sort()).toEqual(["item", "place"]);
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
