/** Peek cards (Różaniec, Powiadomienie — like Trekking Shoes): keep the revealed top card or swap it. */
import { emit } from "./events";
import { draw, log, nameOf, type Game, type PlayerId } from "./state";

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
    log(g, pid === "me" ? `Bierzesz do ręki: ${nameOf(card!)}.` : "Pomioty biorą kartę do ręki.");
    emit(g, { t: "peek", pid, uid: card!.uid, kept: true });
    return true;
  }
  me.discard.push(card!);
  log(
    g,
    pid === "me"
      ? `Odrzucasz: ${nameOf(card!)} i dobierasz kolejną kartę.`
      : `Pomioty odrzucają: ${nameOf(card!)} i dobierają kolejną kartę.`,
  );
  emit(g, { t: "peek", pid, uid: card!.uid, kept: false });
  draw(g, pid, 1);
  return true;
}
