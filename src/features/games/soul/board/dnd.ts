/** Drag & drop rules: where a card from the hand may be dropped and which move that makes. */
import { getCard, isBasic } from "../data/cards";
import type { SupportDef } from "../data/types";
import { canAttach, canBench, evolveTargets, type Action } from "../engine/actions";
import { canPlaySupport, supportTargets, targetKind } from "../engine/support";
import { inPlay, type CardInst, type Game } from "../engine/state";

export type DropTarget = { kind: "bench" } | { kind: "board" } | { kind: "card"; uid: number };

export interface Drop {
  target: DropTarget;
  action: Action;
}

export function dropsFor(g: Game, c: CardInst): Drop[] {
  const d = getCard(c.cardId);
  if (g.phase === "setup")
    return isBasic(d)
      ? [{ target: { kind: "board" }, action: { type: "chooseActive", uid: c.uid } }]
      : [];
  if (g.phase !== "main" || g.turn !== "me") return [];
  if (d.kind === "character") {
    if (!d.evolvesFrom)
      return canBench(g, "me", c)
        ? [{ target: { kind: "bench" }, action: { type: "playBasic", uid: c.uid } }]
        : [];
    return evolveTargets(g, "me", c).map((t) => ({
      target: { kind: "card", uid: t.uid },
      action: { type: "evolve", uid: c.uid, target: t.uid },
    }));
  }
  if (d.kind === "energy")
    return canAttach(g, "me", c)
      ? inPlay(g.players.me).map((t) => ({
          target: { kind: "card", uid: t.uid },
          action: { type: "attach", uid: c.uid, target: t.uid },
        }))
      : [];
  const s = d as SupportDef;
  if (!canPlaySupport(g, "me", c)) return [];
  if (!targetKind(s))
    return [{ target: { kind: "board" }, action: { type: "support", uid: c.uid } }];
  return supportTargets(g, "me", s).map((t) => ({
    target: { kind: "card", uid: t.uid },
    action: { type: "support", uid: c.uid, target: t.uid },
  }));
}

export const isPlayable = (g: Game, c: CardInst) => dropsFor(g, c).length > 0;
