import { describe, expect, it } from "vitest";
import { groupDeckKeys } from "./deckGroups";
import type { CardKey } from "./profile";

describe("groupDeckKeys", () => {
  it("splits cards into sections in a fixed order", () => {
    const groups = groupDeckKeys([
      "woda:plain",
      "katechetka:plain",
      "leon1:plain",
      "kleryk:plain",
    ] as CardKey[]);
    expect(groups.map((g) => g.id)).toEqual(["popes", "characters", "supporters", "items"]);
    expect(groups[0]!.stacks).toEqual([["leon1:plain"]]);
  });

  it("stacks an evolution line from the lowest stage down, finishes kept together", () => {
    const groups = groupDeckKeys([
      "proboszcz:plain",
      "kleryk:gilded",
      "wikariusz:plain",
      "kleryk:plain",
      "oazowicz:plain",
    ] as CardKey[]);
    const chars = groups.find((g) => g.id === "characters")!;
    expect(chars.stacks).toEqual([
      ["kleryk:plain", "kleryk:gilded", "wikariusz:plain", "proboszcz:plain"],
      ["oazowicz:plain"],
    ]);
  });

  it("starts a line at an evolution whose earlier stage is not owned", () => {
    const groups = groupDeckKeys(["proboszcz:plain", "wikariusz:plain"] as CardKey[]);
    expect(groups[0]!.stacks).toEqual([["wikariusz:plain", "proboszcz:plain"]]);
  });
});
