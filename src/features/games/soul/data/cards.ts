import { DEMON_CARDS } from "./demons";
import { PARISH_CARDS } from "./parish";
import type { CardDef, CharacterDef } from "./types";

export const ALL_CARDS: readonly CardDef[] = [...PARISH_CARDS, ...DEMON_CARDS];
const BY_ID = new Map(ALL_CARDS.map((c) => [c.id, c]));

export function getCard(id: string): CardDef {
  const c = BY_ID.get(id);
  if (!c) throw new Error(`Unknown card: ${id}`);
  return c;
}

export const isCharacter = (c: CardDef): c is CharacterDef => c.kind === "character";
export const isBasic = (c: CardDef): c is CharacterDef => isCharacter(c) && !c.evolvesFrom;

/** Collectible parish cards (energy is unlimited and never in boosters). */
export const COLLECTIBLE: readonly CardDef[] = PARISH_CARDS.filter((c) => c.kind !== "energy");
export const DEMON_CHARACTERS = DEMON_CARDS.filter(isCharacter);

export const ENERGY_ID = { parish: "laska", demons: "pokusa" } as const;
export const DECK_SIZE = 24;
export const MAX_COPIES = 2;
export const SOULS_TO_WIN = 4;
export const BENCH_SIZE = 3;
export const HAND_START = 5;
