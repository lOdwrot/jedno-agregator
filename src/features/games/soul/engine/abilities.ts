/** Activated abilities ("moce"): each character may use its ability once per turn. */
import { ENERGY_ID, getCard } from "../data/cards";
import { ACTIVE_ABILITIES } from "../data/types";
import { energyNeed, healAll, placeRule } from "./combat";
import { recoverPick } from "./aiSearch";
import { emit } from "./events";
import {
  charDef,
  choicePending,
  coin,
  draw,
  inPlay,
  log,
  nameOf,
  type CardInst,
  type Game,
  type InPlay,
  type PlayerId,
} from "./state";

const energyInDeck = (g: Game, pid: PlayerId) =>
  g.players[pid].deck.findIndex((c) => c.cardId === ENERGY_ID[g.players[pid].side]);
const energyInHand = (g: Game, pid: PlayerId) =>
  g.players[pid].hand.findIndex((c) => c.cardId === ENERGY_ID[g.players[pid].side]);
const energyInDiscard = (g: Game, pid: PlayerId) =>
  g.players[pid].discard.findLastIndex((c) => c.cardId === ENERGY_ID[g.players[pid].side]);

/** The card a "salvageOnce" ability takes back: the best character, or the latest item discarded. */
function salvagePick(g: Game, pid: PlayerId, kind: "character" | "item"): CardInst | undefined {
  if (kind === "character") return recoverPick(g, pid);
  return g.players[pid].discard.findLast((c) => getCard(c.cardId).kind === "item");
}

/** Who gets the energy of an "energyOnce" / "handEnergyOnce" / "kindleOnce" ability: the active if it still needs some. */
function energyTarget(g: Game, pid: PlayerId, fallback: InPlay): InPlay {
  const p = g.players[pid];
  const need = (c: InPlay) => energyNeed(g, pid, c);
  return p.active && need(p.active) > 0
    ? p.active
    : ([...inPlay(p)].sort((a, b) => need(b) - need(a))[0] ?? fallback);
}

/** Characters in play of `pid` whose activated ability can be used right now. */
export function readyAbilities(g: Game, pid: PlayerId): InPlay[] {
  return inPlay(g.players[pid]).filter((c) => canUseAbility(g, pid, c));
}

export function canUseAbility(g: Game, pid: PlayerId, c: InPlay): boolean {
  const e = charDef(c).ability?.effect;
  if (
    !e ||
    !ACTIVE_ABILITIES.has(e.k) ||
    g.phase !== "main" ||
    choicePending(g) ||
    g.turn !== pid ||
    c.abilityTurn === g.turnNo ||
    placeRule(g, "noAbilities")
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
    case "handEnergyOnce":
      return energyInHand(g, pid) >= 0;
    case "recoverOnce":
      return p.active?.uid === c.uid && p.discard.some((x) => x.cardId === e.cardId);
    case "salvageOnce":
      return !!salvagePick(g, pid, e.kind);
    case "kindleOnce":
      return energyInDiscard(g, pid) >= 0;
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
      let n = e.n;
      if (e.coin) {
        const heads = coin(g);
        emit(g, { t: "coin", heads });
        if (heads) n += e.coin;
        log(g, heads ? `Orzeł! +${e.coin} leczenia.` : "Reszka — bez dodatkowego leczenia.");
      }
      healAll(g, [t], n);
      log(g, `${name} — ${nameOf(t)} odzyskuje ${n}.`);
      break;
    }
    case "energyOnce": {
      p.deck.splice(energyInDeck(g, pid), 1);
      const t = energyTarget(g, pid, c);
      t.energy++;
      emit(g, { t: "attach", pid, uid: t.uid, n: 1 });
      log(g, `${name} — ${nameOf(t)} dostaje energię z talii.`);
      break;
    }
    case "handEnergyOnce": {
      p.hand.splice(energyInHand(g, pid), 1);
      const t = energyTarget(g, pid, c);
      t.energy++;
      emit(g, { t: "attach", pid, uid: t.uid, n: 1 });
      log(g, `${name} — ${nameOf(t)} dostaje energię z ręki.`);
      break;
    }
    case "recoverOnce": {
      // the most prestigious print comes back first
      const rank = { stained: 2, gilded: 1, plain: 0 } as const;
      const pick = p.discard
        .filter((x) => x.cardId === e.cardId)
        .sort((a, b) => rank[b.finish] - rank[a.finish])[0]!;
      p.discard = p.discard.filter((x) => x !== pick);
      p.hand.push(pick);
      emit(g, { t: "draw", pid, n: 1 });
      log(g, `${name} — z odrzuconych wraca do ręki: ${nameOf(pick)}.`);
      break;
    }
    case "salvageOnce": {
      const pick = salvagePick(g, pid, e.kind)!;
      p.discard = p.discard.filter((x) => x !== pick);
      p.hand.push(pick);
      emit(g, { t: "draw", pid, n: 1 });
      log(g, `${name} — z odrzuconych wraca do ręki: ${nameOf(pick)}.`);
      break;
    }
    case "kindleOnce": {
      p.discard.splice(energyInDiscard(g, pid), 1);
      const t = energyTarget(g, pid, c);
      t.energy++;
      emit(g, { t: "attach", pid, uid: t.uid, n: 1 });
      log(g, `${name} — ${nameOf(t)} dostaje energię z odrzuconych.`);
      break;
    }
  }
}
