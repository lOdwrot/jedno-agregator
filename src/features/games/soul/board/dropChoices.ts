/** A card that needs a target was dropped on the table instead of on a card: the choices to offer. */
import { getCard } from "../data/cards";
import type { SupportDef } from "../data/types";
import { canAttach, evolveTargets, type Action } from "../engine/actions";
import {
  canPlaySupport,
  councilPicks,
  skipEvolvePairs,
  supportTargets,
  targetKind,
} from "../engine/support";
import {
  hpLeft,
  inPlay,
  maxHp,
  nameOf,
  type CardInst,
  type Game,
  type InPlay,
} from "../engine/state";

export interface DropChoice {
  /** The card shown as the tile to tap. */
  card: CardInst;
  /** Short caption under the tile (where it is, what happens). */
  note: string;
  action: Action;
}

function place(g: Game, c: InPlay): string {
  const mine = inPlay(g.players.me).some((x) => x.uid === c.uid);
  const active = g.players[mine ? "me" : "ai"].active?.uid === c.uid;
  const where = mine ? (active ? "aktywna" : "ławka") : active ? "aktywny rywala" : "ławka rywala";
  return `${where} · wytrwałość ${hpLeft(g, c)}/${maxHp(g, c)}`;
}

/** Targets for the hand card `c` (empty when the card needs no target or cannot be played). */
export function dropChoices(g: Game, c: CardInst): DropChoice[] {
  if (g.phase !== "main" || g.turn !== "me") return [];
  const d = getCard(c.cardId);
  if (d.kind === "character")
    return d.evolvesFrom
      ? evolveTargets(g, "me", c).map((t) => ({
          card: t,
          note: place(g, t),
          action: { type: "evolve", uid: c.uid, target: t.uid },
        }))
      : [];
  if (d.kind === "energy")
    return canAttach(g, "me", c)
      ? inPlay(g.players.me).map((t) => ({
          card: t,
          note: place(g, t),
          action: { type: "attach", uid: c.uid, target: t.uid },
        }))
      : [];
  const s = d as SupportDef;
  if (!canPlaySupport(g, "me", c)) return [];
  if (s.effect.k === "council")
    return councilPicks(g, "me").map((p) => ({
      card: p,
      note: "na ławkę (odrzuć 1 ✨)",
      action: { type: "support", uid: c.uid, target: p.uid },
    }));
  if (s.effect.k === "skipEvolve")
    return skipEvolvePairs(g, "me").map((p) => ({
      card: p.target,
      note: `${place(g, p.target)} → ${nameOf(p.card)}`,
      action: { type: "support", uid: c.uid, target: p.target.uid, with: p.card.uid },
    }));
  if (!targetKind(s)) return [];
  return supportTargets(g, "me", s).map((t) => ({
    card: t,
    note: place(g, t),
    action: { type: "support", uid: c.uid, target: t.uid },
  }));
}
