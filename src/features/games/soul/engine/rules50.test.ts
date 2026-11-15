import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { getCard, isCharacter } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import { dispatch } from "./actions";
import { aiAction } from "./ai";
import { canPlaySupport } from "./support";
import { createGame, toInPlay, type DeckList, type Game } from "./state";

const oppDeck = (i: number): DeckList =>
  Object.entries(OPPONENTS[i]!.deck).flatMap(([cardId, n]) =>
    Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
  );

/** The player's turn 3 with a basic on the bench. */
function myTurn(seed = 1): Game {
  let g = createGame(deckList(newProfile()), oppDeck(2), seed);
  g = dispatch(g, aiAction(g, "me")!);
  const n = structuredClone(g);
  n.turn = "me";
  n.turnNo = 3;
  n.phase = "main";
  n.flags = { energy: false, supporter: false, retreated: false };
  n.players.me.bench.push(toInPlay({ uid: n.nextUid++, cardId: "ministrant", finish: "plain" }, 1));
  return n;
}
const give = (g: Game, cardId: string) => {
  const c = { uid: g.nextUid++, cardId, finish: "plain" as const };
  g.players.me.hand.push(c);
  return c;
};

describe("50-card rules", () => {
  it("an empty deck at the start of the turn loses the duel; the discard is never reshuffled", () => {
    const g = myTurn();
    g.players.ai.discard.push(...g.players.ai.deck.splice(0));
    const next = dispatch(g, { type: "endTurn" });
    expect(next.phase).toBe("over");
    expect(next.winner).toBe("me");
    expect(next.reason).toMatch(/Talia pomiotów się skończyła/);
    expect(next.players.ai.deck).toHaveLength(0);
  });

  it("Ogłoszenia parafialne (Ultra Ball): discard 2, take the chosen character from the deck", () => {
    let g = myTurn();
    const ball = give(g, "ogloszenia");
    const [a, b] = [give(g, "woda"), give(g, "medalik")];
    const target = g.players.me.deck.find((c) => isCharacter(getCard(c.cardId)))!;
    g = dispatch(g, { type: "support", uid: ball.uid });
    expect(g.search).toEqual({ pid: "me", discard: 2 });
    // everything else waits for the choice; one discard is not enough
    expect(dispatch(g, { type: "endTurn" })).toBe(g);
    expect(dispatch(g, { type: "search", discard: [a.uid], pick: target.uid })).toBe(g);
    g = dispatch(g, { type: "search", discard: [a.uid, b.uid], pick: target.uid });
    expect(g.search).toBeNull();
    expect(g.players.me.hand.some((c) => c.uid === target.uid)).toBe(true);
    expect(g.players.me.discard.map((c) => c.uid)).toEqual(
      expect.arrayContaining([ball.uid, a.uid, b.uid]),
    );
  });

  it("Ogłoszenia need two other cards in hand", () => {
    const g = myTurn();
    g.players.me.hand = [];
    const ball = give(g, "ogloszenia");
    give(g, "woda");
    expect(canPlaySupport(g, "me", ball)).toBe(false);
  });

  it("Księga parafialna and Powrót marnotrawnego syna take cards back from the discard pile", () => {
    let g = myTurn();
    const lost = { uid: g.nextUid++, cardId: "babcia", finish: "plain" as const };
    g.players.me.discard.push(lost, { uid: g.nextUid++, cardId: "laska", finish: "plain" });
    const book = give(g, "ksiega");
    g = dispatch(g, { type: "support", uid: book.uid });
    expect(g.players.me.hand.some((c) => c.uid === lost.uid)).toBe(true);
    const deck = g.players.me.deck.length;
    const discard = g.players.me.discard.length;
    const son = give(g, "marnotrawny");
    g = dispatch(g, { type: "support", uid: son.uid });
    expect(g.players.me.deck.length).toBe(deck + Math.min(5, discard));
  });

  it("no opponent starts with a handicap; only Tron Bestii openly draws 2 cards a turn", () => {
    for (const o of OPPONENTS) {
      const g = createGame(deckList(newProfile()), oppDeck(OPPONENTS.indexOf(o)), 5, o.extraDraw);
      expect(g.players.ai.active!.energy, o.id).toBe(0);
      expect(g.players.ai.deck.length + g.players.ai.hand.length).toBe(50 - 4 - inPlayCount(g));
      expect(o.extraDraw ?? 0, o.id).toBe(o.id === "niepokonany" ? 1 : 0);
    }
  });
});

const inPlayCount = (g: Game) => 1 + g.players.ai.bench.length;
