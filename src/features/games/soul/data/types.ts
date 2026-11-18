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
  /** Before the attack discard up to `max` energy cards from your hand: +n damage for each. */
  | { k: "fuel"; n: number; max: number }
  /** After the attack discard n energy from the attacker itself (99 = all). */
  | { k: "selfDiscard"; n: number }
  /** +n for every 10 damage already on the attacker ("zło dobrem zwyciężaj"). */
  | { k: "revenge"; n: number }
  /** A pope defender (stage 1 of Kandydat na papieża) is knocked out at once, whatever its HP. */
  | { k: "popeBane" };

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
  | { k: "attackBonus"; n: number }
  /** Works from the bench too: the owner's attacks cost `n` energy less (does not stack). */
  | { k: "costMinus"; n: number }
  /** Only this character's own attacks cost `n` energy less while any pope is on the table (either side). */
  | { k: "popeDiscount"; n: number }
  /** Works from the bench too: the owner's characters retreat for `n` energy less (does not stack). */
  | { k: "retreatMinus"; n: number }
  /** Works from the bench too: none of the owner's characters has a weakness. */
  | { k: "noWeakness" }
  /** While this character is active, neither player may play cards of this kind. */
  | { k: "lock"; kind: "item" | "supporter" }
  /* activated once per turn (like Pokémon TCG Abilities) */
  | { k: "drawOnce" }
  | { k: "drawUntil"; n: number }
  /** Heals n; with `coin` a coin flip follows — heads heals `coin` more. */
  | { k: "healOnce"; n: number; coin?: number }
  | { k: "energyOnce" }
  /** Also from the bench: attach 1 energy card from the hand to one of your characters. */
  | { k: "handEnergyOnce" }
  /** Only while active: take a copy of `cardId` from the discard pile into the hand. */
  | { k: "recoverOnce"; cardId: string }
  /** Also from the bench: take one card of this kind from the discard pile into the hand. */
  | { k: "salvageOnce"; kind: "character" | "item" }
  /** Also from the bench: attach 1 energy card from the discard pile to one of your characters. */
  | { k: "kindleOnce" }
  /** Works from the bench too: the owner's benched characters take no damage from attacks. */
  | { k: "benchGuard" }
  /** +n max HP for every other blessed character ("Bł.") on the owner's side of the table. */
  | { k: "blessedHp"; n: number }
  /** Works from the bench too: the owner's OTHER characters with one of these card ids deal +n damage (no stacking). */
  | { k: "teamBonus"; ids: string[]; n: number };

/** Abilities the player activates (once per turn); the others are always on. */
export const ACTIVE_ABILITIES = new Set<AbilityEffect["k"]>([
  "drawOnce",
  "drawUntil",
  "healOnce",
  "energyOnce",
  "handEnergyOnce",
  "recoverOnce",
  "salvageOnce",
  "kindleOnce",
]);

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
  /** At most one copy of this card in a deck. */
  unique?: true;
}

/** Global place rules: no abilities, no items, no weakness. */
export type PlaceRule = "noAbilities" | "noItems" | "noWeakness";

export type SupportEffect =
  | { k: "heal"; n: number; target: "own" | "active" | "all" }
  | { k: "draw"; n: number }
  | { k: "refresh"; n: number }
  | { k: "searchCharacter" }
  | { k: "cleanse"; heal: number }
  | { k: "shield"; n: number }
  | { k: "switch" }
  /** Bring an opponent's benched character to the front (like Boss's Orders; with `coin` — Catcher). */
  | { k: "gust"; coin?: boolean }
  /** Discard 1 energy from the opponent's active (`any`: from a chosen character; `coin`: on heads;
   *  `tailsHeal`: on tails heal that much from the owner's most damaged character instead). */
  | { k: "discardOppEnergy"; coin?: boolean; any?: boolean; tailsHeal?: number }
  /** Look at the top card of the deck: keep it, or discard it and draw (like Trekking Shoes). */
  | { k: "peek" }
  /** Discard `discard` cards from your hand, then take any character from your deck (like Ultra Ball). */
  | { k: "search"; discard: number }
  /** Take a character from your discard pile into your hand (best one for the board is chosen). */
  | { k: "recoverCharacter" }
  /** Shuffle up to n cards from your discard pile back into the deck (characters and energy first). */
  | { k: "recycle"; n: number }
  /** The opponent's active gets a status (on heads with `coin`). */
  | { k: "oppStatus"; s: Status; coin?: boolean }
  /** The opponent shuffles their hand into the deck and draws `opp`; you draw `self`. */
  | { k: "disrupt"; opp: number; self: number }
  | { k: "energyFromDeck"; n: number }
  | { k: "fullHeal" }
  | { k: "drawUntil"; n: number }
  | { k: "benchBasic" }
  | { k: "energyToHand"; n: number }
  /** Attach n energy cards from your discard pile to one of your characters (target = its uid). */
  | { k: "kindle"; n: number }
  /** Take up to n energy cards from your discard pile into your hand. */
  | { k: "energyFromDiscard"; n: number }
  /** Discard your hand, draw n (like Professor's Research). */
  | { k: "research"; n: number }
  /** Needs an energy card and a pope in hand: discard the energy, bench the pope (target = its hand uid). */
  | { k: "council" }
  /** Put a stage 2 card from the hand onto its basic in play, skipping stage 1 (like Rare Candy).
   *  The action's `target` is the basic in play, `with` the hand uid of the stage 2 card. */
  | { k: "skipEvolve" }
  /** Both players put their hand under the deck and draw one card per soul still to win (like Iono). */
  | { k: "iono" }
  | {
      k: "place";
      attackBonus?: number;
      endHeal?: number;
      retreatMinus?: number;
      /** Damage taken by your characters is reduced by n. */
      armor?: number;
      /** Draw n extra cards at the start of your turn. */
      extraDraw?: number;
      /** A rule for BOTH players while the place is in play. */
      rule?: PlaceRule;
      /** For BOTH players: an attack that would deal more than `over` damage to one of these
       *  characters (card ids) deals none at all. */
      guard?: { ids: readonly string[]; over: number };
      /** For BOTH players: damage taken by every saint ("Św.") in play is reduced by n. */
      saintArmor?: number;
    };

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
