import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { ALL_CARDS, isBlessed } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import { dispatch } from "./actions";
import { aiAction } from "./ai";
import { resolveKOs } from "./combat";
import { hpLeft, maxHp, toInPlay, type DeckList, type Game } from "./state";
import { startedGame } from "./testGame";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

let uid = 9000;
const card = (cardId: string) => toInPlay({ uid: uid++, cardId, finish: "plain" }, 1);

/** A table with Popiełuszko active and the given cards on my bench. */
function table(...bench: string[]): Game {
  const g = startedGame(deckList(newProfile()), ai, 1);
  g.place = null;
  g.players.me.active = card("popieluszko");
  g.players.me.bench = bench.map(card);
  return g;
}

describe("Bł. ks. Jerzy Popiełuszko — Solidarność (blessedHp)", () => {
  it("knows exactly the blessed cards", () => {
    expect(ALL_CARDS.filter(isBlessed).map((c) => c.id)).toEqual(
      expect.arrayContaining(["dorota", "komorowski", "popieluszko", "innocenty11", "pius9"]),
    );
    expect(ALL_CARDS.filter(isBlessed).every((c) => c.name.startsWith("Bł. "))).toBe(true);
  });

  it("gets +20 max HP for every other blessed character on the owner's table", () => {
    const g = table();
    const base = maxHp(g, g.players.me.active!);
    expect(base).toBe(100);
    g.players.me.bench = ["dorota", "ministrant", "komorowski"].map(card);
    expect(maxHp(g, g.players.me.active!)).toBe(140);
    // a second Popiełuszko is another blessed card too
    g.players.me.bench.push(card("popieluszko"));
    expect(maxHp(g, g.players.me.active!)).toBe(160);
  });

  it("does not count the opponent's characters and is switched off by a no-abilities place", () => {
    const g = table("dorota");
    g.players.ai.bench.push(card("komorowski"));
    expect(maxHp(g, g.players.me.active!)).toBe(120);
    g.place = { cardId: "adoracja", owner: "ai" };
    expect(maxHp(g, g.players.me.active!)).toBe(100);
  });

  it("is knocked out when a blessed friend leaves and the damage exceeds the lower max HP", () => {
    const g = table("dorota");
    const pop = g.players.me.active!;
    const dorota = g.players.me.bench[0]!;
    pop.damage = 110;
    expect(hpLeft(g, pop)).toBe(10);
    dorota.damage = 999;
    resolveKOs(g);
    expect(g.players.me.active).toBeNull();
    expect(g.players.me.bench).toHaveLength(0);
  });

  it("falls at once when a place blocking abilities is played — the rival takes a soul", () => {
    let g = startedGame(deckList(newProfile()), ai, 1);
    g = dispatch(g, aiAction(g, "me")!);
    g = structuredClone(g);
    Object.assign(g, { turn: "me", turnNo: 3, phase: "main", place: null });
    g.flags = { energy: false, supporter: false, retreated: false };
    const me = g.players.me;
    me.active = card("popieluszko");
    me.bench = [card("dorota"), card("ministrant")];
    me.active.damage = 110; // 10 left of 120
    me.hand = [{ uid: uid++, cardId: "adoracja", finish: "plain" }];
    const souls = g.players.ai.souls;
    const next = dispatch(g, { type: "support", uid: me.hand[0]!.uid });
    expect(next).not.toBe(g);
    expect(next.players.me.active).toBeNull();
    expect(next.players.ai.souls).toBe(souls + 1);
    expect(next.phase).toBe("promote");
    expect(next.promote).toEqual({ who: "me", then: "continue" });
    // after the pick the turn goes on
    const after = dispatch(next, { type: "promote", uid: next.players.me.bench[0]!.uid });
    expect(after.phase).toBe("main");
    expect(after.turn).toBe("me");
    expect(after.turnNo).toBe(3);
  });
});
