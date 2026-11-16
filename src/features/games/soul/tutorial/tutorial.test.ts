import { describe, expect, it } from "vitest";
import { dispatch, type Action } from "../engine/actions";
import { aiAction } from "../engine/ai";
import type { Game } from "../engine/state";
import { createTutorialGame, scriptedAi } from "./game";
import { TUTORIAL_STEPS, type TutorialStep } from "./steps";

const uidOf = (g: Game, cardId: string) => {
  const me = g.players.me;
  const c = [...me.hand, ...(me.active ? [me.active] : []), ...me.bench].find(
    (x) => x.cardId === cardId,
  );
  if (!c) throw new Error(`no ${cardId}`);
  return c.uid;
};

/** The player's move of every `expect` step. */
const MOVES: Record<string, (g: Game) => Action> = {
  active: (g) => ({ type: "chooseActive", uid: uidOf(g, "ministrant") }),
  bench: (g) => ({ type: "playBasic", uid: uidOf(g, "oazowicz") }),
  energy: (g) => ({ type: "attach", uid: uidOf(g, "laska"), target: uidOf(g, "ministrant") }),
  item: (g) => ({ type: "support", uid: uidOf(g, "medalik") }),
  supporter: (g) => ({ type: "support", uid: uidOf(g, "zbiorka") }),
  end1: () => ({ type: "endTurn" }),
  evolve: (g) => ({ type: "evolve", uid: uidOf(g, "animator"), target: uidOf(g, "oazowicz") }),
  ability: (g) => ({ type: "ability", target: uidOf(g, "animator") }),
  energy2: (g) => ({ type: "attach", uid: uidOf(g, "laska"), target: uidOf(g, "animator") }),
  attack1: () => ({ type: "attack", index: 1 }),
  retreat: (g) => ({ type: "retreat", target: uidOf(g, "animator") }),
  ability2: (g) => ({ type: "ability", target: uidOf(g, "animator") }),
  energy3: (g) => ({ type: "attach", uid: uidOf(g, "laska"), target: uidOf(g, "animator") }),
  place: (g) => ({ type: "support", uid: uidOf(g, "oliwa") }),
  attack2: () => ({ type: "attack", index: 1 }),
};

/** Lets the scripted demons play until `until` holds. */
function runAi(g: Game, until: (g: Game) => boolean): Game {
  for (let i = 0; i < 50 && !until(g); i++) {
    const a = scriptedAi(g);
    const next = a ? dispatch(g, a) : g;
    g = next === g ? dispatch(g, { type: "endTurn" }) : next;
  }
  return g;
}

function playGuided(): { g: Game; seen: string[] } {
  let g = createTutorialGame();
  const seen: string[] = [];
  for (const step of TUTORIAL_STEPS as TutorialStep[]) {
    if (typeof step.text === "function") seen.push(step.text(g));
    if (step.until) g = runAi(g, step.until);
    if (step.until) expect(step.until(g), step.id).toBe(true);
    if (!step.expect) continue;
    const move = MOVES[step.id]!(g);
    expect(step.expect(g, move), step.id).toBe(true);
    const next = dispatch(g, move);
    expect(next, `${step.id} is a legal move`).not.toBe(g);
    g = next;
  }
  return { g, seen };
}

describe("tutorial script", () => {
  it("every guided move is legal and the duel goes exactly as the explanations say", () => {
    const { g, seen } = playGuided();
    expect(g.players.me.souls).toBe(2);
    expect(g.players.ai.souls).toBe(0);
    expect(g.phase).toBe("main");
    expect(g.turn).toBe("ai");
    expect(g.place?.cardId).toBe("oliwa");
    expect(g.players.ai.active).not.toBeNull();
    expect(seen.join(" ")).toMatch(/do walki staje Pyszałek/);
    expect(seen.join(" ")).toMatch(/Ministrant ma wciąż 50 wytrwałości/);
    expect(seen.join(" ")).toMatch(/Ministrantowi zostało 30 wytrwałości/);
  });

  it("every step without a move is an explanation or a wait for the demons", () => {
    for (const s of TUTORIAL_STEPS) {
      expect(!!s.expect === !!s.todo, s.id).toBe(true);
      if (s.expect) expect(MOVES[s.id], s.id).toBeDefined();
    }
    expect(new Set(TUTORIAL_STEPS.map((s) => s.id)).size).toBe(TUTORIAL_STEPS.length);
  });

  it("rejects other moves at a step", () => {
    const g = createTutorialGame();
    const step = TUTORIAL_STEPS.find((s) => s.id === "active")!;
    expect(step.expect!(g, { type: "chooseActive", uid: uidOf(g, "oazowicz") })).toBe(false);
  });

  it("the free part can be played to the end", () => {
    let { g } = playGuided();
    for (let i = 0; i < 400 && g.phase !== "over"; i++) {
      const pid = g.phase === "promote" ? g.promote!.who : g.turn;
      const a = aiAction(g, pid) ?? { type: "endTurn" };
      const next = dispatch(g, a);
      g = next === g ? dispatch(g, { type: "endTurn" }) : next;
    }
    expect(g.phase).toBe("over");
    expect(g.winner).toBe("me");
    // won by saving souls, not because the demons ran out of characters
    expect(g.players.me.souls).toBe(4);
  });

  it("is the same duel every time", () => {
    expect(createTutorialGame()).toEqual(createTutorialGame());
  });
});
