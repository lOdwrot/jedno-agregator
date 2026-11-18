import type { CardDef } from "./types";

/**
 * Antypapież — the pope slayer of the two hardest opponents (Otchłań Upadłych, Tron Bestii), at most
 * one copy in a deck. Its attack knocks out any pope at once (`popeBane`); other characters only take
 * the base damage.
 */
export const SCHISM_CARDS: CardDef[] = [
  {
    id: "antypapiez",
    kind: "character",
    side: "demons",
    name: "Antypapież",
    subtitle: "Wielka Schizma Zachodnia",
    emoji: "🎭",
    rarity: "legendary",
    hp: 110,
    element: "pycha",
    weakness: "modlitwa",
    retreat: 2,
    souls: 1,
    unique: true,
    attacks: [
      { name: "Podważanie", cost: 1, damage: 20 },
      {
        name: "Fałszywa tiara",
        cost: 3,
        damage: 50,
        text: "Jeśli obrońca jest papieżem, od razu schodzi z pola.",
        effects: [{ k: "popeBane" }],
      },
    ],
    flavor:
      "Przez chwilę Kościół miał trzech papieży naraz. Każdy był pewien, że to ten pierwszy jest prawdziwy.",
    lesson: {
      tempts:
        "Rozłam: „ja wiem lepiej niż Kościół”, wybieranie sobie własnego autorytetu i obrażanie się na Piotra, gdy mówi coś niewygodnego. Tak rodzą się podziały.",
      defend:
        "„Ty jesteś Piotr, czyli Skała” (Mt 16,18). Módl się za papieża, trzymaj się jedności Kościoła, a krytykę wypowiadaj z miłością, nie z pychą.",
    },
  },
];
