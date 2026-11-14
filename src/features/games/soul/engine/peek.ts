/** Peek cards (Różaniec, Powiadomienie — like Trekking Shoes): keep the revealed top card or swap it. */
import { getCard, isCharacter } from "../data/cards";
import { emit } from "./events";
import { draw, nameOf, say, shuffle, type Game, type PlayerId } from "./state";

/** Keep the revealed top card, or discard it and draw the next one (Trekking Shoes). */
export function resolvePeek(g: Game, pid: PlayerId, keep: boolean): boolean {
  const pk = g.peek;
  const me = g.players[pid];
  if (!pk || pk.pid !== pid) return false;
  g.peek = null;
  const i = me.deck.findIndex((c) => c.uid === pk.uid);
  if (i < 0) return true;
  const [card] = me.deck.splice(i, 1);
  if (keep) {
    me.hand.push(card!);
    say(
      g,
      pid,
      `Bierzesz do ręki: ${nameOf(card!)}.`,
      "Pomioty biorą kartę do ręki.",
      (n) => `${n} bierze kartę do ręki.`,
    );
    emit(g, { t: "peek", pid, uid: card!.uid, kept: true });
    return true;
  }
  me.discard.push(card!);
  say(
    g,
    pid,
    `Odrzucasz: ${nameOf(card!)} i dobierasz kolejną kartę.`,
    `Pomioty odrzucają: ${nameOf(card!)} i dobierają kolejną kartę.`,
    (n) => `${n} odrzuca: ${nameOf(card!)} i dobiera kolejną kartę.`,
  );
  emit(g, { t: "peek", pid, uid: card!.uid, kept: false });
  draw(g, pid, 1);
  return true;
}

/** Ultra-ball cards: discard the chosen hand cards, take the chosen character from the deck. */
export function resolveSearch(g: Game, pid: PlayerId, discard: number[], pick: number): boolean {
  const s = g.search;
  const me = g.players[pid];
  if (!s || s.pid !== pid) return false;
  const uids = new Set(discard);
  if (uids.size !== s.discard || discard.some((u) => !me.hand.some((c) => c.uid === u)))
    return false;
  const card = me.deck.find((c) => c.uid === pick);
  if (!card || !isCharacter(getCard(card.cardId))) return false;
  g.search = null;
  me.discard.push(...me.hand.filter((c) => uids.has(c.uid)));
  me.hand = me.hand.filter((c) => !uids.has(c.uid));
  me.deck = me.deck.filter((c) => c !== card);
  me.hand.push(card);
  shuffle(g, me.deck);
  emit(g, { t: "shuffle", pid });
  emit(g, { t: "draw", pid, n: 1 });
  say(
    g,
    pid,
    `Do ręki trafia: ${nameOf(card)}.`,
    `Pomioty biorą z talii: ${nameOf(card)}.`,
    (n) => `${n} bierze z talii: ${nameOf(card)}.`,
  );
  return true;
}
