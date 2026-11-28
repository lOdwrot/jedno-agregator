import { describe, expect, it } from "vitest";
import { getCard } from "./cards";
import { ALBUM_ORDER, ALBUM_SIZE, albumCardIds, cardNumber, cardNumberLabel } from "./numbers";

describe("card numbers", () => {
  it("lists every collectible card and tale saint exactly once", () => {
    expect(new Set(ALBUM_ORDER).size).toBe(ALBUM_ORDER.length);
    expect([...ALBUM_ORDER].sort()).toEqual(albumCardIds().sort());
  });

  it("numbers stay put: the first cards keep their numbers", () => {
    expect(cardNumber("ministrant")).toBe(1);
    expect(cardNumberLabel("ministrant")).toBe(`001/${ALBUM_SIZE}`);
  });

  it("demons and energy have no number", () => {
    expect(cardNumber("laska")).toBeNull();
    const demon = ALBUM_ORDER.find((id) => getCard(id).side === "demons");
    expect(demon).toBeUndefined();
    expect(cardNumber("pokusa")).toBeNull();
  });
});
