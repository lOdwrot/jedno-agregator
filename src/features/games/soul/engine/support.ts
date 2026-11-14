/** Trainer-like cards: items, supporters (one per turn) and places (one on the table). */
import { ENERGY_ID, getCard, isCharacter } from "../data/cards";
import type { SupportDef } from "../data/types";
import { discardEnergy, healAll } from "./combat";
import { emit } from "./events";
import {
  draw,
  findInPlay,
  inPlay,
  log,
  nameOf,
  other,
  rand,
  shuffle,
  type CardInst,
  type Game,
  type InPlay,
  type PlayerId,
} from "./state";

export type TargetKind = "own" | "ownBench" | "oppBench" | null;

export function targetKind(def: SupportDef): TargetKind {
  const e = def.effect;
  if ((e.k === "heal" && e.target === "own") || e.k === "energyFromDeck") return "own";
  if (e.k === "switch") return "ownBench";
  if (e.k === "gust") return "oppBench";
  return null;
}

/** Characters that may be chosen as the card's target. */
export function supportTargets(g: Game, pid: PlayerId, def: SupportDef): InPlay[] {
  const me = g.players[pid];
  switch (targetKind(def)) {
    case "own":
      return def.effect.k === "heal" ? inPlay(me).filter((c) => c.damage > 0) : inPlay(me);
    case "ownBench":
      return me.bench;
    case "oppBench":
      return g.players[other(pid)].bench;
    default:
      return [];
  }
}

const deckEnergy = (g: Game, pid: PlayerId) =>
  g.players[pid].deck.filter((c) => c.cardId === ENERGY_ID[g.players[pid].side]).length;

/** Whether the card would do anything right now (and is allowed this turn). */
export function canPlaySupport(g: Game, pid: PlayerId, card: CardInst): boolean {
  const def = getCard(card.cardId);
  if (def.kind !== "item" && def.kind !== "supporter" && def.kind !== "place") return false;
  if (def.kind === "supporter" && g.flags.supporter) return false;
  const me = g.players[pid];
  const foe = g.players[other(pid)];
  const a = me.active;
  const e = def.effect;
  if (targetKind(def) && !supportTargets(g, pid, def).length) return false;
  switch (e.k) {
    case "heal":
      return e.target === "active" ? !!a && a.damage > 0 : inPlay(me).some((c) => c.damage > 0);
    case "draw":
      return me.deck.length > 0;
    case "refresh":
      return me.deck.length + me.hand.length > 1;
    case "searchCharacter":
      return me.deck.some((c) => isCharacter(getCard(c.cardId)));
    case "cleanse":
    case "fullHeal":
      return !!a && (a.damage > 0 || a.statuses.length > 0);
    case "shield":
      return !!a;
    case "discardOppEnergy":
      return (foe.active?.energy ?? 0) > 0;
    case "energyFromDeck":
      return deckEnergy(g, pid) > 0;
    case "place":
      return g.place?.cardId !== def.id;
    default:
      return true;
  }
}

export function playSupport(g: Game, pid: PlayerId, card: CardInst, targetUid?: number): boolean {
  if (!canPlaySupport(g, pid, card)) return false;
  const def = getCard(card.cardId) as SupportDef;
  const me = g.players[pid];
  const foe = g.players[other(pid)];
  const kind = targetKind(def);
  const target =
    kind === "oppBench"
      ? foe.bench.find((b) => b.uid === targetUid)
      : kind
        ? findInPlay(me, targetUid ?? -1)
        : undefined;
  if (kind && (!target || !supportTargets(g, pid, def).includes(target))) return false;

  me.hand = me.hand.filter((c) => c.uid !== card.uid);
  if (def.kind === "supporter") g.flags.supporter = true;
  const who = pid === "me" ? "Zagrywasz" : "Pomioty zagrywają";
  log(g, `${who}: ${def.emoji} ${def.name}.`);
  if (def.kind !== "place") {
    me.discard.push(card);
    emit(g, { t: "support", pid, cardId: def.id, uid: card.uid });
  }
  const e = def.effect;
  const a = me.active;
  switch (e.k) {
    case "heal":
      healAll(g, e.target === "all" ? inPlay(me) : e.target === "active" ? [a!] : [target!], e.n);
      break;
    case "draw":
      draw(g, pid, e.n);
      break;
    case "refresh":
      me.deck.push(...me.hand.splice(0));
      shuffle(g, me.deck);
      emit(g, { t: "shuffle", pid });
      draw(g, pid, e.n);
      break;
    case "searchCharacter": {
      const pool = me.deck.filter((c) => isCharacter(getCard(c.cardId)));
      const pick = pool[Math.floor(rand(g) * pool.length)]!;
      me.deck = me.deck.filter((c) => c !== pick);
      me.hand.push(pick);
      shuffle(g, me.deck);
      emit(g, { t: "draw", pid, n: 1 });
      log(g, pid === "me" ? `Do ręki trafia: ${nameOf(pick)}.` : "Pomioty biorą postać z talii.");
      break;
    }
    case "cleanse":
      a!.statuses = [];
      emit(g, { t: "cleanse", uids: [a!.uid] });
      healAll(g, [a!], e.heal);
      break;
    case "fullHeal":
      a!.statuses = [];
      emit(g, { t: "cleanse", uids: [a!.uid] });
      healAll(g, [a!], a!.damage);
      break;
    case "shield":
      a!.shield = e.n;
      emit(g, { t: "shield", uid: a!.uid });
      break;
    case "switch": {
      const old = me.active!;
      old.statuses = [];
      me.bench = me.bench.map((b) => (b === target ? old : b));
      me.active = target!;
      log(g, `Do walki staje: ${nameOf(target!)}.`);
      emit(g, { t: "swap", pid });
      break;
    }
    case "gust": {
      const old = foe.active!;
      foe.bench = foe.bench.map((b) => (b === target ? old : b));
      foe.active = target!;
      log(g, `Na pierwszą linię wychodzi: ${nameOf(target!)}.`);
      emit(g, { t: "swap", pid: other(pid) });
      break;
    }
    case "discardOppEnergy":
      discardEnergy(g, other(pid), foe.active!, 1);
      break;
    case "energyFromDeck": {
      let k = 0;
      me.deck = me.deck.filter((c) => {
        if (k < e.n && c.cardId === ENERGY_ID[me.side]) {
          k++;
          return false;
        }
        return true;
      });
      target!.energy += k;
      shuffle(g, me.deck);
      if (k) emit(g, { t: "attach", pid, uid: target!.uid, n: k });
      break;
    }
    case "place":
      if (g.place)
        g.players[g.place.owner].discard.push({
          uid: g.nextUid++,
          cardId: g.place.cardId,
          finish: "plain",
        });
      g.place = { cardId: def.id, owner: pid };
      emit(g, { t: "place", pid, cardId: def.id });
      break;
  }
  return true;
}
