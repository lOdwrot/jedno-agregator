import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { getCard } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import type { CharacterDef } from "../data/types";
import { benchEnergyTargets, dispatch } from "./actions";
import { aiAction } from "./ai";
import { toInPlay, type DeckList, type Game } from "./state";
import { startedGame } from "./testGame";

const ai: DeckList = Object.entries(OPPONENTS[2]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);
const ATTACKER = "animator";
const atk = (getCard(ATTACKER) as CharacterDef).attacks[0]!;

/** My turn 3, an active with a "searchEnergy" attack ready, two benched characters. */
function setup(): Game {
  let g = startedGame(deckList(newProfile()), ai, 3);
  g = dispatch(g, aiAction(g, "me")!);
  const n = structuredClone(g);
  n.turn = "me";
  n.turnNo = 3;
  n.phase = "main";
  n.flags = { energy: false, supporter: false, retreated: false };
  const me = n.players.me;
  me.active = {
    ...toInPlay({ uid: n.nextUid++, cardId: ATTACKER, finish: "plain" }, 1),
    energy: 3,
  };
  me.bench = ["ministrant", "ministrant"].map((cardId) =>
    toInPlay({ uid: n.nextUid++, cardId, finish: "plain" }, 1),
  );
  me.bench[0]!.energy = 0;
  me.bench[1]!.energy = 2;
  me.deck.push({ uid: n.nextUid++, cardId: "laska", finish: "plain" });
  return n;
}

describe("searchEnergy attack target", () => {
  it("offers a choice only with more than one benched character", () => {
    const g = setup();
    expect(atk.effects?.some((e) => e.k === "searchEnergy")).toBe(true);
    expect(benchEnergyTargets(g, "me", atk)).toHaveLength(2);
    g.players.me.bench.pop();
    expect(benchEnergyTargets(g, "me", atk)).toHaveLength(0);
  });

  it("gives the energy to the chosen benched character", () => {
    const g = setup();
    const pick = g.players.me.bench[1]!.uid;
    const next = dispatch(g, { type: "attack", index: 0, target: pick });
    expect(next).not.toBe(g);
    const b = [...next.players.me.bench, next.players.me.active!].find((c) => c.uid === pick);
    expect(b?.energy).toBe(3);
  });

  it("defaults to the one with the fewest energy and rejects a foreign target", () => {
    const g = setup();
    const low = g.players.me.bench[0]!.uid;
    const next = dispatch(g, { type: "attack", index: 0 });
    expect(next.players.me.bench.find((c) => c.uid === low)?.energy).toBe(1);
    expect(dispatch(g, { type: "attack", index: 0, target: g.players.me.active!.uid })).toBe(g);
  });
});
