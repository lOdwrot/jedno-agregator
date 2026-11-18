/**
 * The card pool of "Idealny oponent" and the rules its decks keep — the same as the player's:
 * 50 cards, at most 3 copies of a card (1 of a `unique` one, energy aside), at least 5 basic characters and every
 * evolution together with its previous stage. Plain prints only: no stained bonus, no extra draw.
 */
import {
  DECK_SIZE,
  ENERGY_ID,
  getCard,
  isBasic,
  isCharacter,
  maxCopies,
  MIN_BASICS,
} from "../data/cards";
import { DEMON_CARDS } from "../data/demons";
import { OPPONENTS } from "../data/opponents";
import type { CardDef, Rarity } from "../data/types";
import type { DeckList } from "../engine/state";

/** Non-energy demon cards with their number of copies (energy fills the deck up to 50). */
export type Genome = Record<string, number>;

export const MIN_ENERGY = 8;
export const MAX_ENERGY = 22;

const ENERGY = ENERGY_ID.demons;

/** Every demon card except the energy (`unique` ones like Antypapież at most once, see `maxCopies`). */
export const POOL: readonly CardDef[] = DEMON_CARDS.filter((c) => c.kind !== "energy");

/** How strongly a mutation prefers a card: the strong (rare, legendary) cards first. */
const WEIGHT: Record<Rarity, number> = { common: 1, uncommon: 2, rare: 4, legendary: 6 };
const WEIGHTS = POOL.map((c) => WEIGHT[c.rarity]);
const TOTAL = WEIGHTS.reduce((a, b) => a + b, 0);

export function weightedCard(rnd: () => number): CardDef {
  let r = rnd() * TOTAL;
  for (let i = 0; i < POOL.length; i++) {
    r -= WEIGHTS[i]!;
    if (r < 0) return POOL[i]!;
  }
  return POOL.at(-1)!;
}

export const size = (g: Genome) => Object.values(g).reduce((a, b) => a + b, 0);
export const energyOf = (g: Genome) => DECK_SIZE - size(g);
const basics = (g: Genome) =>
  Object.entries(g).reduce((n, [id, k]) => n + (isBasic(getCard(id)) ? k : 0), 0);

/** Ids of every stage below `id` (Legion → Kajdany nałogu → Tylko ten jeden raz). */
export function lineOf(id: string): string[] {
  const out: string[] = [];
  let c = getCard(id);
  while (isCharacter(c) && c.evolvesFrom) {
    out.push(c.evolvesFrom);
    c = getCard(c.evolvesFrom);
  }
  return out;
}

const pick = <T>(xs: readonly T[], rnd: () => number): T => xs[Math.floor(rnd() * xs.length)]!;

/** Bring a genome back within the rules (copies, previous stages, basics, energy count). */
export function repair(input: Genome, rnd: () => number): Genome {
  const g: Genome = {};
  for (const [id, n] of Object.entries(input)) {
    const k = Math.min(maxCopies(id), Math.floor(n));
    if (k > 0 && id !== ENERGY) g[id] = k;
  }
  const withStages = () => {
    for (const id of Object.keys(g)) for (const below of lineOf(id)) if (!g[below]) g[below] = 1;
  };
  withStages();
  // too many cards (too little energy): drop copies, never the last stage holding an evolution up
  for (let guard = 0; energyOf(g) < MIN_ENERGY && guard < 500; guard++) {
    const ids = Object.keys(g);
    const id = pick(ids, rnd);
    const needed = ids.some((x) => lineOf(x).includes(id));
    if (needed && g[id] === 1) continue;
    if (isBasic(getCard(id)) && basics(g) <= MIN_BASICS && g[id] === 1) continue;
    if (--g[id]! === 0) delete g[id];
  }
  for (let guard = 0; basics(g) < MIN_BASICS && guard < 100; guard++) {
    const free = POOL.filter((c) => isBasic(c) && (g[c.id] ?? 0) < maxCopies(c.id));
    const c = pick(free, rnd);
    g[c.id] = (g[c.id] ?? 0) + 1;
    if (energyOf(g) < MIN_ENERGY) {
      const spare = Object.keys(g).filter(
        (x) => !isBasic(getCard(x)) && !Object.keys(g).some((y) => lineOf(y).includes(x)),
      );
      const s = spare.length ? pick(spare, rnd) : undefined;
      if (s && --g[s]! === 0) delete g[s];
    }
  }
  // too few cards (too much energy): add strong cards
  for (let guard = 0; energyOf(g) > MAX_ENERGY && guard < 500; guard++) {
    const c = weightedCard(rnd);
    if ((g[c.id] ?? 0) >= maxCopies(c.id)) continue;
    g[c.id] = (g[c.id] ?? 0) + 1;
    withStages();
  }
  return g;
}

/** Is the genome a legal deck? (used by the tests and as a last check before the duel) */
export function legal(g: Genome): boolean {
  const e = energyOf(g);
  if (e < MIN_ENERGY || e > MAX_ENERGY) return false;
  if (basics(g) < MIN_BASICS) return false;
  for (const [id, n] of Object.entries(g)) {
    const c = getCard(id);
    if (c.side !== "demons" || c.kind === "energy" || n < 1 || n > maxCopies(id)) return false;
    if (lineOf(id).some((x) => !g[x])) return false;
  }
  return true;
}

/** Full 50-card list in the engine's format (plain prints). */
export const toDeckList = (g: Genome): DeckList => [
  ...Object.entries(g).flatMap(([cardId, n]) =>
    Array.from({ length: n }, () => ({ cardId, finish: "plain" as const })),
  ),
  ...Array.from({ length: energyOf(g) }, () => ({ cardId: ENERGY, finish: "plain" as const })),
];

/** The genome as an `Opponent.deck` record (energy included). */
export const toRecord = (g: Genome): Record<string, number> => ({ ...g, [ENERGY]: energyOf(g) });

/** Starting points of the search: the decks of the hardest opponents, squeezed into the rules. */
export function seedDecks(rnd: () => number): Genome[] {
  const fixed = OPPONENTS.filter((o) =>
    ["pycha", "zastepy", "otchlan", "niepokonany"].includes(o.id),
  ).map((o) => repair(o.deck, rnd));
  return [...fixed, archetype(rnd), archetype(rnd), archetype(rnd)];
}

const TOP_LINES = POOL.filter(
  (c) => isCharacter(c) && (c.rarity === "legendary" || c.rarity === "rare"),
);
const ENGINE = [
  "algorytm",
  "czat",
  "obietnica",
  "powiadomienie",
  "odgrzewany",
  "kielich",
  "szef",
  "nawrot",
];

/** A random deck of 2–3 strong evolution lines and a draw/energy engine. */
export function archetype(rnd: () => number): Genome {
  const g: Genome = {};
  const lines = 2 + Math.floor(rnd() * 2);
  for (let i = 0; i < lines; i++) {
    const top = pick(TOP_LINES, rnd);
    const line = [top.id, ...lineOf(top.id)];
    line.forEach((id, depth) => (g[id] = Math.max(g[id] ?? 0, depth === line.length - 1 ? 3 : 2)));
  }
  for (const id of ENGINE) if (rnd() < 0.7) g[id] = 1 + Math.floor(rnd() * 2);
  return repair(g, rnd);
}
