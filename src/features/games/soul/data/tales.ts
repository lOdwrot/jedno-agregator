import type { CardDef } from "./types";

/**
 * Saints that are never in boosters: each one is the reward of a saint's tale (`soul/tales/`),
 * always printed as stained glass. Not part of `COLLECTIBLE` (pack pools, collection count).
 */
export const TALE_CARDS: CardDef[] = [
  {
    id: "bernadetta",
    kind: "character",
    side: "parish",
    name: "Św. Bernadetta Soubirous",
    subtitle: "pastereczka z Lourdes, XIX w.",
    emoji: "💧",
    rarity: "legendary",
    hp: 100,
    element: "modlitwa",
    weakness: "pycha",
    retreat: 1,
    souls: 2,
    ability: {
      name: "Źródło w grocie",
      text: "Raz na turę: ulecz 30 swojej najbardziej rannej postaci.",
      effect: { k: "healOnce", n: 30 },
    },
    attacks: [
      {
        name: "Różaniec nad Gave",
        cost: 1,
        damage: 20,
        text: "Ulecz 10 tej postaci.",
        effects: [{ k: "heal", target: "self", n: 10 }],
      },
      {
        name: "Jestem Niepokalane Poczęcie",
        cost: 3,
        damage: 80,
        text: "Ulecz 20 każdej swojej postaci.",
        effects: [{ k: "heal", target: "all", n: 20 }],
      },
    ],
    flavor: "Nie umiała czytać, ale trudne słowa Pani zapamiętała co do joty.",
  },
  {
    id: "biedaczyna",
    kind: "character",
    side: "parish",
    name: "Św. Franciszek z Asyżu",
    subtitle: "Biedaczyna z Asyżu, XIII w.",
    emoji: "🐺",
    rarity: "legendary",
    hp: 110,
    element: "slowo",
    weakness: "gniew",
    retreat: 1,
    souls: 2,
    ability: {
      name: "Pokój i dobro",
      text: "Ta postać jest odporna na uśpienie, zatrzymanie i zwątpienie.",
      effect: { k: "statusImmune" },
    },
    attacks: [
      {
        name: "Kazanie do ptaków",
        cost: 1,
        damage: 10,
        text: "Dobierz 2 karty.",
        effects: [{ k: "draw", n: 2 }],
      },
      {
        name: "Brat wilk z Gubbio",
        cost: 3,
        damage: 80,
        text: "Aktywna postać rywala zasypia.",
        effects: [{ k: "status", s: "asleep" }],
      },
    ],
    flavor: "Mówił do ptaków i do wilka. Najdziwniejsze, że one go słuchały.",
  },
  {
    id: "izydor",
    kind: "character",
    side: "parish",
    name: "Św. Izydor Oracz",
    subtitle: "rolnik spod Madrytu, XII w.",
    emoji: "🌾",
    rarity: "legendary",
    hp: 120,
    element: "sluzba",
    weakness: "lenistwo",
    retreat: 2,
    souls: 2,
    ability: {
      name: "Anioły przy pługu",
      text: "Raz na turę: dołącz 1 Łaskę z talii do swojej postaci, która jej najbardziej potrzebuje.",
      effect: { k: "energyOnce" },
    },
    attacks: [
      {
        name: "Ziarno dla ptaków",
        cost: 1,
        damage: 20,
        text: "Ulecz 10 każdej swojej postaci.",
        effects: [{ k: "heal", target: "all", n: 10 }],
      },
      {
        name: "Źródło z ościenia",
        cost: 3,
        damage: 80,
        text: "Rzuć monetą. Orzeł: +30 obrażeń.",
        effects: [{ k: "coin", n: 30 }],
      },
    ],
    flavor:
      "Zanim pan wstał, pole było zaorane. Dwa woły, dwóch aniołów i jeden modlący się rolnik.",
  },
];
