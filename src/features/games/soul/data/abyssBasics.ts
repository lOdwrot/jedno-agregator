import type { CardDef } from "./types";

/**
 * Base forms of the apocalyptic evolutions: the big ones never enter the table fully grown —
 * they start small (a spark, a wolf in sheep's clothing, the herd) and must be evolved.
 */
export const ABYSS_BASICS: CardDef[] = [
  {
    id: "wilk",
    kind: "character",
    side: "demons",
    name: "Wilk w owczej skórze",
    subtitle: "Mt 7,15",
    emoji: "🐺",
    rarity: "rare",
    hp: 80,
    element: "lenistwo",
    weakness: "slowo",
    retreat: 1,
    souls: 1,
    attacks: [
      { name: "Miłe słówka", cost: 1, damage: 20 },
      {
        name: "Ukryte kły",
        cost: 2,
        damage: 40,
        text: "Odrzuć 1 Łaskę z postaci obrońcy.",
        effects: [{ k: "discardEnergy" }],
      },
    ],
    flavor: "Beczy całkiem przekonująco. Tylko te zęby jakoś nie pasują do runa.",
    lesson: {
      tempts:
        "Zło rzadko przychodzi z rogami. Częściej jest miłe, uśmiechnięte i mówi dokładnie to, co chcesz usłyszeć — byle Cię odciągnąć od owczarni.",
      defend:
        "„Strzeżcie się fałszywych proroków” (Mt 7,15). Pytaj, dokąd prowadzi dana rada: do Boga i ludzi — czy tylko do siebie samego.",
    },
  },
  {
    id: "niezgoda",
    kind: "character",
    side: "demons",
    name: "Iskra niezgody",
    subtitle: "Jk 3,5",
    emoji: "🧨",
    rarity: "rare",
    hp: 80,
    element: "gniew",
    weakness: "modlitwa",
    retreat: 1,
    souls: 1,
    attacks: [
      { name: "Słowo za słowo", cost: 1, damage: 20 },
      {
        name: "Dolewanie oliwy do ognia",
        cost: 2,
        damage: 40,
        text: "Rzuć monetą. Orzeł: obrońca zostaje zatrzymany.",
        effects: [{ k: "status", s: "paralyzed", coin: true }],
      },
    ],
    flavor: "„Oto mały ogień, a jak wielki las podpala” (Jk 3,5). Zaczęło się od „to nie ja”.",
    lesson: {
      tempts:
        "Każda wojna zaczyna się od iskry: złośliwy komentarz, przewrócenie oczami, „a ty zawsze…”. Iskra sama gaśnie — chyba że ktoś dmucha.",
      defend:
        "Nie dokładaj drewna. Odpowiedz łagodnie (Prz 15,1), odpuść ostatnie słowo i pomódl się za tego, kto Cię zdenerwował.",
    },
  },
  {
    id: "owczy-ped",
    kind: "character",
    side: "demons",
    name: "Owczy pęd",
    subtitle: "Wj 23,2",
    emoji: "🐑",
    rarity: "rare",
    hp: 70,
    element: "lenistwo",
    weakness: "sluzba",
    retreat: 1,
    souls: 1,
    attacks: [
      {
        name: "Wszyscy idą, to i ja",
        cost: 2,
        damage: 30,
        text: "Obrońca popada w zwątpienie.",
        effects: [{ k: "status", s: "poisoned" }],
      },
    ],
    flavor: "Nikt nie wie, dokąd biegnie stado. Ale wszyscy biegną, więc chyba warto.",
    lesson: {
      tempts:
        "Robimy coś, bo „wszyscy tak robią” — i nie pytamy już, czy to dobre. Tak powoli rodzi się duch tego świata.",
      defend:
        "„Nie idź za większością, by czynić zło” (Wj 23,2). Odwaga bycia innym zaczyna się od jednego „nie, dziękuję”.",
    },
  },
];
