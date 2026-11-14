import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import { dispatch } from "../engine/actions";
import { aiAction } from "../engine/ai";
import { createGame } from "../engine/state";
import { dropsFor } from "./dnd";
import { anchors, computeSlots, slotRect } from "./layout";

const ai = Object.entries(OPPONENTS[1]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

describe("board layout", () => {
  it.each([
    [390, 700],
    [768, 900],
    [1440, 800],
  ])("keeps the table cards inside a %ix%i board", (w, h) => {
    let g = createGame(deckList(newProfile()), ai, 9);
    for (let i = 0; i < 40 && g.phase !== "over"; i++) {
      const who = g.phase === "setup" ? "me" : g.phase === "promote" ? g.promote!.who : g.turn;
      g = dispatch(g, aiAction(g, who) ?? { type: "endTurn" });
      for (const s of computeSlots(g, w, h)) {
        if (s.zone === "hand") continue; // hands may peek over the edges
        const r = slotRect(s);
        expect(r.x).toBeGreaterThanOrEqual(-1);
        expect(r.y).toBeGreaterThanOrEqual(-1);
        expect(r.x + r.w).toBeLessThanOrEqual(w + 1);
        expect(r.y + r.h).toBeLessThanOrEqual(h + 1);
      }
    }
  });

  it("uses bigger cards in landscape", () => {
    expect(anchors(1440, 800).unit).toBeGreaterThan(anchors(390, 700).unit);
  });

  it("offers drop targets only for playable cards", () => {
    const g = createGame(deckList(newProfile()), ai, 4);
    for (const c of g.players.me.hand) {
      const drops = dropsFor(g, c);
      expect(drops.every((d) => d.action.type === "chooseActive")).toBe(true);
    }
  });
});
