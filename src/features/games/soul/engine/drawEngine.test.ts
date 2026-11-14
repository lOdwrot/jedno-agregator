import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import { canUseAbility } from "./abilities";
import { dispatch } from "./actions";
import { aiAction } from "./ai";
import { createGame, toInPlay, type DeckList, type Game } from "./state";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

/** A game on the player's turn (turn 3 so everything is allowed). */
function myTurn(seed = 1): Game {
  let g = createGame(deckList(newProfile()), ai, seed);
  g = dispatch(g, aiAction(g, "me")!);
  const next = structuredClone(g);
  next.turn = "me";
  next.turnNo = 3;
  next.phase = "main";
  next.flags = { energy: false, supporter: false, retreated: false };
  return next;
}
function give(g: Game, cardId: string) {
  const c = { uid: g.nextUid++, cardId, finish: "plain" as const };
  g.players.me.hand.push(c);
  return c;
}

describe("draw engine cards", () => {
  it("Ksiądz profesor (Professor's Research): discard the hand, draw 7", () => {
    const g = myTurn();
    const card = give(g, "profesor");
    const handBefore = g.players.me.hand.length - 1;
    const discardBefore = g.players.me.discard.length;
    const n = dispatch(g, { type: "support", uid: card.uid });
    expect(n.players.me.hand).toHaveLength(7);
    expect(n.players.me.discard.length).toBe(discardBefore + handBefore + 1);
    expect(n.flags.supporter).toBe(true);
  });

  it("Ksiądz rzecznik (Iono): both hands go under the deck, each draws one per soul left", () => {
    const g = myTurn(2);
    const card = give(g, "rzecznik");
    g.players.me.prizes.splice(0, 2); // pretend the player already won two souls
    const n = dispatch(g, { type: "support", uid: card.uid });
    expect(n.players.me.hand).toHaveLength(2);
    expect(n.players.ai.hand).toHaveLength(4);
  });

  it("Rada parafialna draws up to 6, Zapisy put a basic on the pew, Paschał fetches grace", () => {
    let g = myTurn(3);
    g.players.me.hand = [];
    const rada = give(g, "rada");
    g = dispatch(g, { type: "support", uid: rada.uid });
    expect(g.players.me.hand).toHaveLength(6);

    const zapisy = give(g, "zapisy");
    const bench = g.players.me.bench.length;
    g = dispatch(g, { type: "support", uid: zapisy.uid });
    expect(g.players.me.bench).toHaveLength(bench + 1);

    const paschal = give(g, "paschal");
    const grace = g.players.me.hand.filter((c) => c.cardId === "laska").length;
    g = dispatch(g, { type: "support", uid: paschal.uid });
    expect(g.players.me.hand.filter((c) => c.cardId === "laska").length).toBe(grace + 2);
  });
});

describe("abilities (once per turn)", () => {
  it("Pani z kancelarii draws up to 4 cards, only once per turn", () => {
    let g = myTurn(4);
    const k = toInPlay({ uid: g.nextUid++, cardId: "kancelaria", finish: "plain" }, 1);
    g.players.me.bench.push(k);
    g.players.me.hand = g.players.me.hand.slice(0, 1);
    expect(canUseAbility(g, "me", k)).toBe(true);
    g = dispatch(g, { type: "ability", target: k.uid });
    expect(g.players.me.hand).toHaveLength(4);
    g.players.me.hand = [];
    expect(canUseAbility(g, "me", g.players.me.bench.at(-1)!)).toBe(false);
  });

  it("Siostra zakonna heals the most damaged character, Animatorka accelerates grace", () => {
    let g = myTurn(5);
    const s = toInPlay({ uid: g.nextUid++, cardId: "siostra", finish: "plain" }, 1);
    const a = toInPlay({ uid: g.nextUid++, cardId: "animator", finish: "plain" }, 1);
    g.players.me.bench.push(s, a);
    g.players.me.active!.damage = 30;
    g = dispatch(g, { type: "ability", target: s.uid });
    expect(g.players.me.active!.damage).toBe(10);
    const energyBefore = [g.players.me.active!, ...g.players.me.bench].reduce(
      (x, c) => x + c.energy,
      0,
    );
    g = dispatch(g, { type: "ability", target: a.uid });
    const energyAfter = [g.players.me.active!, ...g.players.me.bench].reduce(
      (x, c) => x + c.energy,
      0,
    );
    expect(energyAfter).toBe(energyBefore + 1);
  });
});
