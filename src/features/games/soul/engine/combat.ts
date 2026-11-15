/** Energy cards in hand that a "fuel" attack may discard. */
export const handEnergy = (g: Game, pid: PlayerId) =>
  g.players[pid].hand.filter((c) => c.cardId === ENERGY_ID[g.players[pid].side]);

/** How many energy cards from hand the attack can burn right now (0 if it has no fuel effect). */
export function fuelMax(g: Game, pid: PlayerId, atk: AttackDef): number {
  const f = atk.effects?.find((e) => e.k === "fuel");
  return f && f.k === "fuel" ? Math.min(f.max, handEnergy(g, pid).length) : 0;
}

/** Damage, knock-outs (souls), checkup between turns and turn order. */
import { ENERGY_ID, getCard, SOULS_TO_WIN } from "../data/cards";
import type { AbilityEffect, AttackDef, PlaceRule, SupportDef } from "../data/types";
import { FINISH_BONUS, STATUS_INFO } from "../data/types";
import { emit } from "./events";
import {
  charDef,
  coin,
  draw,
  hpLeft,
  inPlay,
  log,
  maxHp,
  nameOf,
  nameOfPlayer,
  other,
  say,
  type Game,
  type InPlay,
  type PlayerId,
} from "./state";

/** Whether the place in play (whoever owns it) enforces this rule on both players. */
export function placeRule(g: Game, rule: PlaceRule): boolean {
  if (!g.place) return false;
  const e = (getCard(g.place.cardId) as SupportDef).effect;
  return e.k === "place" && e.rule === rule;
}

/** Ability effects of a player's characters in play (none while a place blocks abilities). */
export function abilities(g: Game, pid: PlayerId): AbilityEffect[] {
  if (placeRule(g, "noAbilities")) return [];
  return inPlay(g.players[pid]).flatMap((c) => {
    const a = charDef(c).ability;
    return a ? [a.effect] : [];
  });
}
const own = (g: Game, c: InPlay): AbilityEffect | undefined =>
  placeRule(g, "noAbilities") ? undefined : charDef(c).ability?.effect;

export function placeAura(g: Game, pid: PlayerId) {
  if (!g.place || g.place.owner !== pid) return null;
  const e = (getCard(g.place.cardId) as SupportDef).effect;
  return e.k === "place" ? e : null;
}

/** Damage reduction a place gives the characters of `pid`. */
export const placeArmor = (g: Game, pid: PlayerId) => placeAura(g, pid)?.armor ?? 0;

export function retreatCost(g: Game, pid: PlayerId, c: InPlay): number {
  if (abilities(g, pid).some((a) => a.k === "freeRetreat")) return 0;
  return Math.max(0, charDef(c).retreat - (placeAura(g, pid)?.retreatMinus ?? 0));
}

/** Flat bonus damage (abilities, place, finish) — before weakness. */
export function bonusDamage(g: Game, pid: PlayerId, attacker: InPlay): number {
  const ab = abilities(g, pid).reduce((s, a) => s + (a.k === "attackBonus" ? a.n : 0), 0);
  return ab + (placeAura(g, pid)?.attackBonus ?? 0) + FINISH_BONUS[attacker.finish].damage;
}

/** Owner of a character in play (null for a character that is not on the table). */
const ownerOf = (g: Game, c: InPlay): PlayerId | null =>
  (["me", "ai"] as const).find((pid) => inPlay(g.players[pid]).some((x) => x.uid === c.uid)) ??
  null;

/** Whether the defender's weakness applies to this attacker (places and `noWeakness` abilities —
 *  also from the bench — may switch weakness off). */
export function isWeak(g: Game, attacker: InPlay, defender: InPlay): boolean {
  if (placeRule(g, "noWeakness") || charDef(defender).weakness !== charDef(attacker).element)
    return false;
  const owner = ownerOf(g, defender);
  return !owner || !abilities(g, owner).some((a) => a.k === "noWeakness");
}

/** Final damage to the defending character of `defPid` (weakness ×2, armor, place armor, shield). */
export function applyDefense(
  g: Game,
  defPid: PlayerId,
  attacker: InPlay,
  defender: InPlay,
  raw: number,
): number {
  if (raw <= 0) return 0;
  let d = raw;
  if (isWeak(g, attacker, defender)) d *= 2;
  const ab = own(g, defender);
  if (ab?.k === "armor") d -= ab.n;
  d -= placeArmor(g, defPid) + defender.shield;
  return Math.max(0, d);
}

/** Damage an attack would deal now (coin flips counted as tails) — used by AI and UI preview. */
export function previewDamage(g: Game, pid: PlayerId, atk: AttackDef, fuel = 0): number {
  const me = g.players[pid].active;
  const foe = g.players[other(pid)].active;
  if (!me || !foe || atk.damage === 0) return 0;
  let raw = atk.damage + bonusDamage(g, pid, me);
  for (const e of atk.effects ?? []) {
    if (e.k === "revenge") raw += Math.floor(me.damage / 10) * e.n;
    if (e.k === "fuel") raw += Math.min(fuel, e.max) * e.n;
  }
  return applyDefense(g, other(pid), me, foe, raw);
}

export function hurt(g: Game, target: InPlay, amount: number, weak = false) {
  if (amount <= 0) return;
  target.damage += amount;
  g.hit = { uid: target.uid, amount, seq: ++g.seq };
  emit(g, { t: "damage", uid: target.uid, amount, weak });
}

/** Heals and records an animation frame (no-op frames are skipped). */
export function healAll(g: Game, cs: InPlay[], n: number) {
  const hurtOnes = cs.filter((c) => c.damage > 0);
  if (n <= 0 || !hurtOnes.length) return;
  for (const c of hurtOnes) heal(c, n);
  emit(g, { t: "heal", uids: hurtOnes.map((c) => c.uid), amount: n });
}

export function heal(c: InPlay, n: number) {
  c.damage = Math.max(0, c.damage - n);
}

export function addStatus(g: Game, c: InPlay, s: InPlay["statuses"][number]) {
  if (own(g, c)?.k === "statusImmune") {
    log(g, `${nameOf(c)} jest odporna na ${STATUS_INFO[s].label.toLowerCase()}.`);
    emit(g, { t: "cleanse", uids: [c.uid] });
    return;
  }
  if (!c.statuses.includes(s)) c.statuses.push(s);
  if (s === "paralyzed") c.paralyzedUntil = g.turnNo + 1;
  log(g, `${nameOf(c)}: ${STATUS_INFO[s].emoji} ${STATUS_INFO[s].label.toLowerCase()}.`);
  emit(g, { t: "status", uid: c.uid, s });
}

export function discardEnergy(g: Game, pid: PlayerId, c: InPlay, n: number) {
  const k = Math.min(n, c.energy);
  c.energy -= k;
  const p = g.players[pid];
  for (let i = 0; i < k; i++)
    p.discard.push({ uid: g.nextUid++, cardId: ENERGY_ID[p.side], finish: "plain" });
  if (k) emit(g, { t: "discardEnergy", uid: c.uid, n: k });
}

function knockOut(g: Game, owner: PlayerId, c: InPlay) {
  const p = g.players[owner];
  const taker = g.players[other(owner)];
  const energy = c.energy;
  c.energy = 0;
  for (let i = 0; i < energy; i++)
    p.discard.push({ uid: g.nextUid++, cardId: ENERGY_ID[p.side], finish: "plain" });
  p.discard.push(...c.under, { uid: c.uid, cardId: c.cardId, finish: c.finish });
  if (p.active?.uid === c.uid) p.active = null;
  p.bench = p.bench.filter((b) => b.uid !== c.uid);
  emit(g, { t: "ko", pid: owner, uid: c.uid });
  const n = Math.min(charDef(c).souls, taker.prizes.length);
  taker.souls += n;
  taker.hand.push(...taker.prizes.splice(0, n));
  emit(g, { t: "souls", pid: other(owner), n });
  const souls = n === 2 ? "2 dusze" : "duszę";
  const takerName = nameOfPlayer(g, other(owner));
  say(
    g,
    owner,
    `Twoja postać ${nameOf(c)} schodzi z pola. ${g.pvp ? `${takerName} ocala` : "Pomioty przejmują"} ${souls}! 🕊️`,
    `Pomiot ${nameOf(c)} schodzi z pola. Ocalasz ${souls}! 🕊️`,
    (name) => `Postać gracza ${name} (${nameOf(c)}) schodzi z pola. Ocalasz ${souls}! 🕊️`,
  );
}

/** Removes knocked-out characters; returns who has to pick a new active (null if nobody / game over). */
export function resolveKOs(g: Game): PlayerId | null {
  for (const pid of ["me", "ai"] as const)
    for (const c of inPlay(g.players[pid])) if (c.damage >= maxHp(c)) knockOut(g, pid, c);
  for (const pid of [g.turn, other(g.turn)]) {
    const p = g.players[pid];
    if (p.souls >= SOULS_TO_WIN || p.prizes.length === 0) {
      return finish(g, pid, {
        win: "Ocaliłeś wszystkie dusze!",
        lose: g.pvp
          ? `${nameOfPlayer(g, pid)} ocala wszystkie dusze.`
          : "Pomioty przejęły wszystkie dusze.",
      });
    }
  }
  for (const pid of [other(g.turn), g.turn]) {
    const p = g.players[pid];
    if (!p.active && !p.bench.length)
      return finish(g, other(pid), {
        win: g.pvp
          ? `${nameOfPlayer(g, pid)} nie ma już żadnej postaci na polu!`
          : "Na polu nie został żaden pomiot!",
        lose: "Nie została Ci żadna postać.",
      });
  }
  let needs: PlayerId | null = null;
  for (const pid of ["ai", "me"] as const) {
    const p = g.players[pid];
    if (p.active) continue;
    // the computer promotes at once; people choose (in a two-player duel one after the other)
    if (pid === "ai" && !g.pvp) promoteBest(g, pid);
    else needs ??= pid;
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
  say(
    g,
    pid,
    `Do walki staje: ${nameOf(c)}.`,
    `Wychodzi: ${nameOf(c)}.`,
    (n) => `${n} wystawia do walki: ${nameOf(c)}.`,
  );
  emit(g, { t: "toActive", pid, uid: c.uid });
}

/** Ends the duel; `win` / `lose` are the reason as read by the winner / the loser. */
function finish(g: Game, winner: PlayerId, reason: { win: string; lose: string }): null {
  g.phase = "over";
  g.winner = winner;
  const forMe = winner === "me" ? reason.win : reason.lose;
  const forAi = winner === "ai" ? reason.win : reason.lose;
  g.reason = forMe;
  if (g.pvp) g.pvp.reason = forAi;
  const line = (pid: PlayerId, r: string) =>
    winner === pid ? `Zwycięstwo! ${r}` : `Porażka. ${r}`;
  log(g, line("me", forMe), line("ai", forAi));
  emit(g, { t: "over", winner });
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
  emit(g, { t: "turn", pid });
  if (!draw(g, pid, 1)) {
    finish(g, other(pid), {
      win: g.pvp
        ? `Talia gracza ${nameOfPlayer(g, pid)} się skończyła — nie może dobrać karty.`
        : "Talia pomiotów się skończyła — nie mogą dobrać karty.",
      lose: "Talia się skończyła — nie możesz dobrać karty.",
    });
    return;
  }
  say(
    g,
    pid,
    `Tura ${g.turnNo}: Twój ruch.`,
    `Tura ${g.turnNo}: ruch pomiotów.`,
    (n) => `Tura ${g.turnNo}: ruch gracza ${n}.`,
  );
  if (pid === "ai" && g.aiExtraDraw) draw(g, pid, g.aiExtraDraw);
  const placeDraw = placeAura(g, pid)?.extraDraw ?? 0;
  if (placeDraw && draw(g, pid, placeDraw))
    log(g, `${getCard(g.place!.cardId).name}: dodatkowa karta.`);
  const left = g.players[pid].deck.length;
  if (left <= 3) {
    const rest =
      left === 0
        ? "nie ma już kart — kolejne dobranie to porażka"
        : left === 1
          ? "została 1 karta"
          : `zostały ${left} karty`;
    say(
      g,
      pid,
      `Uwaga: w Twojej talii ${rest}.`,
      `Uwaga: w talii pomiotów ${rest}.`,
      (n) => `Uwaga: w talii gracza ${n} ${rest}.`,
    );
  }
}

/** Checkup between turns, then hands the turn over (or asks the player to promote). */
export function endTurn(g: Game) {
  if (g.phase === "over") return;
  const pid = g.turn;
  const endHeal = placeAura(g, pid)?.endHeal ?? 0;
  for (const c of inPlay(g.players[pid])) {
    const a = own(g, c);
    healAll(g, [c], endHeal + (a?.k === "endHeal" ? a.n : 0));
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
      emit(g, { t: "cleanse", uids: [c.uid] });
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
