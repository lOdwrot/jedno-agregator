/** Drag & drop rules: where a card from the hand may be dropped and which move that makes. */
import { getCard, isBasic } from "../data/cards";
import type { SupportDef } from "../data/types";
import { canAttach, canBench, evolveTargets, type Action } from "../engine/actions";
import {
  canPlaySupport,
  councilPicks,
  skipEvolvePairs,
  supportTargets,
  targetKind,
} from "../engine/support";
import { inPlay, type CardInst, type Game } from "../engine/state";

export type DropTarget = { kind: "bench" } | { kind: "board" } | { kind: "card"; uid: number };

export interface Drop {
  target: DropTarget;
  action: Action;
}

export function dropsFor(g: Game, c: CardInst): Drop[] {
  const d = getCard(c.cardId);
  if (g.phase === "setup")
    return isBasic(d) && !g.players.me.active
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
  if (s.effect.k === "council") {
    // with one pope in hand the card can be dropped on the bench; with more, tap it to choose
    const popes = councilPicks(g, "me");
    return popes.length === 1
      ? [
          {
            target: { kind: "bench" },
            action: { type: "support", uid: c.uid, target: popes[0]!.uid },
          },
        ]
      : [];
  }
  if (s.effect.k === "skipEvolve") {
    // drop on the basic; a basic with two possible stage 2 cards takes the first one (tap to choose)
    const seen = new Set<number>();
    return skipEvolvePairs(g, "me").flatMap((p) => {
      if (seen.has(p.target.uid)) return [];
      seen.add(p.target.uid);
      return [
        {
          target: { kind: "card", uid: p.target.uid } as const,
          action: { type: "support", uid: c.uid, target: p.target.uid, with: p.card.uid } as const,
        },
      ];
    });
  }
  if (!targetKind(s))
    return [{ target: { kind: "board" }, action: { type: "support", uid: c.uid } }];
  return supportTargets(g, "me", s).map((t) => ({
    target: { kind: "card", uid: t.uid },
    action: { type: "support", uid: c.uid, target: t.uid },
  }));
}

export const isPlayable = (g: Game, c: CardInst) =>
  dropsFor(g, c).length > 0 ||
  (g.phase === "main" && g.turn === "me" && canPlaySupport(g, "me", c));
