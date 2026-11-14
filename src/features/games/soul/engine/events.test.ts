import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { OPPONENTS } from "../data/opponents";
import { dispatch, dispatchFrames } from "./actions";
import { aiAction } from "./ai";
import { createGame, type DeckList, type Game } from "./state";

const ai: DeckList = Object.entries(OPPONENTS[0]!.deck).flatMap(([cardId, n]) =>
  Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
);

describe("animation frames", () => {
  it("records every step with a snapshot, ending in the returned state", () => {
    let g: Game = createGame(deckList(newProfile()), ai, 5);
    const kinds = new Set<string>();
    for (let i = 0; i < 1500 && g.phase !== "over"; i++) {
      const who = g.phase === "promote" ? g.promote!.who : g.phase === "setup" ? "me" : g.turn;
      const a = aiAction(g, who) ?? { type: "endTurn" as const };
      let res = dispatchFrames(g, a);
      if (res.state === g) res = dispatchFrames(g, { type: "endTurn" });
      if (res.state !== g) {
        expect(res.frames.length).toBeGreaterThan(0);
        // the snapshot after the last event is the final state (minus nothing)
        expect(res.frames.at(-1)!.state.turnNo).toBe(res.state.turnNo);
      }
      for (const f of res.frames) kinds.add(f.ev.t);
      g = res.state;
    }
    expect(g.phase).toBe("over");
    for (const k of [
      "turn",
      "draw",
      "toActive",
      "bench",
      "attach",
      "attack",
      "damage",
      "ko",
      "souls",
      "over",
    ])
      expect(kinds).toContain(k);
  });

  it("an illegal move produces no frames and keeps the state", () => {
    const g = createGame(deckList(newProfile()), ai, 1);
    const res = dispatchFrames(g, { type: "attack", index: 0 });
    expect(res.state).toBe(g);
    expect(res.frames).toEqual([]);
  });

  it("plain dispatch still works without recording", () => {
    const g = createGame(deckList(newProfile()), ai, 2);
    const next = dispatch(g, aiAction(g, "me")!);
    expect(next.phase).toBe("main");
  });
});
