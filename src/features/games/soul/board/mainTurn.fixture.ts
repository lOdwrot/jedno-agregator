/** Test helper: my turn 3 in the main phase with an empty hand and bench. */
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import { dispatch } from "../engine/actions";
import { aiAction } from "../engine/ai";
import type { DeckList, Game, PlayerId } from "../engine/state";
import { startedGame } from "../engine/testGame";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

/** My turn 3 with an empty hand and an empty bench. */
export function myTurn(): Game {
  let g = startedGame(deckList(newProfile()), ai, 1);
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
export function give(g: Game, cardId: string, pid: PlayerId = "me") {
  const c = { uid: g.nextUid++, cardId, finish: "plain" as const };
  g.players[pid].hand.push(c);
  return c;
}
