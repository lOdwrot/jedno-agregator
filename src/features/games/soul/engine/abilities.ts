/** Activated abilities ("moce"): each character may use its ability once per turn. */
import { ENERGY_ID } from "../data/cards";
import { ACTIVE_ABILITIES } from "../data/types";
import { healAll } from "./combat";
import { emit } from "./events";
import { charDef, draw, inPlay, log, nameOf, type Game, type InPlay, type PlayerId } from "./state";

const energyInDeck = (g: Game, pid: PlayerId) =>
  g.players[pid].deck.findIndex((c) => c.cardId === ENERGY_ID[g.players[pid].side]);

/** How many more energy a character needs for its strongest attack. */
export const energyNeed = (c: InPlay) =>
  Math.max(0, Math.max(...charDef(c).attacks.map((x) => x.cost)) - c.energy);

export function canUseAbility(g: Game, pid: PlayerId, c: InPlay): boolean {
  const e = charDef(c).ability?.effect;
  if (
    !e ||
    !ACTIVE_ABILITIES.has(e.k) ||
    g.phase !== "main" ||
    g.turn !== pid ||
    c.abilityTurn === g.turnNo
  )
    return false;
  const p = g.players[pid];
  switch (e.k) {
    case "drawOnce":
      return p.deck.length > 0;
    case "drawUntil":
      return p.deck.length > 0 && p.hand.length < e.n;
    case "healOnce":
      return inPlay(p).some((x) => x.damage > 0);
    case "energyOnce":
      return energyInDeck(g, pid) >= 0;
    default:
      return false;
  }
}

/** Applies the ability (validity is checked by the caller). */
export function activateAbility(g: Game, pid: PlayerId, c: InPlay) {
  const e = charDef(c).ability!.effect;
  const p = g.players[pid];
  const name = `${nameOf(c)}: „${charDef(c).ability!.name}”`;
  c.abilityTurn = g.turnNo;
  emit(g, { t: "ability", pid, uid: c.uid });
  switch (e.k) {
    case "drawOnce":
      draw(g, pid, 1);
      log(g, `${name} — dobranie karty.`);
      break;
    case "drawUntil": {
      const n = draw(g, pid, e.n - p.hand.length);
      log(g, `${name} — dobrano ${n} ${n === 1 ? "kartę" : "karty"}.`);
      break;
    }
    case "healOnce": {
      const t = [...inPlay(p)].sort((a, b) => b.damage - a.damage)[0]!;
      healAll(g, [t], e.n);
      log(g, `${name} — ${nameOf(t)} odzyskuje ${e.n}.`);
      break;
    }
    case "energyOnce": {
      p.deck.splice(energyInDeck(g, pid), 1);
      const t =
        p.active && energyNeed(p.active) > 0
          ? p.active
          : ([...inPlay(p)].sort((a, b) => energyNeed(b) - energyNeed(a))[0] ?? c);
      t.energy++;
      emit(g, { t: "attach", pid, uid: t.uid, n: 1 });
      log(g, `${name} — ${nameOf(t)} dostaje energię z talii.`);
      break;
    }
  }
}
