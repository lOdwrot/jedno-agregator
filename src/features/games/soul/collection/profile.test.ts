import { describe, expect, it } from "vitest";
import { getCard } from "../data/cards";
import {
  addToDeck,
  BOOSTER_PRICE,
  canAddToDeck,
  deckProblems,
  donateSpares,
  finishDuel,
  keyOf,
  migrateProfile,
  newProfile,
  openBooster,
  removeFromDeck,
  reward,
  rollBooster,
  setEnergy,
} from "./profile";
import { createRng } from "../../useGameLoop";

describe("Walka o duszę — collection", () => {
  it("migrates a saved 24-card profile to the 40-card rules", () => {
    const old = {
      version: 1,
      talents: 50,
      packs: 0,
      collection: { [keyOf("ministrant", "plain")]: 2, [keyOf("jp2", "gilded")]: 1 },
      deck: [keyOf("ministrant", "plain"), keyOf("ministrant", "plain"), keyOf("jp2", "gilded")],
      energy: 21,
      wins: 3,
      losses: 1,
      beaten: ["kanapa"],
    };
    const p = migrateProfile(old);
    expect(p.version).toBe(2);
    expect(deckProblems(p)).toEqual([]);
    expect(p.deck).toContain(keyOf("jp2", "gilded"));
    expect(p.collection[keyOf("profesor", "plain")]).toBe(1);
    expect(p.collection[keyOf("ministrant", "plain")]).toBe(3);
    expect(p.wins).toBe(3);
    expect(migrateProfile(p)).toBe(p);
  });

  it("starter deck is legal and a welcome booster is ready", () => {
    const p = newProfile();
    expect(deckProblems(p)).toEqual([]);
    expect(p.packs).toBe(1);
    expect(p.talents).toBe(BOOSTER_PRICE);
  });

  it("booster has 5 cards with a guaranteed rare-or-better last slot", () => {
    const rnd = createRng(42);
    for (let i = 0; i < 50; i++) {
      const b = rollBooster(rnd);
      expect(b).toHaveLength(5);
      const last = getCard(b[4]!.split(":")[0]!);
      expect(["rare", "legendary"]).toContain(last.rarity);
      expect(b.every((k) => getCard(k.split(":")[0]!).kind !== "energy")).toBe(true);
    }
  });

  it("opening costs talents and one pack; finishing a duel grants both", () => {
    let p = newProfile();
    p = openBooster(p, rollBooster(createRng(1)));
    expect(p.packs).toBe(0);
    expect(p.talents).toBe(0);
    expect(openBooster(p, rollBooster())).toBe(p);
    p = finishDuel(p, "kanapa", true, reward({ win: 100, loss: 30 }, true, 4));
    expect(p.talents).toBe(140);
    expect(p.packs).toBe(1);
    expect(p.beaten).toEqual(["kanapa"]);
  });

  it("deck limits: 40 cards, max 3 copies, only owned prints", () => {
    let p = newProfile();
    const k = keyOf("ministrant", "plain");
    expect(canAddToDeck(p, k)).toBe(false); // deck full
    p = setEnergy(p, p.energy - 1);
    expect(canAddToDeck(p, k)).toBe(false); // already 2 copies
    p = removeFromDeck(p, k);
    expect(canAddToDeck(p, k)).toBe(true);
    p = addToDeck(p, k);
    expect(deckProblems(p)).toHaveLength(1); // 23 cards
    expect(canAddToDeck(p, keyOf("jp2", "plain"))).toBe(false); // not owned
  });

  it("spare copies above three are donated for talents", () => {
    const p = { ...newProfile(), collection: { [keyOf("jp2", "stained")]: 5 } };
    const { profile, gained } = donateSpares(p);
    expect(gained).toBe(120);
    expect(profile.collection[keyOf("jp2", "stained")]).toBe(3);
  });
});
