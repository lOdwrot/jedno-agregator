import { describe, expect, it } from "vitest";
import { ALBUM_SIZE } from "../data/numbers";
import { albumEntries, albumTally } from "./album";
import { keyOf, newProfile } from "./profile";

describe("album", () => {
  it("lists every numbered card in order, missing ones without a print", () => {
    const e = albumEntries(newProfile());
    expect(e).toHaveLength(ALBUM_SIZE);
    expect(e.map((x) => x.number)).toEqual(e.map((_, i) => i + 1));
    expect(e.find((x) => x.cardId === "bernadetta")?.best).toBeNull();
  });

  it("stacks the prints of a card under the rarest one", () => {
    const p = newProfile();
    p.collection[keyOf("lektor", "gilded")] = 1;
    p.collection[keyOf("lektor", "stained")] = 2;
    const lektor = albumEntries(p).find((x) => x.cardId === "lektor")!;
    expect(lektor.best).toBe("stained");
    expect(lektor.finishes).toEqual(["stained", "gilded", "plain"]);
    expect(lektor.total).toBe(6);
    const t = albumTally(albumEntries(p));
    expect(t).toMatchObject({ gilded: 1, stained: 1, total: ALBUM_SIZE });
    expect(t.owned).toBeGreaterThan(10);
  });
});
