import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { dispatch } from "../engine/actions";
import { aiAction } from "../engine/ai";
import { type DeckList, type Game } from "../engine/state";
import { startedGame } from "../engine/testGame";
import { OPPONENTS, type Opponent } from "./opponents";

function autoplay(g: Game, limit = 3000): Game {
  for (let i = 0; i < limit && g.phase !== "over"; i++) {
    const who = g.phase === "promote" ? g.promote!.who : g.phase === "setup" ? "me" : g.turn;
    const a = aiAction(g, who);
    const next = a ? dispatch(g, a) : g;
    g = next === g ? dispatch(g, { type: "endTurn" }) : next;
  }
  return g;
}

const deckOf = (o: Opponent): DeckList =>
  Object.entries(o.deck).flatMap(([cardId, n]) =>
    Array.from({ length: n }, () => ({ cardId, finish: o.finish ?? "plain" })),
  );

/** Share of AI-vs-AI duels the starter deck wins (fixed seeds, so the result is deterministic). */
function playerWinRate(o: Opponent, games: number): number {
  const deck = deckOf(o);
  let wins = 0;
  for (let s = 1; s <= games; s++) {
    const g = autoplay(startedGame(deckList(newProfile()), deck, s * 7919, o.extraDraw ?? 0));
    if (g.winner === "me") wins++;
  }
  return wins / games;
}

describe("difficulty curve — decks only, no hidden handicap", () => {
  it(
    "the starter deck wins less and less often from Chochliki to Tron Bestii",
    { timeout: 60_000 },
    () => {
      const rates = OPPONENTS.map((o) => playerWinRate(o, 150));
      for (let i = 1; i < rates.length; i++)
        expect(rates[i], `${OPPONENTS[i - 1]!.id} → ${OPPONENTS[i]!.id}: ${rates}`).toBeLessThan(
          rates[i - 1]!,
        );
    },
  );
});
