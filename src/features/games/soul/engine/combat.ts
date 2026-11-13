/** Damage, knock-outs (souls), checkup between turns and turn order. */
import { ENERGY_ID, getCard, SOULS_TO_WIN } from "../data/cards";
import type { AbilityEffect, AttackDef, SupportDef } from "../data/types";
import { FINISH_BONUS, STATUS_INFO } from "../data/types";
import {
  charDef,
  coin,
  draw,
  hpLeft,
  inPlay,
  log,
  maxHp,
  nameOf,
  other,
  shuffle,
  type Game,
  type InPlay,
  type PlayerId,
} from "./state";

/** Ability effects of a player's characters in play. */
export function abilities(g: Game, pid: PlayerId): AbilityEffect[] {
  return inPlay(g.players[pid]).flatMap((c) => {
    const a = charDef(c).ability;
    return a ? [a.effect] : [];
  });
}
const own = (c: InPlay): AbilityEffect | undefined => charDef(c).ability?.effect;

export function placeAura(g: Game, pid: PlayerId) {
  if (!g.place || g.place.owner !== pid) return null;
  const e = (getCard(g.place.cardId) as SupportDef).effect;
  return e.k === "place" ? e : null;
}

export function retreatCost(g: Game, pid: PlayerId, c: InPlay): number {
  if (abilities(g, pid).some((a) => a.k === "freeRetreat")) return 0;
  return Math.max(0, charDef(c).retreat - (placeAura(g, pid)?.retreatMinus ?? 0));
}

/** Flat bonus damage (abilities, place, finish) — before weakness. */
export function bonusDamage(g: Game, pid: PlayerId, attacker: InPlay): number {
  const ab = abilities(g, pid).reduce((s, a) => s + (a.k === "attackBonus" ? a.n : 0), 0);
  return ab + (placeAura(g, pid)?.attackBonus ?? 0) + FINISH_BONUS[attacker.finish].damage;
}

/** Final damage to the defending character (weakness ×2, armor, shield). */
export function applyDefense(attacker: InPlay, defender: InPlay, raw: number): number {
  if (raw <= 0) return 0;
  let d = raw;
  if (charDef(defender).weakness === charDef(attacker).element) d *= 2;
  const ab = own(defender);
  if (ab?.k === "armor") d -= ab.n;
  d -= defender.shield;
  return Math.max(0, d);
}

/** Damage an attack would deal now (coin flips counted as tails) — used by AI and UI preview. */
export function previewDamage(g: Game, pid: PlayerId, atk: AttackDef): number {
  const me = g.players[pid].active;
  const foe = g.players[other(pid)].active;
  if (!me || !foe || atk.damage === 0) return 0;
  let raw = atk.damage + bonusDamage(g, pid, me);
  for (const e of atk.effects ?? []) if (e.k === "revenge") raw += Math.floor(me.damage / 10) * e.n;
  return applyDefense(me, foe, raw);
}

export function hurt(g: Game, target: InPlay, amount: number) {
  if (amount <= 0) return;
  target.damage += amount;
  g.hit = { uid: target.uid, amount, seq: ++g.seq };
}

export function heal(c: InPlay, n: number) {
  c.damage = Math.max(0, c.damage - n);
}

export function addStatus(g: Game, c: InPlay, s: InPlay["statuses"][number]) {
  if (own(c)?.k === "statusImmune") {
    log(g, `${nameOf(c)} jest odporna na ${STATUS_INFO[s].label.toLowerCase()}.`);
    return;
  }
  if (!c.statuses.includes(s)) c.statuses.push(s);
  if (s === "paralyzed") c.paralyzedUntil = g.turnNo + 1;
  log(g, `${nameOf(c)}: ${STATUS_INFO[s].emoji} ${STATUS_INFO[s].label.toLowerCase()}.`);
}

export function discardEnergy(g: Game, pid: PlayerId, c: InPlay, n: number) {
  const k = Math.min(n, c.energy);
  c.energy -= k;
  const p = g.players[pid];
  for (let i = 0; i < k; i++)
    p.discard.push({ uid: g.nextUid++, cardId: ENERGY_ID[p.side], finish: "plain" });
}

function knockOut(g: Game, owner: PlayerId, c: InPlay) {
  const p = g.players[owner];
  const taker = g.players[other(owner)];
  discardEnergy(g, owner, c, c.energy);
  p.discard.push(...c.under, { uid: c.uid, cardId: c.cardId, finish: c.finish });
  if (p.active?.uid === c.uid) p.active = null;
  p.bench = p.bench.filter((b) => b.uid !== c.uid);
  const n = Math.min(charDef(c).souls, taker.prizes.length);
  taker.souls += n;
  taker.hand.push(...taker.prizes.splice(0, n));
  const who = owner === "me" ? "Twoja postać" : "Pomiot";
  log(
    g,
    `${who} ${nameOf(c)} schodzi z pola. ${owner === "me" ? "Pomioty przejmują" : "Ocalasz"} ${n === 2 ? "2 dusze" : "duszę"}! 🕊️`,
  );
}

/** Removes knocked-out characters; returns who has to pick a new active (null if nobody / game over). */
export function resolveKOs(g: Game): PlayerId | null {
  for (const pid of ["me", "ai"] as const)
    for (const c of inPlay(g.players[pid])) if (c.damage >= maxHp(c)) knockOut(g, pid, c);
  for (const pid of [g.turn, other(g.turn)]) {
    const p = g.players[pid];
    if (p.souls >= SOULS_TO_WIN || p.prizes.length === 0) {
      return finish(
        g,
        pid,
        pid === "me" ? "Ocaliłeś wszystkie dusze!" : "Pomioty przejęły wszystkie dusze.",
      );
    }
  }
  for (const pid of [other(g.turn), g.turn]) {
    const p = g.players[pid];
    if (!p.active && !p.bench.length)
      return finish(
        g,
        other(pid),
        pid === "ai" ? "Na polu nie został żaden pomiot!" : "Nie została Ci żadna postać.",
      );
  }
  let needs: PlayerId | null = null;
  for (const pid of ["ai", "me"] as const) {
    const p = g.players[pid];
    if (p.active) continue;
    if (pid === "ai") promoteBest(g, pid);
    else needs = "me";
  }
  return needs;
}

export function promoteBest(g: Game, pid: PlayerId) {
  const p = g.players[pid];
  const best = [...p.bench].sort(
    (a, b) => hpLeft(b) + b.energy * 15 - (hpLeft(a) + a.energy * 15),
  )[0];
  if (best) promoteUid(g, pid, best.uid);
}

export function promoteUid(g: Game, pid: PlayerId, uid: number) {
  const p = g.players[pid];
  const c = p.bench.find((b) => b.uid === uid);
  if (!c) return;
  p.bench = p.bench.filter((b) => b !== c);
  p.active = c;
  log(g, `${pid === "me" ? "Do walki staje" : "Wychodzi"}: ${nameOf(c)}.`);
}

function finish(g: Game, winner: PlayerId, reason: string): null {
  g.phase = "over";
  g.winner = winner;
  g.reason = reason;
  log(g, winner === "me" ? `Zwycięstwo! ${reason}` : `Porażka. ${reason}`);
  return null;
}

/** Re-reads the phase (TS narrows it too eagerly after mutating calls). */
export const isOver = (g: Game) => (g.phase as Game["phase"]) === "over";

export function startTurn(g: Game, pid: PlayerId) {
  g.turn = pid;
  g.turnNo++;
  g.phase = "main";
  g.promote = null;
  g.flags = { energy: false, supporter: false, retreated: false };
  for (const c of inPlay(g.players[pid])) c.shield = 0;
  const p = g.players[pid];
  if (!p.deck.length && p.discard.length) {
    p.deck.push(...p.discard.splice(0));
    shuffle(g, p.deck);
    log(
      g,
      `${pid === "me" ? "Twoja talia" : "Talia pomiotów"} się skończyła — odrzucone karty wracają do talii.`,
    );
  }
  if (!draw(g, pid, 1)) {
    finish(
      g,
      other(pid),
      pid === "me" ? "Skończyły Ci się karty w talii." : "Pomiotom skończyły się karty.",
    );
    return;
  }
  log(g, pid === "me" ? `Tura ${g.turnNo}: Twój ruch.` : `Tura ${g.turnNo}: ruch pomiotów.`);
}

/** Checkup between turns, then hands the turn over (or asks the player to promote). */
export function endTurn(g: Game) {
  if (g.phase === "over") return;
  const pid = g.turn;
  const endHeal = placeAura(g, pid)?.endHeal ?? 0;
  for (const c of inPlay(g.players[pid])) {
    const a = own(c);
    heal(c, endHeal + (a?.k === "endHeal" ? a.n : 0));
  }
  for (const who of ["me", "ai"] as const) {
    const c = g.players[who].active;
    if (!c) continue;
    if (c.statuses.includes("poisoned")) {
      hurt(g, c, 10);
      log(g, `${nameOf(c)} traci 10 przez zwątpienie.`);
    }
    if (c.statuses.includes("asleep") && coin(g)) {
      c.statuses = c.statuses.filter((s) => s !== "asleep");
      log(g, `${nameOf(c)} budzi się (orzeł).`);
    }
    if (c.statuses.includes("paralyzed") && c.paralyzedUntil <= g.turnNo)
      c.statuses = c.statuses.filter((s) => s !== "paralyzed");
  }
  const needs = resolveKOs(g);
  if (isOver(g)) return;
  if (needs) {
    g.phase = "promote";
    g.promote = { who: needs, then: "startNext" };
    return;
  }
  startTurn(g, other(pid));
}
