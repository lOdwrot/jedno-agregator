import { describe, expect, it } from "vitest";
import { deckList, newProfile } from "../collection/profile";
import { actorOf, dispatch, type Action } from "../engine/actions";
import { aiAction } from "../engine/ai";
import { createGame, type Game } from "../engine/state";
import { flipGame } from "./flip";
import { memoryPair } from "./link";
import { hashGame, validDeck } from "./protocol";
import { DuelSync, type SyncTarget } from "./sync";

const deck = () => deckList(newProfile());
const names = { me: "Ania", ai: "Bartek" };
const newGame = (seed = 7) => createGame(deck(), deck(), seed, undefined, { names });
const tick = () => new Promise((ok) => setTimeout(ok, 0));

function target(g: Game): SyncTarget & { g: Game } {
  const t = {
    g,
    canonical: () => t.g,
    push: (a: Action) => {
      const next = dispatch(t.g, a);
      if (next === t.g) return null;
      t.g = next;
      return next;
    },
    reset: (x: Game) => void (t.g = x),
  };
  return t;
}

describe("two-player engine", () => {
  it("both keep (or redraw) the hand, then the coin winner picks first", () => {
    let g = newGame();
    expect(g.phase).toBe("opening");
    expect(g.players.ai.side).toBe("parish");
    expect(actorOf(g, { type: "redraw", pid: "ai" })).toBe("ai");
    g = dispatch(g, { type: "redraw", pid: "ai" });
    expect(g.players.ai.hand).toHaveLength(7);
    g = dispatch(g, { type: "ready", pid: "ai" });
    expect(g.phase).toBe("opening");
    g = dispatch(g, { type: "ready", pid: "me" });
    expect(g.phase).toBe("setup");
    const second = g.first === "me" ? "ai" : "me";
    // the second player waits for the winner of the toss
    expect(aiAction(g, second)).not.toBeNull();
    expect(actorOf(g, aiAction(g, second)!)).toBeNull();
    g = dispatch(g, aiAction(g, g.first)!);
    expect(g.phase).toBe("setup");
    expect(aiAction(g, g.first)).toBeNull();
    g = dispatch(g, aiAction(g, second)!);
    expect(g.phase).toBe("main");
    expect(g.turn).toBe(g.first);
  });

  it("flips the game for the guest (and back)", () => {
    let g = dispatch(newGame(), { type: "ready", pid: "me" });
    g = dispatch(g, { type: "ready", pid: "ai" });
    g = dispatch(g, aiAction(g, g.first)!);
    const f = flipGame(g);
    expect(f.players.me).toBe(g.players.ai);
    expect(f.pvp?.names.me).toBe("Bartek");
    expect(f.log).toEqual(g.pvp?.log);
    const name = g.first === "me" ? "Ania" : "Bartek";
    expect((g.first === "me" ? f : g).log.join(" ")).toContain(`${name} wystawia do walki`);
    expect(flipGame(f)).toEqual(g);
  });

  it("validates the guest's deck", () => {
    expect(validDeck(deck())).toBe(true);
    expect(validDeck(deck().slice(1))).toBe(false);
    expect(validDeck([...deck().slice(1), { cardId: "lucyfer", finish: "plain" }])).toBe(false);
    expect(validDeck("nope")).toBe(false);
  });
});

describe("DuelSync", () => {
  async function play(tamper?: (g: Game) => Game) {
    const [hl, gl] = memoryPair();
    const start = newGame(Math.floor(Math.random() * 1e6));
    const host = target(start);
    const guest = target(structuredClone(start));
    const hs = new DuelSync("host", hl, host);
    const gs = new DuelSync("guest", gl, guest);
    for (let i = 0; i < 2000 && host.g.phase !== "over"; i++) {
      if (i === 40 && tamper) guest.g = tamper(guest.g);
      // each screen only moves for its own seat; the other one is ignored
      for (const [s, t, seat] of [
        [hs, host, "me"],
        [gs, guest, "ai"],
      ] as const) {
        const a = aiAction(t.g, seat) ?? { type: "endTurn" };
        if (actorOf(t.g, a) === seat) s.move(a);
      }
      await tick();
      await tick();
    }
    await tick();
    return { host, guest };
  }

  it("keeps both browsers in the same state through a whole game", async () => {
    const { host, guest } = await play();
    expect(host.g.phase).toBe("over");
    expect(hashGame(guest.g)).toBe(hashGame(host.g));
    const seen = flipGame(guest.g);
    expect(seen.log.some((l) => l.includes("Twój ruch"))).toBe(true);
    expect(seen.reason).not.toBe("");
  });

  it("recovers from a desync with a full state", async () => {
    const { host, guest } = await play((g) => ({ ...g, rng: g.rng + 1 }));
    expect(hashGame(guest.g)).toBe(hashGame(host.g));
  });
});
