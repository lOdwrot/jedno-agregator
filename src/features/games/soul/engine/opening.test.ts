import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { getCard, HAND_START, isBasic } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import { actorOf, dispatch, dispatchFrames } from "./actions";
import { createGame, dealHand, type DeckList, type Game } from "./state";

const opp = (i = 0): DeckList =>
  Object.entries(OPPONENTS[i]!.deck).flatMap(([cardId, n]) =>
    Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
  );
const hasBasic = (g: Game, pid: "me" | "ai") =>
  g.players[pid].hand.some((c) => isBasic(getCard(c.cardId)));

describe("opening of a duel", () => {
  it("deals a hand with a basic, waits for the player and nothing is on the table yet", () => {
    for (let seed = 1; seed < 40; seed++) {
      const g = createGame(deckList(newProfile()), opp(), seed);
      expect(g.phase).toBe("opening");
      expect(hasBasic(g, "me")).toBe(true);
      expect(g.players.ai.active).toBeNull();
      expect(g.opening).toEqual({
        ready: { me: false, ai: true },
        redrawn: { me: false, ai: false },
      });
      expect(dispatch(g, { type: "chooseActive", uid: g.players.me.hand[0]!.uid })).toBe(g);
    }
  });

  it("allows one redraw that keeps the deck size and always brings a basic", () => {
    for (let seed = 1; seed < 40; seed++) {
      const g0 = createGame(deckList(newProfile()), opp(), seed);
      const total = (g: Game) => g.players.me.hand.length + g.players.me.deck.length;
      const { state: g, frames } = dispatchFrames(g0, { type: "redraw" });
      expect(g).not.toBe(g0);
      expect(g.players.me.hand).toHaveLength(HAND_START);
      expect(total(g)).toBe(total(g0));
      expect(g.players.me.prizes).toEqual(g0.players.me.prizes);
      expect(hasBasic(g, "me")).toBe(true);
      expect(frames.map((f) => f.ev.t)).toEqual(["shuffle", "draw"]);
      // only once
      expect(dispatch(g, { type: "redraw" })).toBe(g);
    }
  });

  it("throws the coin when the hand is kept: the winner sets up first", () => {
    const firsts = new Set<string>();
    for (let seed = 1; seed < 30; seed++) {
      const g0 = createGame(deckList(newProfile()), opp(), seed);
      const { state: g, frames } = dispatchFrames(g0, { type: "ready" });
      const toss = frames.find((f) => f.ev.t === "opening")!.ev;
      expect(toss).toEqual({ t: "opening", pid: g.first, heads: g.first === "me" });
      expect(g.phase).toBe("setup");
      firsts.add(g.first);
      expect(dispatch(g, { type: "redraw" })).toBe(g);
      // the computer won the toss: it is already set up; otherwise it sets up after the player
      expect(!!g.players.ai.active).toBe(g.first === "ai");
      expect(g.log.at(-2)).toMatch(g.first === "me" ? /idziesz pierwszy/ : /Ty idziesz drugi/);
      const basic = g.players.me.hand.find((c) => isBasic(getCard(c.cardId)))!;
      expect(actorOf(g, { type: "chooseActive", uid: basic.uid })).toBe("me");
      const next = dispatch(g, { type: "chooseActive", uid: basic.uid });
      expect(next.players.ai.active).not.toBeNull();
      expect(next.phase).toBe("main");
      expect(next.turn).toBe(g.first);
    }
    expect(firsts).toEqual(new Set(["me", "ai"]));
  });

  it("swaps a basic in when reshuffling never finds one", () => {
    const g = createGame(deckList(newProfile()), opp(), 3);
    const p = g.players.me;
    const lone = [...p.hand, ...p.deck, ...p.prizes].find((c) => isBasic(getCard(c.cardId)))!;
    // only one basic left, hidden among the prizes
    p.deck = [...p.hand, ...p.deck].filter((c) => !isBasic(getCard(c.cardId)));
    p.hand = [];
    p.prizes = [lone, ...p.prizes.filter((c) => c !== lone)].slice(0, 4);
    dealHand(g, p);
    expect(p.hand.some((c) => c.uid === lone.uid)).toBe(true);
  });
});
