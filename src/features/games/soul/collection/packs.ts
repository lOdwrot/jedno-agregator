/** Booster editions: each pack has its own look, price and odds. */
import { COLLECTIBLE } from "../data/cards";
import type { CardDef, Finish, Rarity } from "../data/types";
import { keyOf, type CardKey } from "./profile";

export type PackId = "wspolnota" | "swieci" | "papieze" | "skarbiec";

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
    /** Chances of a stained / gilded print (default 3% / 12%). */
    finish?: { stained: number; gilded: number };
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
    odds: { legendary: 0.4, rareInUncommonSlot: 0.25 },
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
];

export const findPack = (id: string) => PACKS.find((p) => p.id === id) ?? PACKS[0]!;

const DEFAULT_FINISH = { stained: 0.03, gilded: 0.12 };

function pickFinish(r: number, odds = DEFAULT_FINISH): Finish {
  return r < odds.stained ? "stained" : r < odds.stained + odds.gilded ? "gilded" : "plain";
}

function pick(pool: readonly CardDef[], rnd: () => number): CardDef {
  return pool[Math.floor(rnd() * pool.length)]!;
}

/**
 * 5 cards: 3 common, 1 uncommon (sometimes rare), 1 rare-or-legendary. The best card comes last.
 * Skarbiec Katedry: the 4th card is always rare and the last one always legendary.
 */
export function rollPack(pack: PackType, rnd: () => number = Math.random): CardKey[] {
  const of = (r: Rarity) => COLLECTIBLE.filter((c) => c.rarity === r);
  const out: CardKey[] = [];
  for (let slot = 0; slot < 5; slot++) {
    let card: CardDef;
    if (slot < 3) card = pick(of("common"), rnd);
    else if (slot === 3)
      card = pick(of(rnd() < pack.odds.rareInUncommonSlot ? "rare" : "uncommon"), rnd);
    else if (rnd() < pack.odds.legendary) card = pick(of("legendary"), rnd);
    else {
      const special = pack.odds.pool ? COLLECTIBLE.filter(pack.odds.pool) : [];
      card = special.length && rnd() < 0.7 ? pick(special, rnd) : pick(of("rare"), rnd);
    }
    out.push(keyOf(card.id, pickFinish(rnd(), pack.odds.finish)));
  }
  return out;
}
