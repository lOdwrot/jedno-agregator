import { describe, expect, it } from "vitest";
import { DECK_SIZE, getCard } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import { deckList, newProfile } from "../collection/profile";
import { dispatch, evolveTargets } from "./actions";
import { aiAction } from "./ai";
import { applyDefense } from "./combat";
import { createGame, toInPlay, type DeckList, type Game } from "./state";

const opponentDeck = (i: number): DeckList =>
  Object.entries(OPPONENTS[i]!.deck).flatMap(([cardId, n]) =>
    Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
  );

/** Both sides played by the AI until the duel ends. */
function autoplay(g: Game, limit = 2000): Game {
  for (let i = 0; i < limit && g.phase !== "over"; i++) {
    const who = g.phase === "promote" ? g.promote!.who : g.phase === "setup" ? "me" : g.turn;
    const a = aiAction(g, who);
    const next = a ? dispatch(g, a) : g;
    g = next === g ? dispatch(g, { type: "endTurn" }) : next;
  }
  return g;
}

describe("Walka o duszę — engine", () => {
  it("opponent decks and the starter deck have exactly 24 cards", () => {
    for (const o of OPPONENTS)
      expect(Object.values(o.deck).reduce((a, b) => a + b, 0)).toBe(DECK_SIZE);
    expect(deckList(newProfile())).toHaveLength(DECK_SIZE);
  });

  it("sets up hands, souls and the computer's active character", () => {
    const g = createGame(deckList(newProfile()), opponentDeck(0), 7);
    expect(g.phase).toBe("setup");
    for (const p of Object.values(g.players)) expect(p.prizes).toHaveLength(4);
    expect(g.players.me.hand).toHaveLength(5);
    expect(g.players.ai.active).not.toBeNull();
  });

  it("weakness doubles damage, armor reduces it", () => {
    const att = toInPlay({ uid: 1, cardId: "zlosnik", finish: "plain" }, 0); // gniew
    const scholanka = toInPlay({ uid: 2, cardId: "scholanka", finish: "plain" }, 0); // weak to gniew
    const piotr = toInPlay({ uid: 3, cardId: "piotr", finish: "plain" }, 0); // Opoka −20
    expect(applyDefense(att, scholanka, 40)).toBe(80);
    expect(applyDefense(att, piotr, 40)).toBe(20);
  });

  it("evolution is not allowed in the first turns", () => {
    let g = createGame(deckList(newProfile()), opponentDeck(0), 3);
    g = dispatch(g, aiAction(g, "me")!);
    const kleryk = { uid: 999, cardId: "wikariusz", finish: "plain" as const };
    expect(evolveTargets(g, g.turn, kleryk)).toEqual([]);
  });

  it.each([0, 1, 2])("full AI-vs-AI duel against opponent %i always finishes", (i) => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const g = autoplay(createGame(deckList(newProfile()), opponentDeck(i), seed));
      expect(g.phase).toBe("over");
      expect(g.winner).not.toBeNull();
      const p = g.players[g.winner!];
      const loser = g.players[g.winner === "me" ? "ai" : "me"];
      // win by souls, empty field or opponent's empty deck
      expect(
        p.souls >= 4 || (!loser.active && !loser.bench.length) || loser.deck.length === 0,
      ).toBe(true);
    }
  });

  it("never loses or duplicates cards", () => {
    const g = autoplay(createGame(deckList(newProfile()), opponentDeck(1), 11));
    for (const p of Object.values(g.players)) {
      const field = [p.active, ...p.bench].filter(Boolean).flatMap((c) => [c!, ...c!.under]);
      const energy = [p.active, ...p.bench].reduce((s, c) => s + (c?.energy ?? 0), 0);
      const total =
        p.deck.length + p.hand.length + p.discard.length + p.prizes.length + field.length + energy;
      const placeHere = g.place && g.players[g.place.owner] === p ? 1 : 0;
      expect(total + placeHere).toBe(DECK_SIZE);
    }
  });

  it("all referenced cards exist", () => {
    for (const o of OPPONENTS)
      for (const id of Object.keys(o.deck)) expect(getCard(id).side).toBe("demons");
  });
});
