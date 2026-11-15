import { describe, expect, it } from "vitest";
import { deckList, newProfile, parseKey } from "../collection/profile";
import { getCard, isCharacter } from "../data/cards";
import { OPPONENTS } from "../data/opponents";
import { ORDERS_CARDS } from "../data/orders";
import { ACTIVE_ABILITIES } from "../data/types";
import { dispatch } from "./actions";
import { aiAction } from "./ai";
import { canUseAbility } from "./abilities";
import { canPlaySupport, skipEvolvePairs } from "./support";
import { createGame, toInPlay, type DeckList, type Game } from "./state";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

/** My turn 3 with an empty hand, an empty bench and an empty discard pile. */
function myTurn(): Game {
  let g = createGame(deckList(newProfile()), ai, 1);
  g = dispatch(g, aiAction(g, "me")!);
  const next = structuredClone(g);
  next.turn = "me";
  next.turnNo = 3;
  next.phase = "main";
  next.flags = { energy: false, supporter: false, retreated: false };
  next.players.me.hand = [];
  next.players.me.bench = [];
  next.players.me.discard = [];
  return next;
}
function give(g: Game, cardId: string, zone: "hand" | "discard" = "hand") {
  const c = { uid: g.nextUid++, cardId, finish: "plain" as const };
  g.players.me[zone].push(c);
  return c;
}
function bench(g: Game, cardId: string, turn = 1) {
  const c = toInPlay({ uid: g.nextUid++, cardId, finish: "plain" }, turn);
  g.players.me.bench.push(c);
  return c;
}

const stage2 = ORDERS_CARDS.filter(
  (c) => isCharacter(c) && c.evolvesFrom && isCharacter(getCard(c.evolvesFrom)),
).filter(
  (c) => isCharacter(c) && !!(getCard(c.evolvesFrom!) as { evolvesFrom?: string }).evolvesFrom,
);

describe("three-stage booster lines", () => {
  it("has full lines whose stage 1 and stage 2 all carry abilities", () => {
    expect(stage2.map((c) => c.id).sort()).toEqual(["harcmistrz", "opat"]);
    for (const s2 of stage2) {
      if (!isCharacter(s2)) throw new Error();
      const s1 = getCard(s2.evolvesFrom!);
      if (!isCharacter(s1)) throw new Error();
      const base = getCard(s1.evolvesFrom!);
      expect(isCharacter(base) && !base.evolvesFrom).toBe(true);
      expect(s1.ability).toBeDefined();
      expect(s2.ability).toBeDefined();
      expect(s2.rarity).toBe("legendary");
      expect(s1.rarity).toBe("rare");
      expect(s2.hp).toBeGreaterThan(s1.hp);
    }
  });

  it("stage 1 cards take cards back from the discard pile", () => {
    for (const s2 of stage2) {
      const s1 = getCard((s2 as { evolvesFrom: string }).evolvesFrom);
      const e = isCharacter(s1) ? s1.ability?.effect : undefined;
      expect(e?.k).toBe("salvageOnce");
      expect(ACTIVE_ABILITIES.has(e!.k)).toBe(true);
    }
  });

  it("are never in the starter deck", () => {
    const ids = new Set(newProfile().deck.map((k) => parseKey(k).cardId));
    for (const c of ORDERS_CARDS) expect(ids.has(c.id), c.id).toBe(false);
  });
});

describe("Brat cysters / Harcerz: salvage from the discard pile", () => {
  it("Skryptorium takes the latest item back, from the bench too, once per turn", () => {
    const g = myTurn();
    const brat = bench(g, "cysters");
    expect(canUseAbility(g, "me", brat)).toBe(false);
    give(g, "woda", "discard");
    give(g, "profesor", "discard"); // a supporter, not an item
    give(g, "rozaniec", "discard");
    expect(canUseAbility(g, "me", brat)).toBe(true);
    const after = dispatch(g, { type: "ability", target: brat.uid });
    expect(after.players.me.hand.map((c) => c.cardId)).toEqual(["rozaniec"]);
    expect(after.players.me.discard.map((c) => c.cardId)).toEqual(["woda", "profesor"]);
    expect(canUseAbility(after, "me", after.players.me.bench[0]!)).toBe(false);
  });

  it("Nikogo nie zostawiamy takes a character back", () => {
    const g = myTurn();
    const h = bench(g, "harcerz");
    give(g, "laska", "discard");
    expect(canUseAbility(g, "me", h)).toBe(false);
    give(g, "ministrant", "discard");
    const after = dispatch(g, { type: "ability", target: h.uid });
    expect(after.players.me.hand.map((c) => c.cardId)).toEqual(["ministrant"]);
  });
});

describe("Harcmistrz: Ognisko", () => {
  it("attaches one grace from the discard pile", () => {
    const g = myTurn();
    const hm = bench(g, "harcmistrz");
    expect(canUseAbility(g, "me", hm)).toBe(false);
    give(g, "laska", "discard");
    const active = g.players.me.active!;
    active.energy = 0;
    const after = dispatch(g, { type: "ability", target: hm.uid });
    expect(after.players.me.discard).toEqual([]);
    expect(after.players.me.active!.energy).toBe(1);
  });
});

describe("Opat oliwski: Klauzura", () => {
  it("protects the owner's bench from attack spread damage", () => {
    const g = myTurn();
    // the demons attack with a bench-spread attack: put Opat on my bench and play as the demons
    const opat = bench(g, "opat");
    const mini = bench(g, "ministrant");
    g.turn = "ai";
    const foe = g.players.ai.active!;
    foe.cardId = "harcmistrz"; // any attacker with a bench attack works for the rule
    foe.energy = 4;
    const after = dispatch(g, { type: "attack", index: 1 });
    const b = after.players.me.bench;
    expect(b.find((x) => x.uid === opat.uid)?.damage).toBe(0);
    expect(b.find((x) => x.uid === mini.uid)?.damage).toBe(0);
  });
});

describe("Droga do Damaszku", () => {
  it("evolves a basic straight into its stage 2", () => {
    const g = myTurn();
    const candy = give(g, "damaszek");
    const zuch = bench(g, "zuch");
    expect(canPlaySupport(g, "me", candy)).toBe(false);
    const hm = give(g, "harcmistrz");
    give(g, "harcerz"); // stage 1 is not a target of the card
    expect(skipEvolvePairs(g, "me").map((p) => [p.card.cardId, p.target.uid])).toEqual([
      ["harcmistrz", zuch.uid],
    ]);
    const after = dispatch(g, { type: "support", uid: candy.uid, target: zuch.uid, with: hm.uid });
    const me = after.players.me;
    expect(me.bench[0]!.cardId).toBe("harcmistrz");
    expect(me.bench[0]!.under.map((c) => c.cardId)).toEqual(["zuch"]);
    expect(me.hand.map((c) => c.cardId)).toEqual(["harcerz"]);
    expect(me.discard.map((c) => c.cardId)).toEqual(["damaszek"]);
  });

  it("works for the older lines too, but not on a basic played this turn or without a pair", () => {
    const g = myTurn();
    const candy = give(g, "damaszek");
    const cer = give(g, "ceremoniarz");
    const fresh = bench(g, "ministrant", 3);
    expect(skipEvolvePairs(g, "me")).toEqual([]);
    expect(dispatch(g, { type: "support", uid: candy.uid, target: fresh.uid, with: cer.uid })).toBe(
      g,
    );
    const old = bench(g, "ministrant");
    expect(dispatch(g, { type: "support", uid: candy.uid, target: old.uid })).toBe(g);
    const after = dispatch(g, { type: "support", uid: candy.uid, target: old.uid, with: cer.uid });
    expect(after.players.me.bench.find((x) => x.uid === old.uid)?.cardId).toBe("ceremoniarz");
  });
});
