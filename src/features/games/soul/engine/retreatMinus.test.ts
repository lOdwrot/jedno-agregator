import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { getCard, isCharacter } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import { aiAction } from "./ai";
import { dispatch } from "./actions";
import { retreatCost } from "./combat";
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

describe("Fala z otchłani — retreatMinus", () => {
  it("is a basic in the deck of Tron Bestii", () => {
    const d = getCard("fala");
    expect(isCharacter(d) && !d.evolvesFrom && d.ability?.effect).toEqual({ k: "retreatMinus", n: 2 });
    expect(OPPONENTS.find((o) => o.id === "niepokonany")!.deck.fala).toBeGreaterThan(0);
  });

  it("makes retreating 2 cheaper from the bench, without stacking or going below zero", () => {
    const g = myTurn();
    const a = g.players.me.active!;
    a.cardId = "bestia";
    const printed = charDef(a).retreat;
    expect(retreatCost(g, "me", a)).toBe(printed);
    bench(g, "fala");
    bench(g, "fala");
    expect(retreatCost(g, "me", a)).toBe(Math.max(0, printed - 2));
    expect(retreatCost(g, "ai", g.players.ai.active!)).toBe(charDef(g.players.ai.active!).retreat);
    a.cardId = "fala";
    expect(retreatCost(g, "me", a)).toBe(0);
  });
});

describe("Św. Leon I — Zatrzymanie Attyli", () => {
  it("hits harder and paralyses only on a coin flip", () => {
    const d = getCard("leon1");
    const atk = isCharacter(d) ? d.attacks[0]! : null;
    expect(atk?.damage).toBe(60);
    expect(atk?.effects).toEqual([{ k: "status", s: "paralyzed", coin: true }]);
  });
});
