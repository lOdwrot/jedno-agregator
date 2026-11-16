import { DEMON_CARDS } from "./demons";
import { PARISH_CARDS } from "./parish";
import { TALE_CARDS } from "./tales";
import type { CardDef, CharacterDef } from "./types";

export const ALL_CARDS: readonly CardDef[] = [...PARISH_CARDS, ...TALE_CARDS, ...DEMON_CARDS];
const BY_ID = new Map(ALL_CARDS.map((c) => [c.id, c]));

export function getCard(id: string): CardDef {
  const c = BY_ID.get(id);
  if (!c) throw new Error(`Unknown card: ${id}`);
  return c;
}

export const isCharacter = (c: CardDef): c is CharacterDef => c.kind === "character";
/** Blessed characters ("Bł." in the name) — counted by the `blessedHp` ability. */
export const isBlessed = (c: CardDef): boolean => isCharacter(c) && c.name.startsWith("Bł. ");
/** Saints ("Św." in the name) — protected by the `saintArmor` place. */
export const isSaint = (c: CardDef): boolean => isCharacter(c) && c.name.startsWith("Św. ");
export const isBasic = (c: CardDef): c is CharacterDef => isCharacter(c) && !c.evolvesFrom;

/** Every pope evolves from this one basic card. */
export const POPE_CANDIDATE = "kandydat";
export const isPopeCard = (c: CardDef): c is CharacterDef =>
  isCharacter(c) && c.evolvesFrom === POPE_CANDIDATE;

/** Collectible parish cards (energy is unlimited and never in boosters). */
export const COLLECTIBLE: readonly CardDef[] = PARISH_CARDS.filter((c) => c.kind !== "energy");
export const DEMON_CHARACTERS = DEMON_CARDS.filter(isCharacter);

export const ENERGY_ID = { parish: "laska", demons: "pokusa" } as const;
export const DECK_SIZE = 50;
/** A deck needs at least this many basic characters (so an opening hand is never stuck). */
export const MIN_BASICS = 5;
export const MAX_COPIES = 3;
export const SOULS_TO_WIN = 4;
export const BENCH_SIZE = 3;
export const HAND_START = 7;
