/** Booster editions: each pack has its own look, price and odds. */
import { COLLECTIBLE } from "../data/cards";
import type { CardDef, Finish, Rarity } from "../data/types";
import { keyOf, type CardKey } from "./profile";

export type PackId = "wspolnota" | "swieci" | "papieze" | "zakrystia" | "witraze" | "skarbiec" | "rozeta";

export interface PackType {
  id: PackId;
  name: string;
  subtitle: string;
  /** Short promise printed on the pack sticker. */
  sticker: string;
  price: number;
  /** Image key from `data/art.ts` shown on the pack front. */
  art: string;
  emoji: string;
  /** Tailwind gradient (tokens only) of the foil. */
  foil: string;
  odds: {
    legendary: number;
    rareInUncommonSlot: number;
    pool?: (c: CardDef) => boolean;
    /** Every slot draws only from these cards (falls back to all cards of a rarity it lacks). */
    only?: (c: CardDef) => boolean;
    /** Chances of a stained / gilded print (default 3% / 12%). */
    finish?: { stained: number; gilded: number };
    /** At least this many cards come in the stained-glass finish. */
    minStained?: number;
    /** The first card is always this one, with its own (usually better) finish odds. */
    first?: { id: string; finish: { stained: number; gilded: number } };
  };
}

const SAINTS = new Set(["wojciech", "dorota", "komorowski", "popieluszko"]);

export const PACKS: readonly PackType[] = [
  {
    id: "wspolnota",
    name: "Wspólnota",
    subtitle: "Życie parafii",
    sticker: "1 rzadka w każdej paczce!",
    price: 100,
    art: "mariacka",
    emoji: "⛪",
    foil: "from-logo-orange via-logo-yellow to-logo-red",
    odds: { legendary: 0.2, rareInUncommonSlot: 0.15 },
  },
  {
    id: "swieci",
    name: "Święci Pomorza",
    subtitle: "Patroni i błogosławieni",
    sticker: "Większa szansa na świętych!",
    price: 120,
    art: "wojciech",
    emoji: "🌹",
    foil: "from-logo-blue via-navy-600 to-logo-blue",
    odds: { legendary: 0.12, rareInUncommonSlot: 0.3, pool: (c) => SAINTS.has(c.id) },
  },
  {
    id: "papieze",
    name: "Papieże wieków",
    subtitle: "Od św. Piotra do Franciszka",
    sticker: "40% szans na papieża!",
    price: 160,
    art: "leon1",
    emoji: "👑",
    foil: "from-logo-yellow via-surface to-logo-yellow",
    odds: {
      legendary: 0.4,
      rareInUncommonSlot: 0.25,
      // every pope evolves from the candidate — this pack always brings one, often gilded or stained
      first: { id: "kandydat", finish: { stained: 0.15, gilded: 0.35 } },
    },
  },
  {
    id: "zakrystia",
    name: "Zakrystia i sanktuaria",
    subtitle: "Same przedmioty i miejsca",
    sticker: "Tylko przedmioty i miejsca!",
    price: 200,
    art: "zakrystia",
    emoji: "🕯️",
    foil: "from-logo-dark via-logo-orange to-logo-dark",
    odds: {
      legendary: 0.15,
      rareInUncommonSlot: 0.25,
      only: (c) => c.kind === "item" || c.kind === "place",
    },
  },
  {
    id: "witraze",
    name: "Witraże Katedry",
    subtitle: "Edycja w kolorach szkła",
    sticker: "Min. 2 witrażowe karty!",
    price: 600,
    art: "mariacka",
    emoji: "❖",
    foil: "from-logo-blue via-logo-red to-logo-yellow",
    odds: {
      legendary: 0.2,
      rareInUncommonSlot: 0.2,
      finish: { stained: 0.1, gilded: 0.15 },
      minStained: 2,
    },
  },
  {
    id: "skarbiec",
    name: "Skarbiec Katedry",
    subtitle: "Legendarna edycja kolekcjonerska",
    sticker: "Pewna legenda i rzadka!",
    price: 1000,
    art: "oliwa",
    emoji: "💎",
    foil: "from-logo-yellow via-logo-red to-logo-yellow",
    odds: {
      legendary: 1,
      rareInUncommonSlot: 1,
      finish: { stained: 0.12, gilded: 0.35 },
    },
  },
  {
    id: "rozeta",
    name: "Rozeta Pelplińska",
    subtitle: "Wszystkie karty w szkle witraża",
    sticker: "Same witraże + pewna legenda!",
    price: 6000,
    art: "pelplin",
    emoji: "🌟",
    foil: "from-logo-red via-logo-blue to-logo-yellow",
    odds: {
      legendary: 1,
      rareInUncommonSlot: 0.5,
      finish: { stained: 1, gilded: 0 },
    },
  },
];

export const findPack = (id: string) => PACKS.find((p) => p.id === id) ?? PACKS[0]!;

const DEFAULT_FINISH = { stained: 0.03, gilded: 0.12 };

function pickFinish(r: number, odds = DEFAULT_FINISH): Finish {
  return r < odds.stained ? "stained" : r < odds.stained + odds.gilded ? "gilded" : "plain";
}

function pick<T>(pool: readonly T[], rnd: () => number): T {
  return pool[Math.floor(rnd() * pool.length)]!;
}

/** Extra-rare cards: chance relative to the other cards of the same rarity (default 1). */
export const PULL_WEIGHT: Readonly<Record<string, number>> = { sobor: 0.4 };

function pickCard(pool: readonly CardDef[], rnd: () => number): CardDef {
  const w = (c: CardDef) => PULL_WEIGHT[c.id] ?? 1;
  let r = rnd() * pool.reduce((s, c) => s + w(c), 0);
  for (const c of pool) if ((r -= w(c)) < 0) return c;
  return pool.at(-1)!;
}

/**
 * 5 cards: 3 common, 1 uncommon (sometimes rare), 1 rare-or-legendary. The best card comes last.
 * Skarbiec Katedry: the 4th card is always rare and the last one always legendary.
 * Zakrystia i sanktuaria: only items and places (`odds.only`).
 * Witraże Katedry: plain/gilded cards are turned into stained glass until `minStained` is reached.
 * Rozeta Pelplińska: every card is stained glass and the last one is always legendary.
 * Papieże wieków: the first card is always Kandydat na papieża (`odds.first`), often gilded or stained.
 */
export function rollPack(pack: PackType, rnd: () => number = Math.random): CardKey[] {
  const of = (r: Rarity) => {
    const all = COLLECTIBLE.filter((c) => c.rarity === r);
    const only = pack.odds.only ? all.filter(pack.odds.only) : [];
    return only.length ? only : all;
  };
  const out: { id: string; finish: Finish }[] = [];
  for (let slot = 0; slot < 5; slot++) {
    let card: CardDef;
    if (slot < 3) card = pickCard(of("common"), rnd);
    else if (slot === 3)
      card = pickCard(of(rnd() < pack.odds.rareInUncommonSlot ? "rare" : "uncommon"), rnd);
    else if (rnd() < pack.odds.legendary) card = pickCard(of("legendary"), rnd);
    else {
      const special = pack.odds.pool ? COLLECTIBLE.filter(pack.odds.pool) : [];
      card = special.length && rnd() < 0.7 ? pickCard(special, rnd) : pickCard(of("rare"), rnd);
    }
    const first = slot === 0 ? pack.odds.first : undefined;
    if (first) out.push({ id: first.id, finish: pickFinish(rnd(), first.finish) });
    else out.push({ id: card.id, finish: pickFinish(rnd(), pack.odds.finish) });
  }
  let missing = (pack.odds.minStained ?? 0) - out.filter((c) => c.finish === "stained").length;
  while (missing-- > 0) {
    const rest = out.filter((c) => c.finish !== "stained");
    pick(rest, rnd).finish = "stained";
  }
  return out.map((c) => keyOf(c.id, c.finish));
}
