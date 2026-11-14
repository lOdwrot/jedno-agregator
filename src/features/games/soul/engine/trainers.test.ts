import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { ALL_CARDS } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import { dispatch } from "./actions";
import { aiAction } from "./ai";
import { canPlaySupport } from "./support";
import { createGame, toInPlay, type DeckList, type Game, type PlayerId } from "./state";

const ai: DeckList = Object.entries(OPPONENTS[2]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

/** A game on `pid`'s turn 3, the player has a bench of two. */
function turnOf(pid: PlayerId, seed = 1): Game {
  let g = createGame(deckList(newProfile()), ai, seed);
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

describe("trainer cards", () => {
  it("no item just draws cards — drawing is the job of supporters", () => {
    for (const c of ALL_CARDS)
      if (c.kind === "item")
        expect(["draw", "drawUntil", "research"], c.id).not.toContain(c.effect.k);
  });

  it("Różaniec (Trekking Shoes): keep the top card…", () => {
    let g = turnOf("me");
    const r = give(g, "me", "rozaniec");
    const top = g.players.me.deck[0]!;
    const hand = g.players.me.hand.length;
    g = dispatch(g, { type: "support", uid: r.uid });
    expect(g.peek).toEqual({ pid: "me", uid: top.uid });
    // nothing else may happen until the choice is made
    expect(dispatch(g, { type: "endTurn" })).toBe(g);
    g = dispatch(g, { type: "peek", keep: true });
    expect(g.peek).toBeNull();
    expect(g.players.me.hand.map((c) => c.uid)).toContain(top.uid);
    expect(g.players.me.hand).toHaveLength(hand); // −Różaniec +top card
  });

  it("…or discard it and draw the next one", () => {
    let g = turnOf("me", 2);
    const r = give(g, "me", "rozaniec");
    const [top, second] = g.players.me.deck;
    g = dispatch(g, { type: "support", uid: r.uid });
    g = dispatch(g, { type: "peek", keep: false });
    expect(g.players.me.discard.map((c) => c.uid)).toContain(top!.uid);
    expect(g.players.me.hand.map((c) => c.uid)).toContain(second!.uid);
  });

  it("the computer answers its own Powiadomienie", () => {
    let g = turnOf("ai", 3);
    const pw = give(g, "ai", "powiadomienie");
    g = dispatch(g, { type: "support", uid: pw.uid });
    expect(g.peek?.pid).toBe("ai");
    expect(aiAction(g, "ai")?.type).toBe("peek");
    g = dispatch(g, aiAction(g, "ai")!);
    expect(g.peek).toBeNull();
  });

  it("Toksyczny szef (Boss's Orders) drags a benched character to the front", () => {
    let g = turnOf("ai", 4);
    const card = give(g, "ai", "szef");
    const t = g.players.me.bench[0]!;
    g = dispatch(g, { type: "support", uid: card.uid, target: t.uid });
    expect(g.players.me.active!.uid).toBe(t.uid);
    expect(g.flags.supporter).toBe(true);
  });

  it("Remont u sąsiada (Crushing Hammer): on heads discards grace from any chosen character", () => {
    const seen = new Set<boolean>();
    for (let seed = 1; seed < 40 && seen.size < 2; seed++) {
      const g = turnOf("ai", seed);
      const t = g.players.me.bench[1]!;
      t.energy = 2;
      const card = give(g, "ai", "remont");
      const n = dispatch(g, { type: "support", uid: card.uid, target: t.uid });
      const after = n.players.me.bench.find((b) => b.uid === t.uid)!.energy;
      expect([1, 2]).toContain(after);
      expect(n.players.ai.discard.map((c) => c.uid)).toContain(card.uid);
      seen.add(after === 1);
    }
    expect(seen.size).toBe(2);
  });

  it("Ciche dni may paralyze, Kompleksy shuffle the rival's hand away", () => {
    let g = turnOf("ai", 5);
    const k = give(g, "ai", "kompleksy");
    g.players.me.hand = g.players.me.hand.slice(0, 6);
    g = dispatch(g, { type: "support", uid: k.uid });
    expect(g.players.me.hand).toHaveLength(3);
    const c = give(g, "ai", "ciche-dni");
    expect(canPlaySupport(g, "ai", c)).toBe(true);
    g = dispatch(g, { type: "support", uid: c.uid });
    expect(g.players.ai.discard.map((x) => x.uid)).toContain(c.uid);
  });
});
