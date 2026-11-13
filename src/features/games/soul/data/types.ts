/** Card definitions of "Walka o duszę" — a single-player trading-card duel (parish vs. demons). */

export type Side = "parish" | "demons";
export type Rarity = "common" | "uncommon" | "rare" | "legendary";
/** Print finish of an owned copy — the same card can be found in a rarer version. */
export type Finish = "plain" | "gilded" | "stained";

export type Virtue = "modlitwa" | "slowo" | "sluzba";
export type Sin = "pycha" | "gniew" | "lenistwo";
export type Element = Virtue | Sin;
export type Status = "asleep" | "paralyzed" | "poisoned";

export type AttackEffect =
  | { k: "heal"; target: "self" | "all"; n: number }
  | { k: "status"; s: Status; coin?: boolean }
  | { k: "bench"; n: number }
  | { k: "draw"; n: number }
  | { k: "coin"; n: number }
  | { k: "recoil"; n: number }
  | { k: "cleanse" }
  | { k: "searchEnergy"; n: number }
  | { k: "discardEnergy" }
  /** +n for every 10 damage already on the attacker ("zło dobrem zwyciężaj"). */
  | { k: "revenge"; n: number };

export interface AttackDef {
  name: string;
  cost: number;
  damage: number;
  /** Rules text (Polish). */
  text?: string;
  effects?: AttackEffect[];
}

export type AbilityEffect =
  | { k: "armor"; n: number }
  | { k: "freeRetreat" }
  | { k: "statusImmune" }
  | { k: "endHeal"; n: number }
  | { k: "drawOnce" }
  | { k: "attackBonus"; n: number };

export interface AbilityDef {
  name: string;
  text: string;
  effect: AbilityEffect;
}

interface BaseDef {
  id: string;
  side: Side;
  name: string;
  emoji: string;
  rarity: Rarity;
  /** Humorous flavour line. */
  flavor: string;
}

export interface CharacterDef extends BaseDef {
  kind: "character";
  /** Epoch / role line, e.g. "papież, V w.". */
  subtitle?: string;
  hp: number;
  element: Element;
  weakness?: Element;
  retreat: number;
  evolvesFrom?: string;
  attacks: AttackDef[];
  ability?: AbilityDef;
  /** Souls the opponent takes when this character is knocked out. */
  souls: 1 | 2;
  /** Demons only — how this temptation works and how to resist it (educational part). */
  lesson?: { tempts: string; defend: string };
}

export type SupportEffect =
  | { k: "heal"; n: number; target: "own" | "active" | "all" }
  | { k: "draw"; n: number }
  | { k: "refresh"; n: number }
  | { k: "searchCharacter" }
  | { k: "cleanse"; heal: number }
  | { k: "shield"; n: number }
  | { k: "switch" }
  | { k: "gust" }
  | { k: "discardOppEnergy" }
  | { k: "energyFromDeck"; n: number }
  | { k: "fullHeal" }
  | { k: "place"; attackBonus?: number; endHeal?: number; retreatMinus?: number };

export interface SupportDef extends BaseDef {
  kind: "item" | "supporter" | "place";
  text: string;
  effect: SupportEffect;
  lesson?: { tempts: string; defend: string };
}

export interface EnergyDef extends BaseDef {
  kind: "energy";
  text: string;
}

export type CardDef = CharacterDef | SupportDef | EnergyDef;

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "pospolita",
  uncommon: "niepospolita",
  rare: "rzadka",
  legendary: "legendarna",
};
export const RARITY_SYMBOL: Record<Rarity, string> = {
  common: "●",
  uncommon: "◆",
  rare: "★",
  legendary: "👑",
};
export const FINISH_LABEL: Record<Finish, string> = {
  plain: "zwykła",
  gilded: "złocona",
  stained: "witrażowa",
};
/** Gameplay bonus of rarer prints. */
export const FINISH_BONUS: Record<Finish, { hp: number; damage: number }> = {
  plain: { hp: 0, damage: 0 },
  gilded: { hp: 10, damage: 0 },
  stained: { hp: 20, damage: 10 },
};

export const ELEMENT_INFO: Record<Element, { label: string; emoji: string }> = {
  modlitwa: { label: "Modlitwa", emoji: "🙏" },
  slowo: { label: "Słowo", emoji: "📖" },
  sluzba: { label: "Służba", emoji: "🤝" },
  pycha: { label: "Pycha", emoji: "👑" },
  gniew: { label: "Gniew", emoji: "💢" },
  lenistwo: { label: "Lenistwo", emoji: "💤" },
};

export const STATUS_INFO: Record<Status, { label: string; emoji: string; text: string }> = {
  asleep: {
    label: "Uśpiony",
    emoji: "💤",
    text: "Nie atakuje i nie wycofuje się. Po każdej turze rzut monetą: orzeł — budzi się.",
  },
  paralyzed: {
    label: "Zatrzymany",
    emoji: "✋",
    text: "Nie atakuje i nie wycofuje się w swojej najbliższej turze.",
  },
  poisoned: {
    label: "Zwątpienie",
    emoji: "🌫️",
    text: "Traci 10 wytrwałości po każdej turze, dopóki nie zostanie uleczony.",
  },
};

export const ENERGY_LABEL: Record<Side, { name: string; emoji: string }> = {
  parish: { name: "Łaska", emoji: "✨" },
  demons: { name: "Pokusa", emoji: "🔥" },
};
