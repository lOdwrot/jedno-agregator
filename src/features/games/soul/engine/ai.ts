/** Greedy computer player: plays out its turn one move at a time (works for either side). */
import { getCard, isBasic } from "../data/cards";
import type { SupportDef } from "../data/types";
import {
  attackBlock,
  canAttach,
  canBench,
  canUseAbility,
  evolveTargets,
  retreatBlock,
  type Action,
} from "./actions";
import { previewDamage } from "./combat";
import { canPlaySupport, supportTargets } from "./support";
import {
  bestBasic,
  charDef,
  hpLeft,
  inPlay,
  other,
  type Game,
  type InPlay,
  type PlayerId,
} from "./state";

/** Best attack the active can use right now: index and expected damage. */
export function bestAttack(
  g: Game,
  pid: PlayerId,
): { index: number; dmg: number; ko: boolean } | null {
  const a = g.players[pid].active;
  const foe = g.players[other(pid)].active;
  if (!a || !foe) return null;
  let best: { index: number; dmg: number; ko: boolean } | null = null;
  charDef(a).attacks.forEach((atk, index) => {
    if (attackBlock(g, pid, atk)) return;
    const dmg = previewDamage(g, pid, atk);
    const ko = dmg >= hpLeft(foe);
    const score = (ko ? 1000 : 0) + dmg + (atk.effects?.length ?? 0) * 5;
    const bestScore = best ? (best.ko ? 1000 : 0) + best.dmg : -1;
    if (score > bestScore) best = { index, dmg, ko };
  });
  return best;
}

/** How many more energy the character needs for its strongest attack. */
const need = (c: InPlay) =>
  Math.max(0, Math.max(...charDef(c).attacks.map((x) => x.cost)) - c.energy);

function pickSupport(g: Game, pid: PlayerId): Action | null {
  const me = g.players[pid];
  const foe = g.players[other(pid)];
  const a = me.active;
  for (const c of me.hand) {
    const d = getCard(c.cardId);
    if (d.kind !== "item" && d.kind !== "supporter" && d.kind !== "place") continue;
    if (!canPlaySupport(g, pid, c)) continue;
    const s = d as SupportDef;
    const e = s.effect;
    const targets = supportTargets(g, pid, s);
    const play = (target?: number): Action => ({ type: "support", uid: c.uid, target });
    switch (e.k) {
      case "place":
        if (!g.place || g.place.owner !== pid) return play();
        break;
      case "heal":
        if (e.target === "own") {
          const t = [...targets].sort((x, y) => y.damage - x.damage)[0];
          if (t && t.damage >= 30) return play(t.uid);
        } else if (inPlay(me).reduce((s2, x) => s2 + x.damage, 0) >= (e.target === "all" ? 40 : 30))
          return play();
        break;
      case "fullHeal":
      case "cleanse":
        if (
          a &&
          (a.damage >= 50 || a.statuses.some((x) => x !== "poisoned") || a.statuses.length > 1)
        )
          return play();
        break;
      case "draw":
        if (me.hand.length <= 5 && me.deck.length > 4) return play();
        break;
      case "refresh":
        if (me.hand.length <= 2 && me.deck.length > 6) return play();
        break;
      case "searchCharacter":
        if (!me.hand.some((x) => isBasic(getCard(x.cardId))) && me.bench.length < 3) return play();
        break;
      case "drawUntil":
        if (me.hand.length - 1 <= Math.min(3, e.n - 2) && me.deck.length > 4) return play();
        break;
      case "benchBasic":
        if (me.bench.length < 2) return play();
        break;
      case "energyToHand":
        if (!me.hand.some((x) => getCard(x.cardId).kind === "energy")) return play();
        break;
      case "research":
        if (me.hand.length <= 3 && me.deck.length > 10) return play();
        break;
      case "iono":
        if (foe.hand.length >= 6 || (me.hand.length <= 2 && me.prizes.length >= 3)) return play();
        break;
      case "shield":
        if (a && bestAttack(g, pid)) return play();
        break;
      case "discardOppEnergy": {
        if (!e.any) return play();
        const t = [...targets].sort((x, y) => y.energy - x.energy)[0];
        if (t) return play(t.uid);
        break;
      }
      case "peek":
        if (me.deck.length > 3) return play();
        break;
      case "oppStatus":
        if (foe.active && bestAttack(g, pid) && !bestAttack(g, pid)?.ko) return play();
        break;
      case "disrupt":
        if (foe.hand.length >= 5 && me.hand.length <= 5) return play();
        break;
      case "energyFromDeck": {
        const t = [...targets].sort((x, y) => need(y) - need(x))[0];
        if (t && need(t) > 0) return play(t.uid);
        break;
      }
      case "gust": {
        const t = [...targets].sort((x, y) => hpLeft(x) - hpLeft(y))[0];
        if (t && foe.active && hpLeft(t) < hpLeft(foe.active) && hpLeft(t) <= 60)
          return play(t.uid);
        break;
      }
      case "switch": {
        const t = [...targets].sort((x, y) => hpLeft(y) - hpLeft(x))[0];
        if (a && t && (a.statuses.length > 0 || hpLeft(a) <= 30) && hpLeft(t) > hpLeft(a))
          return play(t.uid);
        break;
      }
    }
  }
  return null;
}

/** Whether the revealed top card is worth keeping (otherwise it is swapped for the next one). */
export function keepPeek(g: Game, pid: PlayerId): boolean {
  const me = g.players[pid];
  const c = me.deck.find((x) => x.uid === g.peek?.uid);
  if (!c) return true;
  const d = getCard(c.cardId);
  if (d.kind === "energy") return !me.hand.some((x) => getCard(x.cardId).kind === "energy");
  if (d.kind !== "character") return true;
  if (!d.evolvesFrom)
    return me.bench.length < 3 || !me.hand.some((x) => isBasic(getCard(x.cardId)));
  return inPlay(me).some((x) => x.cardId === d.evolvesFrom);
}

export function aiAction(g: Game, pid: PlayerId): Action | null {
  const me = g.players[pid];
  if (g.phase === "over") return null;
  if (g.phase === "promote") {
    if (g.promote?.who !== pid) return null;
    const b = [...me.bench].sort(
      (x, y) => hpLeft(y) + y.energy * 15 - (hpLeft(x) + x.energy * 15),
    )[0];
    return b ? { type: "promote", uid: b.uid } : null;
  }
  if (g.phase === "setup") {
    const b = pid === "me" ? bestBasic(me.hand) : undefined;
    return b ? { type: "chooseActive", uid: b.uid } : null;
  }
  if (g.turn !== pid) return null;
  if (g.peek) return g.peek.pid === pid ? { type: "peek", keep: keepPeek(g, pid) } : null;

  for (const c of me.hand) {
    const t = evolveTargets(g, pid, c)[0];
    if (t) return { type: "evolve", uid: c.uid, target: t.uid };
  }
  const basic = me.hand
    .filter((c) => canBench(g, pid, c))
    .sort((x, y) => charDef(y).hp - charDef(x).hp)[0];
  if (basic) return { type: "playBasic", uid: basic.uid };

  const sup = pickSupport(g, pid);
  if (sup) return sup;

  for (const c of inPlay(me))
    if (canUseAbility(g, pid, c)) return { type: "ability", target: c.uid };

  const a = me.active;
  const foe = g.players[other(pid)].active;
  // retreat a badly hurt character if a healthier one waits on the bench
  if (a && foe && !retreatBlock(g, pid)) {
    const t = [...me.bench].sort((x, y) => hpLeft(y) - hpLeft(x))[0];
    const threatened = hpLeft(a) <= 30 && charDef(a).souls >= 1;
    if (t && threatened && hpLeft(t) >= 60 && !bestAttack(g, pid)?.ko)
      return { type: "retreat", target: t.uid };
  }

  const energy = me.hand.find((c) => canAttach(g, pid, c));
  if (energy && a) {
    const target = need(a) > 0 ? a : ([...me.bench].sort((x, y) => need(y) - need(x))[0] ?? a);
    return { type: "attach", uid: energy.uid, target: target.uid };
  }

  const atk = bestAttack(g, pid);
  if (atk) return { type: "attack", index: atk.index };
  return { type: "endTurn" };
}
