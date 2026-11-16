import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import { dispatch } from "./actions";
import { aiAction } from "./ai";
import { canPlaySupport, lockedBy } from "./support";
import { toInPlay, type DeckList, type Game, type PlayerId } from "./state";
import { startedGame } from "./testGame";

const ai: DeckList = Object.entries(OPPONENTS[2]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

/** Turn 3 of `pid`; the player has a bench of two ministrants. */
function turnOf(pid: PlayerId): Game {
  let g = startedGame(deckList(newProfile()), ai, 1);
  g = dispatch(g, aiAction(g, "me")!);
  const next = structuredClone(g);
  next.turn = pid;
  next.turnNo = 3;
  next.phase = "main";
  next.flags = { energy: false, supporter: false, retreated: false };
  for (const cardId of ["ministrant", "ministrant"])
    next.players.me.bench.push(toInPlay({ uid: next.nextUid++, cardId, finish: "plain" }, 1));
  return next;
}
function give(g: Game, pid: PlayerId, cardId: string) {
  const c = { uid: g.nextUid++, cardId, finish: "plain" as const };
  g.players[pid].hand.push(c);
  return c;
}
function setActive(g: Game, cardId: string) {
  g.players.me.active = toInPlay({ uid: g.nextUid++, cardId, finish: "plain" }, 1);
}

describe("lock popes", () => {
  it("Celestyn V blocks items for both players while active", () => {
    const g = turnOf("ai");
    g.players.me.bench[0]!.energy = 2;
    const remont = give(g, "ai", "remont");
    const szef = give(g, "ai", "szef");
    expect(canPlaySupport(g, "ai", remont)).toBe(true);
    setActive(g, "celestyn5");
    expect(lockedBy(g, "item")?.cardId).toBe("celestyn5");
    expect(canPlaySupport(g, "ai", remont)).toBe(false);
    expect(
      dispatch(g, { type: "support", uid: remont.uid, target: g.players.me.bench[0]!.uid }),
    ).toBe(g);
    // supporters are still fine
    expect(canPlaySupport(g, "ai", szef)).toBe(true);
    // the owner is locked too
    g.turn = "me";
    expect(canPlaySupport(g, "me", give(g, "me", "rozaniec"))).toBe(false);
  });

  it("Pius IX blocks supporters for both players while active", () => {
    const g = turnOf("ai");
    const szef = give(g, "ai", "szef");
    setActive(g, "pius9");
    expect(canPlaySupport(g, "ai", szef)).toBe(false);
    expect(
      dispatch(g, { type: "support", uid: szef.uid, target: g.players.me.bench[0]!.uid }),
    ).toBe(g);
    g.turn = "me";
    expect(canPlaySupport(g, "me", give(g, "me", "zbiorka"))).toBe(false);
  });

  it("the lock works only from the active spot", () => {
    const g = turnOf("ai");
    const szef = give(g, "ai", "szef");
    g.players.me.bench.push(toInPlay({ uid: g.nextUid++, cardId: "pius9", finish: "plain" }, 1));
    expect(lockedBy(g, "supporter")).toBeNull();
    expect(canPlaySupport(g, "ai", szef)).toBe(true);
  });

  it("a no-abilities place switches the lock off", () => {
    const g = turnOf("ai");
    const szef = give(g, "ai", "szef");
    setActive(g, "pius9");
    g.place = { cardId: "adoracja", owner: "me" };
    expect(lockedBy(g, "supporter")).toBeNull();
    expect(canPlaySupport(g, "ai", szef)).toBe(true);
  });
});
