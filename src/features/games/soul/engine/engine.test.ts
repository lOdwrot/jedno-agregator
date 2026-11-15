import { describe, expect, it } from "vitest";
import { ALL_CARDS, DECK_SIZE, getCard } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import { deckList, newProfile } from "../collection/profile";
import { dispatch, evolveTargets } from "./actions";
import { aiAction } from "./ai";
import { applyDefense, placeArmor, previewDamage, startTurn } from "./combat";
import { canUseAbility } from "./abilities";
import { canPlaySupport } from "./support";
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
  it("opponent decks and the starter deck have exactly 50 cards", () => {
    for (const o of OPPONENTS)
      expect(Object.values(o.deck).reduce((a, b) => a + b, 0)).toBe(DECK_SIZE);
    expect(deckList(newProfile())).toHaveLength(DECK_SIZE);
  });

  it("sets up hands, souls and the computer's active character", () => {
    const g = createGame(deckList(newProfile()), opponentDeck(0), 7);
    expect(g.phase).toBe("setup");
    for (const p of Object.values(g.players)) expect(p.prizes).toHaveLength(4);
    expect(g.players.me.hand).toHaveLength(7);
    expect(g.players.ai.active).not.toBeNull();
  });

  it("weakness doubles damage, armor reduces it", () => {
    const att = toInPlay({ uid: 1, cardId: "zlosnik", finish: "plain" }, 0); // gniew
    const scholanka = toInPlay({ uid: 2, cardId: "scholanka", finish: "plain" }, 0); // weak to gniew
    const piotr = toInPlay({ uid: 3, cardId: "piotr", finish: "plain" }, 0); // Opoka −20
    const g = createGame(deckList(newProfile()), opponentDeck(0), 1);
    expect(applyDefense(g, "me", att, scholanka, 40)).toBe(80);
    expect(applyDefense(g, "me", att, piotr, 40)).toBe(20);
    g.place = { cardId: "matemblewo", owner: "me" }; // no weakness
    expect(applyDefense(g, "me", att, scholanka, 40)).toBe(40);
    g.place = { cardId: "impreza", owner: "ai" }; // no abilities — Opoka is off
    expect(applyDefense(g, "me", att, piotr, 40)).toBe(40);
  });

  it("places: armor reduces damage taken, extra draw adds a card each turn", () => {
    const g = createGame(deckList(newProfile()), opponentDeck(0), 5);
    g.players.me.active = toInPlay({ uid: 900, cardId: "scholanka", finish: "plain" }, 0);
    const atk = { name: "test", cost: 0, damage: 30 };
    const before = previewDamage(g, "ai", atk);
    g.place = { cardId: "swarzewo", owner: "me" };
    expect(placeArmor(g, "me")).toBe(10);
    expect(placeArmor(g, "ai")).toBe(0);
    expect(previewDamage(g, "ai", atk)).toBe(before - 10);
    g.place = { cardId: "pelplin", owner: "me" };
    expect(previewDamage(g, "ai", atk)).toBe(before - 10);

    g.place = { cardId: "brygida", owner: "me" };
    const hand = g.players.me.hand.length;
    startTurn(g, "me");
    expect(g.players.me.hand.length).toBe(hand + 2);
    const aiHand = g.players.ai.hand.length;
    startTurn(g, "ai");
    expect(g.players.ai.hand.length).toBe(aiHand + 1);
  });

  it("place rules block items and abilities for both players", () => {
    const g = createGame(deckList(newProfile()), opponentDeck(0), 2);
    g.phase = "main";
    g.turn = "me";
    const woda = { uid: 901, cardId: "rozaniec", finish: "plain" as const };
    g.players.me.hand.push(woda);
    expect(canPlaySupport(g, "me", woda)).toBe(true);
    g.place = { cardId: "kabaret", owner: "ai" };
    expect(canPlaySupport(g, "me", woda)).toBe(false);
    g.place = { cardId: "kartuzy", owner: "me" };
    expect(canPlaySupport(g, "me", woda)).toBe(false);

    const lektor = toInPlay({ uid: 902, cardId: "lektor", finish: "plain" }, 0); // drawOnce
    g.players.me.bench.push(lektor);
    g.place = null;
    expect(canUseAbility(g, "me", lektor)).toBe(true);
    g.place = { cardId: "adoracja", owner: "me" };
    expect(canUseAbility(g, "me", lektor)).toBe(false);
  });

  it("evolution is not allowed in the first turns", () => {
    let g = createGame(deckList(newProfile()), opponentDeck(0), 3);
    g = dispatch(g, aiAction(g, "me")!);
    const kleryk = { uid: 999, cardId: "wikariusz", finish: "plain" as const };
    expect(evolveTargets(g, g.turn, kleryk)).toEqual([]);
  });

  it.each(OPPONENTS.map((_, i) => i))(
    "full AI-vs-AI duel against opponent %i always finishes",
    (i) => {
      for (const seed of [1, 2, 3, 4, 5, 6]) {
        const g = autoplay(
          createGame(deckList(newProfile()), opponentDeck(i), seed, OPPONENTS[i]!.extraDraw),
        );
        expect(g.phase).toBe("over");
        expect(g.winner).not.toBeNull();
        const p = g.players[g.winner!];
        const loser = g.players[g.winner === "me" ? "ai" : "me"];
        // win by souls, empty field or opponent's empty deck
        expect(
          p.souls >= 4 || (!loser.active && !loser.bench.length) || loser.deck.length === 0,
        ).toBe(true);
      }
    },
  );

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

  it("evolutions come from a same-side character; both sides have several stage 2 cards", () => {
    const chars = ALL_CARDS.filter((c) => c.kind === "character");
    const stage = (id: string): number => {
      const c = getCard(id);
      return c.kind === "character" && c.evolvesFrom ? 1 + stage(c.evolvesFrom) : 0;
    };
    for (const c of chars)
      if (c.kind === "character" && c.evolvesFrom) {
        expect(getCard(c.evolvesFrom).side, c.id).toBe(c.side);
        expect(getCard(c.evolvesFrom).kind, c.id).toBe("character");
      }
    for (const side of ["parish", "demons"] as const)
      expect(
        chars.filter((c) => c.side === side && stage(c.id) === 2).length,
      ).toBeGreaterThanOrEqual(3);
  });

  it("all referenced cards exist", () => {
    for (const o of OPPONENTS)
      for (const id of Object.keys(o.deck)) expect(getCard(id).side).toBe("demons");
  });
});
