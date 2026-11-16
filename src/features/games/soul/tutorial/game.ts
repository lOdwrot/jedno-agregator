/**
 * The tutorial duel: both decks are fixed and stacked (no shuffle), the player always goes first,
 * and during the guided part the demons play a simple, predictable script — so every explanation
 * in `steps.ts` matches what really happens on the table.
 */
import { attackBlock, canAttach, canBench, type Action } from "../engine/actions";
import { aiAction } from "../engine/ai";
import { previewDamage } from "../engine/combat";
import {
  charDef,
  createGame,
  log,
  type CardInst,
  type Game,
  type PlayerState,
} from "../engine/state";

/** Cards (top first) of the player's side. */
export const TUTORIAL_ME = {
  hand: ["ministrant", "oazowicz", "laska", "medalik", "zbiorka", "animator", "oliwa"],
  deck: [
    "laska", // turn 1 draw
    "laska", // Zbiórka ministrantów (3 cards)
    "lektor",
    "woda",
    "siostra", // turn 3 draw
    "laska", // Ognisko (turn 3)
    "ceremoniarz", // turn 5 draw
    "laska", // Ognisko (turn 5)
    // free play
    "laska",
    "babcia",
    "laska",
    "koscielny",
    "laska",
    "scholanka",
    "laska",
    "dyrygentka",
    "laska",
    "woda",
    "laska",
    "kleryk",
    "laska",
    "zbiorka",
    "laska",
    "wikariusz",
    "laska",
    "medalik",
    "laska",
    "laska",
  ],
  prizes: ["kolo", "laska", "rozaniec", "laska"],
} as const;

/** Cards (top first) of the demons — the easy "Chochliki z kanapy" kind. */
export const TUTORIAL_AI = {
  hand: ["pyszalek", "szyderca", "pokusa", "pokusa", "pokusa", "pokusa", "pokusa"],
  deck: [
    "pokusa", // turn 2 draw
    "plotka", // turn 4 draw
    // free play: a new demon every turn, so the last two souls are a real fight
    "zniechecenie",
    "drzemka",
    "pokusa",
    "scroll",
    "pokusa",
    "pokusa",
    "wymowka",
    "pokusa",
    "odkladanie",
    "pokusa",
    "szyderca",
    "pokusa",
    "pokusa",
    "zlosnik",
    "pokusa",
    "pokusa",
    "plotka",
    "pokusa",
    "pokusa",
    "pokusa",
    "pokusa",
  ],
  prizes: ["pokusa", "pokusa", "wymowka", "pokusa"],
} as const;

const SEED = 20261116;

function stack(g: Game, p: PlayerState, cards: typeof TUTORIAL_ME | typeof TUTORIAL_AI) {
  const inst = (ids: readonly string[]): CardInst[] =>
    ids.map((cardId) => ({ uid: g.nextUid++, cardId, finish: "plain" }));
  p.hand = inst(cards.hand);
  p.deck = inst(cards.deck);
  p.prizes = inst(cards.prizes);
}

/** A new tutorial duel, past the opening: the player goes first and picks the first character. */
export function createTutorialGame(): Game {
  const g = createGame([], [], SEED);
  stack(g, g.players.me, TUTORIAL_ME);
  stack(g, g.players.ai, TUTORIAL_AI);
  g.phase = "setup";
  g.opening = null;
  g.first = "me";
  g.log = [];
  log(g, "Samouczek: idziesz pierwszy. Wybierz postać, która stanie do walki.");
  return g;
}

/**
 * The demons during the guided part: bench every basic, attach energy to the active, then hit
 * with the strongest attack — nothing else, so the script never takes a surprising turn.
 */
export function scriptedAi(g: Game): Action | null {
  if (g.phase !== "main" || g.turn !== "ai") return aiAction(g, "ai");
  const p = g.players.ai;
  const basic = p.hand.find((c) => canBench(g, "ai", c));
  if (basic) return { type: "playBasic", uid: basic.uid };
  const energy = p.hand.find((c) => canAttach(g, "ai", c));
  if (energy && p.active) return { type: "attach", uid: energy.uid, target: p.active.uid };
  const a = p.active;
  if (a) {
    const best = charDef(a)
      .attacks.map((atk, index) => ({
        index,
        ok: !attackBlock(g, "ai", atk),
        dmg: previewDamage(g, "ai", atk),
      }))
      .filter((x) => x.ok)
      .sort((x, y) => y.dmg - x.dmg)[0];
    if (best) return { type: "attack", index: best.index };
  }
  return { type: "endTurn" };
}
