import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import { dispatch } from "./actions";
import { aiAction } from "./ai";
import { canUseAbility } from "./abilities";
import { canPlaySupport, councilPicks } from "./support";
import { createGame, toInPlay, type DeckList, type Game } from "./state";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

/** My turn 3 with an empty hand and an empty bench. */
function myTurn(): Game {
  let g = createGame(deckList(newProfile()), ai, 1);
  g = dispatch(g, aiAction(g, "me")!);
  const next = structuredClone(g);
  next.turn = "me";
  next.turnNo = 3;
  next.phase = "main";
  next.flags = { energy: false, supporter: false, retreated: false };
  next.players.me.hand = [];
  next.players.me.bench = [];
  return next;
}
function give(g: Game, cardId: string, zone: "hand" | "discard" = "hand") {
  const c = { uid: g.nextUid++, cardId, finish: "plain" as const };
  g.players.me[zone].push(c);
  return c;
}

describe("Przyspieszony Sobór Watykański", () => {
  it("needs grace and a pope in hand", () => {
    const g = myTurn();
    const sobor = give(g, "sobor");
    expect(canPlaySupport(g, "me", sobor)).toBe(false);
    give(g, "jp2");
    expect(canPlaySupport(g, "me", sobor)).toBe(false); // no grace
    give(g, "laska");
    expect(canPlaySupport(g, "me", sobor)).toBe(true);
  });

  it("discards one grace and benches the chosen pope straight from the hand", () => {
    const g = myTurn();
    const sobor = give(g, "sobor");
    give(g, "laska");
    give(g, "laska");
    give(g, "jp2");
    const piotr = give(g, "piotr");
    give(g, "kandydat"); // the candidate is not a pope
    expect(councilPicks(g, "me").map((c) => c.cardId)).toEqual(["jp2", "piotr"]);
    const after = dispatch(g, { type: "support", uid: sobor.uid, target: piotr.uid });
    const me = after.players.me;
    expect(me.bench.map((c) => c.cardId)).toEqual(["piotr"]);
    expect(me.hand.map((c) => c.cardId).sort()).toEqual(["jp2", "kandydat", "laska"]);
    expect(me.discard.map((c) => c.cardId).sort()).toEqual(["laska", "sobor"]);
  });

  it("rejects a target that is not a pope in hand, and a full bench", () => {
    const g = myTurn();
    const sobor = give(g, "sobor");
    give(g, "laska");
    const cand = give(g, "kandydat");
    give(g, "jp2");
    expect(dispatch(g, { type: "support", uid: sobor.uid, target: cand.uid })).toBe(g);
    expect(dispatch(g, { type: "support", uid: sobor.uid })).toBe(g);
    for (let i = 0; i < 3; i++) g.players.me.bench.push(toInPlay(give(g, "ministrant"), 1));
    g.players.me.hand = g.players.me.hand.filter((c) => c.cardId !== "ministrant");
    expect(canPlaySupport(g, "me", sobor)).toBe(false);
  });
});

describe("Franciszek: Drugie konklawe", () => {
  it("takes a papal candidate from the discard pile, only while active, once per turn", () => {
    const g = myTurn();
    const f = toInPlay(give(g, "franciszek"), 1);
    g.players.me.hand = [];
    g.players.me.bench.push(f);
    expect(canUseAbility(g, "me", f)).toBe(false); // nothing to take
    give(g, "kandydat", "discard");
    expect(canUseAbility(g, "me", f)).toBe(false); // on the bench
    g.players.me.bench = [g.players.me.active!];
    g.players.me.active = f;
    expect(canUseAbility(g, "me", f)).toBe(true);
    const after = dispatch(g, { type: "ability", target: f.uid });
    expect(after.players.me.hand.map((c) => c.cardId)).toEqual(["kandydat"]);
    expect(after.players.me.discard.some((c) => c.cardId === "kandydat")).toBe(false);
    give(after, "kandydat", "discard");
    expect(canUseAbility(after, "me", after.players.me.active!)).toBe(false);
  });
});
