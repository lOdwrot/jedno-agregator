import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { dispatch } from "../engine/actions";
import { aiAction } from "../engine/ai";
import { canPlaySupport } from "../engine/support";
import { type DeckList, type Game } from "../engine/state";
import { startedGame } from "../engine/testGame";
import { DECK_SIZE, ENERGY_ID } from "./cards";
import { DEMON_CARDS } from "./demons";
import { OPPONENTS } from "./opponents";
import { RELAPSE_CARDS } from "./relapse";

const TOP = ["otchlan", "niepokonany"];
const o = OPPONENTS.find((x) => x.id === "otchlan")!;
const deck: DeckList = Object.entries(o.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

/** The demons' turn 4 with `n` Pokusy in their discard pile and `cardId` in hand. */
function demonsTurn(cardId: string, n: number) {
  let g: Game = startedGame(deckList(newProfile()), deck, 5);
  g = structuredClone(dispatch(g, aiAction(g, "me")!)); // the player picks an active
  g.turn = "ai";
  g.turnNo = 4;
  g.phase = "main";
  g.flags = { energy: false, supporter: false, retreated: false };
  g.place = null;
  const p = g.players.ai;
  const ids = [ENERGY_ID.demons, ...RELAPSE_CARDS.map((c) => c.id)];
  p.hand = p.hand.filter((c) => !ids.includes(c.cardId));
  p.discard = Array.from({ length: n }, () => ({
    uid: g.nextUid++,
    cardId: ENERGY_ID.demons,
    finish: "plain" as const,
  }));
  const card = { uid: g.nextUid++, cardId, finish: "plain" as const };
  p.hand.push(card);
  return { g, card };
}

describe("energy recovery items of the top opponents", () => {
  it("are items in the bestiary with a lesson, played only by the two hardest opponents", () => {
    for (const c of RELAPSE_CARDS) {
      expect(DEMON_CARDS).toContain(c);
      expect(c.kind, c.id).toBe("item");
      expect("lesson" in c && c.lesson?.tempts && c.lesson.defend, c.id).toBeTruthy();
      for (const x of OPPONENTS)
        expect(!!x.deck[c.id], `${x.id}: ${c.id}`).toBe(TOP.includes(x.id));
    }
    for (const x of OPPONENTS)
      expect(
        Object.values(x.deck).reduce((a, b) => a + b, 0),
        x.id,
      ).toBe(DECK_SIZE);
  });

  it("Odgrzewany grzech attaches 1 energy from the discard pile to the chosen character", () => {
    const { g, card } = demonsTurn("odgrzewany", 2);
    const t = g.players.ai.active!;
    const before = t.energy;
    const next = dispatch(g, { type: "support", uid: card.uid, target: t.uid });
    expect(next.players.ai.active!.energy).toBe(before + 1);
    expect(next.players.ai.discard.filter((c) => c.cardId === ENERGY_ID.demons)).toHaveLength(1);
    expect(next.flags.energy).toBe(false); // the manual attach of the turn is still free
  });

  it("Nawrót takes 2 energy from the discard pile into the hand", () => {
    const { g, card } = demonsTurn("nawrot", 3);
    const next = dispatch(g, { type: "support", uid: card.uid });
    const hand = next.players.ai.hand.filter((c) => c.cardId === ENERGY_ID.demons);
    expect(hand).toHaveLength(2);
    expect(next.players.ai.discard.filter((c) => c.cardId === ENERGY_ID.demons)).toHaveLength(1);
  });

  it("can't be played with no energy in the discard pile; the AI plays them when it can", () => {
    for (const id of ["odgrzewany", "nawrot"]) {
      const empty = demonsTurn(id, 0);
      expect(canPlaySupport(empty.g, "ai", empty.card), id).toBe(false);
    }
    for (const id of ["odgrzewany", "nawrot"]) {
      const start = demonsTurn(id, 2);
      let g = start.g;
      for (let i = 0; i < 20 && g.turn === "ai" && g.phase === "main"; i++) {
        const a = aiAction(g, "ai");
        if (!a || a.type === "attack" || a.type === "endTurn") break;
        g = dispatch(g, a);
      }
      expect(
        g.players.ai.discard.map((c) => c.uid),
        id,
      ).toContain(start.card.uid);
    }
  });
});
