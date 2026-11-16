/**
 * Win streak against the computer and the saints' tales it unlocks: the 1st tale after 5 wins in a
 * row, the 2nd after 10 more, the 3rd after 15 more (the streak starts over at every unlock).
 * Leaving a duel or reloading the page during one breaks the streak: the streak is "staked" when
 * the duel starts and only a win gives it back (+1).
 * Alternative route: the tales also unlock after 100, 300 and 800 rewarded duels played in total
 * (wins or defeats, practice and the tutorial don't count).
 */
import { TALE_CARDS } from "../data/tales";
import { keyOf, type Profile } from "./profile";

export const TALE_ORDER: readonly string[] = TALE_CARDS.map((c) => c.id);
/** Wins in a row needed for tale number `unlocked` (0-based). */
export const streakNeeded = (unlocked: number) => 5 * (unlocked + 1);

/** Rewarded duels played in total needed for tale number `unlocked` (0-based). */
export const DUELS_NEEDED: readonly number[] = [100, 300, 800];

/** Rewarded duels played so far (older saves: wins + losses). */
export const duelsPlayed = (p: Profile) => p.duels ?? p.wins + p.losses;

/** A rewarded duel starts: it is counted and the current streak is at stake. */
export const stakeStreak = (p: Profile): Profile => ({
  ...p,
  duels: duelsPlayed(p) + 1,
  staked: p.streak ?? 0,
  streak: 0,
});

/** The saint whose tale is waiting to be read (unlocked, card not won yet). */
export function pendingTale(p: Profile): string | null {
  const won = p.saints?.length ?? 0;
  return (p.tales ?? 0) > won ? (TALE_ORDER[won] ?? null) : null;
}

/** A rewarded duel ended (a forfeit is a defeat). Returns the saint whose tale this win unlocked. */
export function settleStreak(p: Profile, won: boolean): { profile: Profile; tale: string | null } {
  const base = { ...p, staked: undefined };
  const streak = won ? (p.staked ?? p.streak ?? 0) + 1 : 0;
  const tales = p.tales ?? 0;
  const byStreak = streak >= streakNeeded(tales);
  const byDuels = duelsPlayed(p) >= (DUELS_NEEDED[tales] ?? Infinity);
  if (!pendingTale(p) && tales < TALE_ORDER.length && (byStreak || byDuels)) {
    const next = { ...base, streak: 0, tales: tales + 1 };
    return { profile: next, tale: pendingTale(next) };
  }
  return { profile: { ...base, streak }, tale: null };
}

/** All quiz answers were right: the saint's stained-glass card goes to the collection. */
export function completeTale(p: Profile, cardId: string): Profile {
  if (pendingTale(p) !== cardId) return p;
  const k = keyOf(cardId, "stained");
  return {
    ...p,
    saints: [...(p.saints ?? []), cardId],
    collection: { ...p.collection, [k]: (p.collection[k] ?? 0) + 1 },
  };
}
