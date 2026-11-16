import { describe, expect, it } from "vitest";
import { DECK_SIZE, getCard, isBasic, MIN_BASICS } from "../data/cards";
import {
  addToDeck,
  BOOSTER_PRICE,
  canAddToDeck,
  deckProblems,
  deckSize,
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
  it("needs at least 5 basic characters in the deck", () => {
    const p = newProfile();
    const basics = p.deck.filter((k) => isBasic(getCard(k.split(":")[0]!)));
    expect(basics.length).toBeGreaterThanOrEqual(MIN_BASICS);
    // keep only 4 basics, fill the rest up with grace
    let n = 0;
    const deck = p.deck.filter((k) => !isBasic(getCard(k.split(":")[0]!)) || ++n <= 4);
    const thin = { ...p, deck, energy: p.energy + p.deck.length - deck.length };
    expect(deckProblems(thin)).toEqual([
      "Talia potrzebuje co najmniej 5 postaci podstawowych (teraz: 4).",
    ]);
  });

  it("migrates a saved 24-card profile to the 50-card rules", () => {
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
    expect(p.version).toBe(4);
    expect(deckProblems(p)).toEqual([]);
    expect(p.deck).toContain(keyOf("jp2", "gilded"));
    expect(p.collection[keyOf("profesor", "plain")]).toBe(1);
    expect(p.collection[keyOf("ministrant", "plain")]).toBe(3);
    expect(p.wins).toBe(3);
    expect(migrateProfile(p)).toBe(p);
  });

  it("migrates a 40-card profile: gives Ogłoszenia parafialne and fills up with grace", () => {
    const old = { ...newProfile(), version: 2 };
    old.deck = old.deck.filter((k) => !k.startsWith("ogloszenia") && !k.startsWith("ksiega"));
    delete old.collection[keyOf("ogloszenia", "plain")];
    delete old.collection[keyOf("ksiega", "plain")];
    old.energy = 40 - old.deck.length;
    const p = migrateProfile(old);
    expect(p.version).toBe(4);
    expect(p.collection[keyOf("ogloszenia", "plain")]).toBe(2);
    expect(p.deck.filter((k) => k === keyOf("ogloszenia", "plain"))).toHaveLength(2);
    expect(p.collection[keyOf("ksiega", "plain")]).toBe(1);
    expect(deckProblems(p)).toEqual([]);
  });

  it("migrates a version 3 profile: everyone gets 2 papal candidates, pope decks get them in place of grace", () => {
    const cand = keyOf("kandydat", "plain");
    const plain = { ...newProfile(), version: 3 };
    plain.deck = plain.deck.filter((k) => k !== cand);
    delete plain.collection[cand];
    plain.energy = DECK_SIZE - plain.deck.length;
    const a = migrateProfile(plain);
    expect(a.version).toBe(4);
    expect(a.collection[cand]).toBe(2);
    expect(a.deck).not.toContain(cand); // no popes in the deck — the deck stays as it was
    expect(a.energy).toBe(plain.energy);

    const popes = { ...plain, collection: { ...plain.collection, [keyOf("jp2", "gilded")]: 1 } };
    popes.deck = [...plain.deck, keyOf("jp2", "gilded")];
    popes.energy = DECK_SIZE - popes.deck.length;
    const b = migrateProfile(popes);
    expect(b.deck.filter((k) => k === cand)).toHaveLength(2);
    expect(b.energy).toBe(popes.energy - 2);
    expect(deckSize(b)).toBe(DECK_SIZE);
    expect(deckProblems(b)).toEqual([]);
    expect(migrateProfile(b)).toBe(b);
  });

  it("starter deck is legal, holds the papal candidate and a welcome booster is ready", () => {
    const p = newProfile();
    expect(deckProblems(p)).toEqual([]);
    expect(p.deck.filter((k) => k === keyOf("kandydat", "plain"))).toHaveLength(2);
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

describe("Walka o duszę — tutorial reward", () => {
  it("pays 150 talents only for the first finished tutorial", async () => {
    const { finishTutorial, newProfile, TUTORIAL_REWARD } = await import("./profile");
    const p = newProfile();
    const first = finishTutorial(p);
    expect(TUTORIAL_REWARD).toBe(150);
    expect(first.earned).toBe(150);
    expect(first.profile.talents).toBe(p.talents + 150);
    expect(first.profile.tutorial).toBe(true);
    const again = finishTutorial(first.profile);
    expect(again.earned).toBe(0);
    expect(again.profile).toBe(first.profile);
  });
});
