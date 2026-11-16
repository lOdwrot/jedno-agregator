import type { CardInst } from "../engine/state";

export interface DiscardGroup {
  /** The most recently discarded copy (shown and opened). */
  card: CardInst;
  count: number;
}

/**
 * The discard pile from the top (newest first), with identical cards (same card and print)
 * merged into one entry at the place of their newest copy — the order of the pile is kept.
 */
export function groupDiscard(pile: readonly CardInst[]): DiscardGroup[] {
  const out: DiscardGroup[] = [];
  const byKey = new Map<string, DiscardGroup>();
  for (let i = pile.length - 1; i >= 0; i--) {
    const c = pile[i]!;
    const key = `${c.cardId}|${c.finish}`;
    const g = byKey.get(key);
    if (g) g.count++;
    else {
      const fresh = { card: c, count: 1 };
      byKey.set(key, fresh);
      out.push(fresh);
    }
  }
  return out;
}
