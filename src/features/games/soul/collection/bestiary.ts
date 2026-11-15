/**
 * Bestiary progress: which demon cards the player has met in duels and how many times.
 * A card appears in the bestiary after the first sighting (as a greyed-out teaser) and is
 * "recognized" — its details and lesson become readable — after `RECOGNIZE_AT` sightings.
 */
import { DEMON_CARDS } from "../data/demons";
import type { CardDef } from "../data/types";
import type { Profile } from "./profile";

export const RECOGNIZE_AT = 4;

export type BestiaryKind = Exclude<CardDef["kind"], "energy">;

export const BESTIARY_GROUPS: { kind: BestiaryKind; label: string }[] = [
  { kind: "character", label: "Pomioty i demony" },
  { kind: "item", label: "Przedmioty" },
  { kind: "supporter", label: "Pomocnicy" },
  { kind: "place", label: "Miejsca" },
];

/** Every card that can ever be in the bestiary (demon side, no energy). */
export const BESTIARY_CARDS: readonly CardDef[] = DEMON_CARDS.filter((c) => c.kind !== "energy");
const IN_BESTIARY = new Set(BESTIARY_CARDS.map((c) => c.id));

export const sightings = (p: Profile, cardId: string) => p.bestiary?.[cardId] ?? 0;
export const isRecognized = (p: Profile, cardId: string) => sightings(p, cardId) >= RECOGNIZE_AT;

/** One more sighting of a demon card (cards outside the bestiary are ignored). */
export function recordSighting(p: Profile, cardId: string): Profile {
  if (!IN_BESTIARY.has(cardId)) return p;
  return { ...p, bestiary: { ...p.bestiary, [cardId]: sightings(p, cardId) + 1 } };
}

export interface Tally {
  total: number;
  met: number;
  recognized: number;
}

export interface BestiaryGroup extends Tally {
  kind: BestiaryKind;
  label: string;
  /** Only the cards already met, in bestiary order. */
  cards: { card: CardDef; seen: number; recognized: boolean }[];
}

export function bestiaryGroups(p: Profile): BestiaryGroup[] {
  return BESTIARY_GROUPS.map(({ kind, label }) => {
    const all = BESTIARY_CARDS.filter((c) => c.kind === kind);
    const cards = all
      .map((card) => ({ card, seen: sightings(p, card.id) }))
      .filter((x) => x.seen > 0)
      .map((x) => ({ ...x, recognized: x.seen >= RECOGNIZE_AT }));
    return {
      kind,
      label,
      total: all.length,
      met: cards.length,
      recognized: cards.filter((x) => x.recognized).length,
      cards,
    };
  });
}

export function bestiaryTally(groups: BestiaryGroup[]): Tally {
  return groups.reduce(
    (s, g) => ({
      total: s.total + g.total,
      met: s.met + g.met,
      recognized: s.recognized + g.recognized,
    }),
    { total: 0, met: 0, recognized: 0 },
  );
}

export interface Discoveries {
  /** Cards that reached `RECOGNIZE_AT` sightings during the duel. */
  recognized: string[];
  /** Cards met for the first time during the duel (and not yet recognized). */
  met: string[];
  /** Sightings of the listed cards after the duel. */
  seen: Partial<Record<string, number>>;
}

/**
 * What a duel added to the bestiary: `before` is the bestiary at the start of the duel,
 * `during` counts the sightings of the duel. Lists keep the bestiary order.
 */
export function duelDiscoveries(
  before: Profile["bestiary"],
  during: Partial<Record<string, number>>,
): Discoveries {
  const out: Discoveries = { recognized: [], met: [], seen: {} };
  for (const { id } of BESTIARY_CARDS) {
    const add = during[id] ?? 0;
    if (!add) continue;
    const was = before?.[id] ?? 0;
    if (was < RECOGNIZE_AT && was + add >= RECOGNIZE_AT) out.recognized.push(id);
    else if (was === 0) out.met.push(id);
    else continue;
    out.seen[id] = was + add;
  }
  return out;
}
