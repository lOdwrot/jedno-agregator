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
import { aiSearch, searchPick } from "./aiSearch";
import {
  applyDefense,
  attackCost,
  bonusDamage,
  energyNeed,
  fuelMax,
  handEnergy,
  previewDamage,
  retreatCost,
} from "./combat";
import { canPlaySupport, councilPicks, skipEvolvePairs, supportTargets } from "./support";
import {
  benchValue,
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
): { index: number; dmg: number; ko: boolean; fuel: number } | null {
  const a = g.players[pid].active;
  const foe = g.players[other(pid)].active;
  if (!a || !foe) return null;
  let best: { index: number; dmg: number; ko: boolean; fuel: number } | null = null;
  const spare = handEnergy(g, pid).length;
  charDef(a).attacks.forEach((atk, index) => {
    if (attackBlock(g, pid, atk)) return;
    // burn hand energy only to secure a knock-out (the least needed), or when there is plenty of it
    const max = fuelMax(g, pid, atk);
    let fuel = 0;
    while (fuel < max && previewDamage(g, pid, atk, fuel) < hpLeft(g, foe)) fuel++;
    if (previewDamage(g, pid, atk, fuel) < hpLeft(g, foe)) fuel = spare >= 3 ? max : 0;
    const dmg = previewDamage(g, pid, atk, fuel);
    const ko = dmg >= hpLeft(g, foe);
    // attacks that throw away the attacker's own energy are only worth it for a knock-out
    const selfCost = atk.effects?.some((e) => e.k === "selfDiscard") && !ko ? 25 : 0;
    const score = (ko ? 1000 : 0) + dmg + (atk.effects?.length ?? 0) * 5 - selfCost - fuel * 5;
    const bestScore = best ? (best.ko ? 1000 : 0) + best.dmg : -1;
    if (score > bestScore) best = { index, dmg, ko, fuel };
  });
  return best;
}

/** Whether the active's best usable attack would knock out `target` if it stood in front. */
function canKO(g: Game, pid: PlayerId, target: InPlay): boolean {
  const a = g.players[pid].active;
  if (!a || g.turnNo === 1) return false;
  return charDef(a).attacks.some((atk) => {
    if (a.energy < attackCost(g, pid, atk) || atk.damage <= 0) return false;
    const dmg = applyDefense(g, other(pid), a, target, atk.damage + bonusDamage(g, pid, a));
    return dmg >= hpLeft(g, target);
  });
}

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
      case "council": {
        const hp = (x: { cardId: string }) => {
          const d = getCard(x.cardId);
          return d.kind === "character" ? d.hp : 0;
        };
        const pope = [...councilPicks(g, pid)].sort((x, y) => hp(y) - hp(x))[0];
        if (pope) return play(pope.uid);
        break;
      }
      case "skipEvolve": {
        const best = [...skipEvolvePairs(g, pid)].sort(
          (x, y) => (x.target === a ? -1 : 0) - (y.target === a ? -1 : 0),
        )[0];
        if (best)
          return { type: "support", uid: c.uid, target: best.target.uid, with: best.card.uid };
        break;
      }
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
        if (me.hand.length <= 5 && me.deck.length > e.n + 6) return play();
        break;
      case "refresh":
        if (me.hand.length <= 2 && me.deck.length > 6) return play();
        break;
      case "searchCharacter":
        if (!me.hand.some((x) => isBasic(getCard(x.cardId))) && me.bench.length < 3) return play();
        break;
      case "drawUntil":
        if (me.hand.length - 1 <= Math.min(3, e.n - 2) && me.deck.length > e.n + 6) return play();
        break;
      case "benchBasic":
        if (me.bench.length < 2) return play();
        break;
      case "energyToHand":
        if (!me.hand.some((x) => getCard(x.cardId).kind === "energy")) return play();
        break;
      case "research":
        if (me.hand.length <= 3 && me.deck.length > 14) return play();
        break;
      case "iono":
        if (
          (foe.hand.length >= 6 && foe.prizes.length <= me.prizes.length) ||
          (me.hand.length <= 2 && me.prizes.length >= 3) ||
          (foe.prizes.length === 1 && foe.hand.length >= 3)
        )
          return play();
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
      case "search":
        if (searchPick(g, pid) && me.deck.length > 4) return play();
        break;
      case "recoverCharacter":
        if (searchPick(g, pid, me.discard)) return play();
        break;
      case "recycle":
        if (me.deck.length <= 12 || me.discard.length >= 8) return play();
        break;
      case "oppStatus":
        if (foe.active && bestAttack(g, pid) && !bestAttack(g, pid)?.ko) return play();
        break;
      case "disrupt":
        if (foe.hand.length >= 5 && me.hand.length <= 5) return play();
        break;
      case "energyFromDeck": {
        const t = [...targets].sort((x, y) => energyNeed(g, pid, y) - energyNeed(g, pid, x))[0];
        if (t && energyNeed(g, pid, t) > 0) return play(t.uid);
        break;
      }
      case "gust": {
        if (!foe.active) break;
        // pull out a character the active can knock out now (2-soul ones first)
        const ko = targets
          .filter((t) => canKO(g, pid, t) && !canKO(g, pid, foe.active!))
          .sort((x, y) => charDef(y).souls - charDef(x).souls || hpLeft(g, x) - hpLeft(g, y))[0];
        if (ko) return play(ko.uid);
        const t = [...targets].sort((x, y) => hpLeft(g, x) - hpLeft(g, y))[0];
        if (t && hpLeft(g, t) < hpLeft(g, foe.active) && hpLeft(g, t) <= 60 && !e.coin)
          return play(t.uid);
        if (t && e.coin && hpLeft(g, t) <= 60) return play(t.uid);
        break;
      }
      case "switch": {
        const t = [...targets].sort((x, y) => hpLeft(g, y) - hpLeft(g, x))[0];
        if (a && t && (a.statuses.length > 0 || hpLeft(g, a) <= 30) && hpLeft(g, t) > hpLeft(g, a))
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
    const foeA = g.players[other(pid)].active;
    const score = (c: InPlay) => {
      const ready = charDef(c).attacks.filter((x) => attackCost(g, pid, x) <= c.energy);
      const best = Math.max(0, ...ready.map((x) => x.damage));
      const ko =
        foeA && best > 0 && applyDefense(g, other(pid), c, foeA, best) >= hpLeft(g, foeA) ? 200 : 0;
      return ko + best + hpLeft(g, c) + c.energy * 15;
    };
    const b = [...me.bench].sort((x, y) => score(y) - score(x))[0];
    return b ? { type: "promote", uid: b.uid } : null;
  }
  if (g.phase === "opening") return g.opening?.ready[pid] ? null : { type: "ready", pid };
  if (g.phase === "setup") {
    const b = (pid === "me" || g.pvp) && !me.active ? bestBasic(me.hand) : undefined;
    return b ? { type: "chooseActive", uid: b.uid } : null;
  }
  if (g.turn !== pid) return null;
  if (g.peek) return g.peek.pid === pid ? { type: "peek", keep: keepPeek(g, pid) } : null;
  if (g.search) return aiSearch(g, pid);

  for (const c of me.hand) {
    const t = evolveTargets(g, pid, c)[0];
    if (t) return { type: "evolve", uid: c.uid, target: t.uid };
  }
  const basic = me.hand
    .filter((c) => canBench(g, pid, c))
    .sort((x, y) => benchValue(y) - benchValue(x))[0];
  if (basic) return { type: "playBasic", uid: basic.uid };

  const sup = pickSupport(g, pid);
  if (sup) return sup;

  for (const c of inPlay(me))
    if (canUseAbility(g, pid, c) && abilityWorthIt(g, pid, c))
      return { type: "ability", target: c.uid };

  const a = me.active;
  const foe = g.players[other(pid)].active;
  // retreat a badly hurt character if a healthier one waits on the bench
  if (a && foe && !retreatBlock(g, pid)) {
    const t = [...me.bench].sort((x, y) => hpLeft(g, y) - hpLeft(g, x))[0];
    const threatened = hpLeft(g, a) <= 30 && charDef(a).souls >= 1;
    if (t && threatened && hpLeft(g, t) >= 60 && !bestAttack(g, pid)?.ko)
      return { type: "retreat", target: t.uid };
    const striker = me.bench.find((b) =>
      charDef(b).attacks.some(
        (x) =>
          attackCost(g, pid, x) <= b.energy &&
          x.damage > 0 &&
          applyDefense(g, other(pid), b, foe, x.damage) >= hpLeft(g, foe),
      ),
    );
    if (striker && !bestAttack(g, pid)?.ko && retreatCost(g, pid, a) <= 1 && g.turnNo > 1)
      return { type: "retreat", target: striker.uid };
  }

  const energy = me.hand.find((c) => canAttach(g, pid, c));
  if (energy && a) {
    const benchT = [...me.bench]
      .filter((b) => energyNeed(g, pid, b) > 0)
      .sort(
        (x, y) => charDef(y).hp - charDef(x).hp || energyNeed(g, pid, x) - energyNeed(g, pid, y),
      )[0];
    // don't over-invest in an active that is about to fall without hitting back
    const doomed = energyNeed(g, pid, a) > 1 && hpLeft(g, a) <= 30 && benchT;
    const target = energyNeed(g, pid, a) > 0 && !doomed ? a : (benchT ?? a);
    return { type: "attach", uid: energy.uid, target: target.uid };
  }

  const atk = bestAttack(g, pid);
  if (atk) return { type: "attack", index: atk.index, ...(atk.fuel ? { fuel: atk.fuel } : {}) };
  return { type: "endTurn" };
}

/** Cards the side draws at the start of each turn (Tron Bestii openly draws one more). */
const drawsPerTurn = (g: Game, pid: PlayerId) => 1 + (pid === "ai" ? g.aiExtraDraw : 0);

/**
 * Draw abilities are skipped when the deck runs low — an empty deck at the start of a turn loses,
 * so the computer keeps enough cards for about 8 more turns.
 */
function abilityWorthIt(g: Game, pid: PlayerId, c: InPlay): boolean {
  const e = charDef(c).ability?.effect;
  const p = g.players[pid];
  const reserve = 8 * drawsPerTurn(g, pid);
  if (e?.k === "drawOnce") return p.deck.length > reserve;
  if (e?.k === "drawUntil") return p.deck.length - Math.max(0, e.n - p.hand.length) > reserve;
  return true;
}
