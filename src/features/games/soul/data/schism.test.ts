import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { dispatch } from "../engine/actions";
import { aiAction } from "../engine/ai";
import { previewDamage } from "../engine/combat";
import { hpLeft, toInPlay, type DeckList, type Game } from "../engine/state";
import { startedGame } from "../engine/testGame";
import { mutate } from "../ideal/forge";
import { legal, POOL, repair } from "../ideal/pool";
import { getCard, isCharacter, isPopeCard, maxCopies } from "./cards";
import { DEMON_CARDS } from "./demons";
import { OPPONENTS } from "./opponents";
import { SCHISM_CARDS } from "./schism";

const TOP = ["otchlan", "niepokonany"];
const o = OPPONENTS.find((x) => x.id === "niepokonany")!;
const deck: DeckList = Object.entries(o.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

/** The demons' turn: Antypapież (3 energy) faces the player's `defender`. */
function duel(defender: string): Game {
  let g: Game = startedGame(deckList(newProfile()), deck, 11);
  g = structuredClone(dispatch(g, aiAction(g, "me")!));
  g.turn = "ai";
  g.turnNo = 6;
  g.phase = "main";
  g.flags = { energy: true, supporter: false, retreated: false };
  g.place = null;
  const ai = g.players.ai;
  ai.active = {
    ...toInPlay({ uid: g.nextUid++, cardId: "antypapiez", finish: "plain" }, 0),
    energy: 3,
  };
  ai.bench = [];
  ai.hand = [];
  g.players.me.active = toInPlay({ uid: g.nextUid++, cardId: defender, finish: "plain" }, 0);
  return g;
}

describe("Antypapież — the pope slayer", () => {
  it("is a demon with a lesson, once in each of the two hardest decks only (and in the forge pool)", () => {
    for (const c of SCHISM_CARDS) {
      expect(DEMON_CARDS).toContain(c);
      expect("lesson" in c && c.lesson?.tempts && c.lesson.defend, c.id).toBeTruthy();
      expect(POOL).toContain(c);
      expect(maxCopies(c.id)).toBe(1);
      for (const x of OPPONENTS)
        expect(x.deck[c.id] ?? 0, `${x.id}: ${c.id}`).toBe(TOP.includes(x.id) ? 1 : 0);
    }
    for (const x of OPPONENTS)
      for (const [id, n] of Object.entries(x.deck)) {
        const c = getCard(id);
        if (isCharacter(c) && c.unique) expect(n, `${x.id}: ${id}`).toBe(1);
      }
  });

  it("knocks out any pope at once, whatever its HP", () => {
    const slayer = getCard("antypapiez");
    if (!isCharacter(slayer)) throw new Error("Antypapież must be a character");
    for (const pope of ["jp2", "franciszek"]) {
      expect(isPopeCard(getCard(pope)), pope).toBe(true);
      const g = duel(pope);
      const foe = g.players.me.active!;
      expect(previewDamage(g, "ai", slayer.attacks[1]!), pope).toBe(hpLeft(g, foe));
      const next = dispatch(g, { type: "attack", index: 1 });
      expect(next.players.me.active?.uid, pope).not.toBe(foe.uid);
      expect(
        next.players.me.discard.some((c) => c.uid === foe.uid),
        pope,
      ).toBe(true);
      expect(next.players.ai.souls, pope).toBe(2);
    }
  });

  it("deals only the base damage to anyone else", () => {
    for (const id of ["proboszcz", "wojciech"]) {
      const g = duel(id);
      const next = dispatch(g, { type: "attack", index: 1 });
      const left = next.players.me.active!;
      expect(left.cardId, id).toBe(id);
      expect(left.damage, id).toBeGreaterThan(0);
      expect(left.damage, id).toBeLessThanOrEqual(100); // 50, ×2 at most for a weakness
    }
  });

  it("the AI picks the pope-slaying attack", () => {
    const g = duel("jp2");
    expect(aiAction(g, "ai")).toMatchObject({ type: "attack", index: 1 });
  });
});

describe("Antypapież in the Idealny Oponent forge", () => {
  it("repair and the rules keep at most one copy", () => {
    const rnd = (() => {
      let x = 7;
      return () => (x = (x * 16807) % 2147483647) / 2147483647;
    })();
    const g = repair({ antypapiez: 3, bestia: 2, rog: 2, fala: 2, wilk: 3 }, rnd);
    expect(g.antypapiez).toBe(1);
    expect(legal(g)).toBe(true);
    expect(legal({ ...g, antypapiez: 2 })).toBe(false);
    for (let i = 0; i < 200; i++) {
      const next = repair(mutate(g, rnd).next, rnd);
      expect(next.antypapiez ?? 0).toBeLessThanOrEqual(1);
    }
  });
});
