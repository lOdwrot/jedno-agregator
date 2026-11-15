import { describe, expect, it } from "vitest";
import { getCard } from "../data/cards";
import {
  BESTIARY_CARDS,
  duelDiscoveries,
  bestiaryGroups,
  bestiaryTally,
  isRecognized,
  RECOGNIZE_AT,
  recordSighting,
  sightings,
} from "./bestiary";
import { newProfile } from "./profile";

describe("bestiary", () => {
  const demon = BESTIARY_CARDS.find((c) => c.kind === "character")!;

  it("starts empty: nothing met, nothing listed", () => {
    const groups = bestiaryGroups(newProfile());
    expect(groups.every((g) => g.cards.length === 0)).toBe(true);
    expect(bestiaryTally(groups)).toEqual({
      total: BESTIARY_CARDS.length,
      met: 0,
      recognized: 0,
    });
  });

  it("lists a card after the first sighting and recognizes it after RECOGNIZE_AT", () => {
    let p = recordSighting(newProfile(), demon.id);
    let g = bestiaryGroups(p).find((x) => x.kind === "character")!;
    expect(g.cards).toEqual([{ card: demon, seen: 1, recognized: false }]);
    expect(g.met).toBe(1);
    expect(g.recognized).toBe(0);
    for (let i = 1; i < RECOGNIZE_AT; i++) p = recordSighting(p, demon.id);
    expect(isRecognized(p, demon.id)).toBe(true);
    g = bestiaryGroups(p).find((x) => x.kind === "character")!;
    expect(g.recognized).toBe(1);
  });

  it("ignores parish cards and energy", () => {
    const p = recordSighting(recordSighting(newProfile(), "ministrant"), "pokusa");
    expect(p.bestiary).toBeUndefined();
    expect(getCard("pokusa").kind).toBe("energy");
    expect(sightings(p, "ministrant")).toBe(0);
  });

  it("groups cover every bestiary card exactly once", () => {
    const total = bestiaryGroups(newProfile()).reduce((s, g) => s + g.total, 0);
    expect(total).toBe(BESTIARY_CARDS.length);
  });
});

describe("duelDiscoveries", () => {
  const [a, b, c, d] = BESTIARY_CARDS.map((x) => x.id);

  it("splits the duel's sightings into newly recognized and first met cards", () => {
    const before = { [a!]: 3, [b!]: 1, [d!]: RECOGNIZE_AT };
    const during = { [a!]: 1, [b!]: 1, [c!]: 2, [d!]: 3, ministrant: 2 };
    expect(duelDiscoveries(before, during)).toEqual({ recognized: [a], met: [c] });
  });

  it("a card met and recognized in one duel is listed only as recognized", () => {
    expect(duelDiscoveries(undefined, { [a!]: RECOGNIZE_AT })).toEqual({
      recognized: [a],
      met: [],
    });
  });
});
