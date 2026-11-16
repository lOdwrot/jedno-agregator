import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { getCard, isCharacter } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import { attackBlock, dispatch } from "./actions";
import { aiAction } from "./ai";
import { attackCost } from "./combat";
import { charDef, toInPlay, type DeckList, type Game } from "./state";
import { startedGame } from "./testGame";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

function myTurn(): Game {
  let g = startedGame(deckList(newProfile()), ai, 1);
  g = dispatch(g, aiAction(g, "me")!);
  const next = structuredClone(g);
  next.turn = "me";
  next.turnNo = 3;
  next.phase = "main";
  next.players.me.bench = [];
  return next;
}
const bench = (g: Game, cardId: string) =>
  g.players.me.bench.push(toInPlay({ uid: g.nextUid++, cardId, finish: "plain" }, 1));

describe("Moderator oazy — costMinus", () => {
  it("pays for its own ability: attacks printed one grace dearer", () => {
    const d = getCard("moderator");
    expect(isCharacter(d) && d.attacks.map((a) => a.cost)).toEqual([3, 5]);
  });

  it("makes every attack of the owner one grace cheaper, also from the bench", () => {
    const g = myTurn();
    const a = g.players.me.active!;
    const atk = charDef(a).attacks.reduce((x, y) => (y.cost > x.cost ? y : x));
    a.energy = atk.cost - 1;
    expect(attackBlock(g, "me", atk)).toMatch(/Potrzeba/);
    bench(g, "moderator");
    expect(attackCost(g, "me", atk)).toBe(atk.cost - 1);
    expect(attackBlock(g, "me", atk)).toBeNull();
    expect(attackCost(g, "ai", atk)).toBe(atk.cost);
  });

  it("does not stack and never goes below zero", () => {
    const g = myTurn();
    bench(g, "moderator");
    bench(g, "moderator");
    const atk = charDef(g.players.me.active!).attacks[0]!;
    expect(attackCost(g, "me", atk)).toBe(Math.max(0, atk.cost - 1));
    expect(attackCost(g, "me", { ...atk, cost: 0 })).toBe(0);
  });
});
