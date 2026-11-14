/** The reducer of a duel: every player (and computer) move goes through `dispatch`. */
import { BENCH_SIZE, ENERGY_ID, getCard, isBasic } from "../data/cards";
import type { AttackDef, CardDef } from "../data/types";
import {
  addStatus,
  applyDefense,
  bonusDamage,
  discardEnergy,
  endTurn,
  healAll,
  hurt,
  promoteUid,
  resolveKOs,
  retreatCost,
  startTurn,
} from "./combat";
import { canUseAbility, activateAbility } from "./abilities";
import { emit, recordFrames, type Frame } from "./events";
import { resolvePeek } from "./peek";
import { playSupport } from "./support";
import {
  charDef,
  coin,
  draw,
  findInPlay,
  inPlay,
  log,
  nameOf,
  other,
  toInPlay,
  type CardInst,
  type Game,
  type InPlay,
  type PlayerId,
} from "./state";

export type Action =
  | { type: "chooseActive"; uid: number }
  | { type: "playBasic"; uid: number }
  | { type: "evolve"; uid: number; target: number }
  | { type: "attach"; uid: number; target: number }
  | { type: "support"; uid: number; target?: number }
  | { type: "retreat"; target: number }
  | { type: "ability"; target: number }
  | { type: "attack"; index: number }
  | { type: "endTurn" }
  | { type: "promote"; uid: number }
  /** Answer to a peek card: keep the revealed top card, or discard it and draw. */
  | { type: "peek"; keep: boolean };

const def = (c: CardInst): CardDef => getCard(c.cardId);
const canAct = (c: InPlay) => !c.statuses.includes("asleep") && !c.statuses.includes("paralyzed");

/* ── queries used by the UI and the AI ── */
export const canBench = (g: Game, pid: PlayerId, c: CardInst) =>
  g.phase === "main" &&
  !g.peek &&
  g.turn === pid &&
  isBasic(def(c)) &&
  g.players[pid].bench.length < BENCH_SIZE;

export function evolveTargets(g: Game, pid: PlayerId, c: CardInst): InPlay[] {
  const d = def(c);
  if (
    g.phase !== "main" ||
    g.peek ||
    g.turn !== pid ||
    d.kind !== "character" ||
    !d.evolvesFrom ||
    g.turnNo < 3
  )
    return [];
  return inPlay(g.players[pid]).filter(
    (t) => t.cardId === d.evolvesFrom && t.playedTurn < g.turnNo,
  );
}

export const canAttach = (g: Game, pid: PlayerId, c: CardInst) =>
  g.phase === "main" &&
  !g.peek &&
  g.turn === pid &&
  !g.flags.energy &&
  c.cardId === ENERGY_ID[g.players[pid].side];

export function attackBlock(g: Game, pid: PlayerId, atk: AttackDef): string | null {
  const a = g.players[pid].active;
  if (g.phase !== "main" || g.turn !== pid || !a) return "To nie Twoja tura.";
  if (g.peek) return "Najpierw zdecyduj o odkrytej karcie.";
  if (g.turnNo === 1) return "W pierwszej turze gry nie można atakować.";
  if (a.statuses.includes("asleep")) return "Postać śpi.";
  if (a.statuses.includes("paralyzed")) return "Postać jest zatrzymana.";
  if (a.energy < atk.cost) return `Potrzeba ${atk.cost} — dołączono ${a.energy}.`;
  return null;
}

export function retreatBlock(g: Game, pid: PlayerId): string | null {
  const p = g.players[pid];
  if (g.phase !== "main" || g.turn !== pid || !p.active) return "To nie Twoja tura.";
  if (g.peek) return "Najpierw zdecyduj o odkrytej karcie.";
  if (!p.bench.length) return "Ławka jest pusta.";
  if (g.flags.retreated) return "Wycofać można raz na turę.";
  if (!canAct(p.active)) return "Uśpiona lub zatrzymana postać nie może się wycofać.";
  if (p.active.energy < retreatCost(g, pid, p.active))
    return "Za mało dołączonych kart do wycofania.";
  return null;
}

export { canUseAbility };

/* ── moves ── */
function attack(g: Game, pid: PlayerId, index: number): boolean {
  const me = g.players[pid];
  const a = me.active;
  if (!a || !g.players[other(pid)].active) return false;
  const atk = charDef(a).attacks[index];
  if (!atk || attackBlock(g, pid, atk)) return false;
  const foe = g.players[other(pid)];
  const d = foe.active!;
  log(g, `${nameOf(a)} używa: „${atk.name}”.`);
  emit(g, { t: "attack", pid, uid: a.uid, target: d.uid, name: atk.name });
  let raw = atk.damage > 0 ? atk.damage + bonusDamage(g, pid, a) : 0;
  for (const e of atk.effects ?? []) {
    if (e.k === "coin") {
      const h = coin(g);
      log(g, h ? `Orzeł! +${e.n}.` : "Reszka.");
      emit(g, { t: "coin", heads: h });
      if (h) raw += e.n;
    }
    if (e.k === "revenge") raw += Math.floor(a.damage / 10) * e.n;
  }
  const dmg = applyDefense(a, d, raw);
  hurt(g, d, dmg, dmg > 0 && charDef(d).weakness === charDef(a).element);
  if (atk.damage > 0) log(g, `${nameOf(d)} otrzymuje ${dmg} obrażeń.`);
  for (const e of atk.effects ?? []) {
    switch (e.k) {
      case "heal":
        healAll(g, e.target === "all" ? inPlay(me) : [a], e.n);
        break;
      case "status":
        if (e.coin) {
          const h = coin(g);
          emit(g, { t: "coin", heads: h });
          if (h) addStatus(g, d, e.s);
          else log(g, "Reszka — bez efektu.");
        } else addStatus(g, d, e.s);
        break;
      case "bench":
        for (const b of foe.bench) b.damage += e.n;
        if (foe.bench.length) {
          log(g, `Ławka rywala obrywa po ${e.n}.`);
          emit(g, { t: "benchDamage", uids: foe.bench.map((b) => b.uid), amount: e.n });
        }
        break;
      case "draw":
        draw(g, pid, e.n);
        break;
      case "recoil":
        hurt(g, a, e.n);
        break;
      case "cleanse":
        for (const c of inPlay(me)) c.statuses = [];
        emit(g, { t: "cleanse", uids: inPlay(me).map((c) => c.uid) });
        break;
      case "searchEnergy": {
        const t = [...me.bench].sort((x, y) => x.energy - y.energy)[0];
        const i = me.deck.findIndex((c) => c.cardId === ENERGY_ID[me.side]);
        if (t && i >= 0) {
          me.deck.splice(i, 1);
          t.energy++;
          log(g, `${nameOf(t)} dostaje 1 kartę energii z talii.`);
          emit(g, { t: "attach", pid, uid: t.uid, n: 1 });
        }
        break;
      }
      case "discardEnergy":
        discardEnergy(g, other(pid), d, 1);
        break;
    }
  }
  const needs = resolveKOs(g);
  if (g.phase === "over") return true;
  if (needs) {
    g.phase = "promote";
    g.promote = { who: needs, then: "endTurn" };
    return true;
  }
  endTurn(g);
  return true;
}

function apply(g: Game, a: Action): boolean {
  const pid = g.turn;
  const p = g.players[pid];
  const inHand = (uid: number) => p.hand.find((c) => c.uid === uid);
  // a revealed peek card must be answered before anything else happens
  if (g.peek) return a.type === "peek" && resolvePeek(g, pid, a.keep);
  switch (a.type) {
    case "chooseActive": {
      const me = g.players.me;
      const c = me.hand.find((x) => x.uid === a.uid);
      if (g.phase !== "setup" || !c || !isBasic(def(c))) return false;
      me.hand = me.hand.filter((x) => x !== c);
      me.active = toInPlay(c, 0);
      log(g, `Do walki staje: ${nameOf(c)}.`);
      emit(g, { t: "toActive", pid: "me", uid: c.uid });
      startTurn(g, g.first);
      return true;
    }
    case "playBasic": {
      const c = inHand(a.uid);
      if (!c || !canBench(g, pid, c)) return false;
      p.hand = p.hand.filter((x) => x !== c);
      p.bench.push(toInPlay(c, g.turnNo));
      log(g, `${pid === "me" ? "Na ławkę siada" : "Na ławkę pomiotów wchodzi"}: ${nameOf(c)}.`);
      emit(g, { t: "bench", pid, uid: c.uid });
      return true;
    }
    case "evolve": {
      const c = inHand(a.uid);
      const t = c && evolveTargets(g, pid, c).find((x) => x.uid === a.target);
      if (!c || !t) return false;
      p.hand = p.hand.filter((x) => x !== c);
      log(g, `${nameOf(t)} rozwija się w: ${nameOf(c)}!`);
      t.under.push({ uid: c.uid, cardId: t.cardId, finish: t.finish });
      t.cardId = c.cardId;
      t.finish = c.finish;
      t.statuses = [];
      t.playedTurn = g.turnNo;
      emit(g, { t: "evolve", pid, uid: t.uid });
      return true;
    }
    case "attach": {
      const c = inHand(a.uid);
      const t = findInPlay(p, a.target);
      if (!c || !t || !canAttach(g, pid, c)) return false;
      p.hand = p.hand.filter((x) => x !== c);
      t.energy++;
      g.flags.energy = true;
      log(g, `${nameOf(t)} otrzymuje: ${def(c).emoji} ${def(c).name}.`);
      emit(g, { t: "attach", pid, uid: t.uid, n: 1 });
      return true;
    }
    case "support": {
      const c = inHand(a.uid);
      return g.phase === "main" && !!c && playSupport(g, pid, c, a.target);
    }
    case "retreat": {
      const t = p.bench.find((b) => b.uid === a.target);
      if (!t || retreatBlock(g, pid)) return false;
      const old = p.active!;
      discardEnergy(g, pid, old, retreatCost(g, pid, old));
      old.statuses = [];
      p.bench = p.bench.map((b) => (b === t ? old : b));
      p.active = t;
      g.flags.retreated = true;
      log(g, `${nameOf(old)} wycofuje się. Do walki staje: ${nameOf(t)}.`);
      emit(g, { t: "swap", pid });
      return true;
    }
    case "ability": {
      const t = findInPlay(p, a.target);
      if (!t || !canUseAbility(g, pid, t)) return false;
      activateAbility(g, pid, t);
      return true;
    }
    case "attack":
      return attack(g, pid, a.index);
    case "endTurn":
      if (g.phase !== "main") return false;
      endTurn(g);
      return true;
    case "peek":
      return false;
    case "promote": {
      const pr = g.promote;
      if (g.phase !== "promote" || !pr) return false;
      if (!g.players[pr.who].bench.some((b) => b.uid === a.uid)) return false;
      promoteUid(g, pr.who, a.uid);
      g.phase = "main";
      g.promote = null;
      if (pr.then === "endTurn") endTurn(g);
      else startTurn(g, other(g.turn));
      return true;
    }
  }
}

/** Like `dispatch`, plus the animation frames of everything that happened (move by move). */
export function dispatchFrames(g: Game, a: Action): { state: Game; frames: Frame[] } {
  const { result, frames } = recordFrames(() => dispatch(g, a));
  return { state: result, frames: result === g ? [] : frames };
}

/** Pure: returns a new game state, or the same object if the move is not allowed. */
export function dispatch(g: Game, a: Action): Game {
  if (g.phase === "over") return g;
  const next = structuredClone(g);
  return apply(next, a) ? next : g;
}
