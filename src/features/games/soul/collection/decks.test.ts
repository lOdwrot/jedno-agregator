import { describe, expect, it } from "vitest";
import { DECK_SIZE } from "../data/cards";
import { deckList, deckSize, keyOf, newProfile, removeFromDeck, setEnergy } from "./profile";
import {
  activeDeckIndex,
  activeDeckName,
  clearActiveDeck,
  copyActiveDeck,
  DECK_SLOTS,
  deckSlots,
  renameDeck,
  switchDeck,
} from "./decks";

describe("Walka o duszę — several decks", () => {
  it("an older save's deck becomes Talia 1, the other slots are empty", () => {
    const p = newProfile();
    const slots = deckSlots(p);
    expect(slots).toHaveLength(DECK_SLOTS);
    expect(activeDeckIndex(p)).toBe(0);
    expect(activeDeckName(p)).toBe("Talia 1");
    expect(slots[0]!.deck).toEqual(p.deck);
    expect(slots[1]).toEqual({ name: "Talia 2", deck: [], energy: 0 });
  });

  it("switching keeps every deck's own cards", () => {
    let p = newProfile();
    const first = deckList(p);
    p = switchDeck(p, 1);
    expect(activeDeckIndex(p)).toBe(1);
    expect(deckSize(p)).toBe(0);
    p = setEnergy(p, 10);
    p = switchDeck(p, 0);
    expect(deckList(p)).toEqual(first);
    p = switchDeck(p, 1);
    expect(p.energy).toBe(10);
    expect(p.deck).toEqual([]);
  });

  it("the active slot survives a save + reload (JSON)", () => {
    const p = switchDeck(renameDeck(newProfile(), 2, "Papieże"), 2);
    const back = JSON.parse(JSON.stringify(p)) as typeof p;
    expect(activeDeckIndex(back)).toBe(2);
    expect(activeDeckName(back)).toBe("Papieże");
  });

  it("copies the active deck into another slot and edits stay separate", () => {
    let p = copyActiveDeck(newProfile(), 1);
    expect(deckSlots(p)[1]!.deck).toEqual(p.deck);
    p = removeFromDeck(p, keyOf("ministrant", "plain"));
    expect(deckSize(p)).toBe(DECK_SIZE - 1);
    expect(slotSizeOf(p, 1)).toBe(DECK_SIZE);
    p = clearActiveDeck(p);
    expect(deckSize(p)).toBe(0);
    expect(slotSizeOf(p, 1)).toBe(DECK_SIZE);
  });

  it("a blank name falls back to the default, long names are cut", () => {
    let p = renameDeck(newProfile(), 0, "   ");
    expect(activeDeckName(p)).toBe("Talia 1");
    p = renameDeck(p, 0, "x".repeat(60));
    expect(activeDeckName(p).length).toBeLessThanOrEqual(24);
  });
});

function slotSizeOf(p: ReturnType<typeof newProfile>, i: number) {
  const s = deckSlots(p)[i]!;
  return s.deck.length + s.energy;
}
