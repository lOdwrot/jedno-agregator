import type { CardDef } from "./types";

/**
 * Apocalyptic cards of the bestiary — only the "Niepokonany" deck plays them (Ap 13; 17–18; Mk 5; J 8).
 * Each one still carries the lesson: how the temptation works and how to resist it.
 */
export const ABYSS_CARDS: CardDef[] = [
  {
    id: "bestia",
    kind: "character",
    side: "demons",
    name: "Bestia z morza",
    subtitle: "Ap 13,1",
    emoji: "👹",
    rarity: "legendary",
    hp: 220,
    element: "pycha",
    weakness: "modlitwa",
    retreat: 4,
    souls: 2,
    ability: {
      name: "Śmiertelna rana zagojona",
      text: "Na koniec Twojej tury ta postać odzyskuje 30 wytrwałości.",
      effect: { k: "endHeal", n: 30 },
    },
    attacks: [
      {
        name: "Usta pełne bluźnierstw",
        cost: 3,
        damage: 70,
        text: "Odrzuć 1 Łaskę z postaci obrońcy.",
        effects: [{ k: "discardEnergy" }],
      },
      {
        name: "Władza nad narodami",
        cost: 5,
        damage: 170,
        text: "20 obrażeń każdej postaci na ławce rywala.",
        effects: [{ k: "bench", n: 20 }],
      },
    ],
    flavor: "Siedem głów, dziesięć rogów i tłum, który woła: „Któż podobny do Bestii?” (Ap 13,4).",
    lesson: {
      tempts:
        "Kult siły i władzy: podziwiamy tego, kto jest silny i głośny, nawet gdy niszczy innych. Wygrywa ten, kto ma rację „bo może”.",
      defend:
        "Michał znaczy „Któż jak Bóg?”. Kłaniaj się tylko Bogu — i stawaj po stronie słabszych, nie silniejszych.",
    },
  },
  {
    id: "prorok",
    kind: "character",
    side: "demons",
    name: "Fałszywy Prorok",
    subtitle: "Ap 13,11",
    emoji: "🐏",
    rarity: "legendary",
    hp: 170,
    element: "lenistwo",
    weakness: "slowo",
    retreat: 2,
    souls: 2,
    ability: {
      name: "Wielkie znaki",
      text: "Dopóki ta postać jest aktywna, żaden gracz nie może zagrywać pomocników.",
      effect: { k: "lock", kind: "supporter" },
    },
    attacks: [
      {
        name: "Znamię na prawej ręce",
        cost: 2,
        damage: 50,
        text: "Obrońca zostaje zatrzymany.",
        effects: [{ k: "status", s: "paralyzed" }],
      },
      {
        name: "Ogień z nieba",
        cost: 4,
        damage: 120,
        text: "20 obrażeń każdej postaci na ławce rywala.",
        effects: [{ k: "bench", n: 20 }],
      },
    ],
    flavor:
      "Ma dwa rogi jak baranek, a mówi jak smok. Na każde pytanie ma gotową, wygodną odpowiedź.",
    lesson: {
      tempts:
        "Religia bez Krzyża: efektowne „cuda”, guru od szczęścia i hasło „wszystko wolno, byle było miło”. Brzmi pobożnie, ale niczego nie wymaga.",
      defend:
        "„Poznacie ich po owocach” (Mt 7,16). Badaj duchy (1 J 4,1): trzymaj się Ewangelii i Kościoła, a nie najgłośniejszego głosu.",
    },
  },
  {
    id: "legion",
    kind: "character",
    side: "demons",
    name: "Legion",
    subtitle: "Mk 5,9",
    emoji: "🐗",
    rarity: "legendary",
    hp: 190,
    element: "gniew",
    weakness: "modlitwa",
    retreat: 3,
    souls: 2,
    ability: {
      name: "Bo nas wielu",
      text: "Ataki pomiotów zadają +10 obrażeń.",
      effect: { k: "attackBonus", n: 10 },
    },
    attacks: [
      {
        name: "Zerwane kajdany",
        cost: 2,
        damage: 50,
        text: "Dołącz 1 Pokusę z talii do postaci na ławce.",
        effects: [{ k: "searchEnergy", n: 1 }],
      },
      {
        name: "Stado w przepaść",
        cost: 4,
        damage: 110,
        text: "+10 za każde 10 obrażeń na tej postaci.",
        effects: [{ k: "revenge", n: 10 }],
      },
    ],
    flavor:
      "„Na imię mi Legion, bo nas wielu”. Żadne łańcuchy go nie trzymały — tylko jedno słowo Jezusa.",
    lesson: {
      tempts:
        "Zniewolenie: nałogi i złe nawyki, które z czasem „mają” człowieka. Mieszka wśród grobów i sam sobie robi krzywdę (Mk 5,5).",
      defend:
        "Jezus uwalnia jednym słowem. Nie wstydź się prosić o pomoc: spowiedź, kierownik duchowy, wspólnota, terapia — wolność jest możliwa.",
    },
  },
  {
    id: "babilon",
    kind: "place",
    side: "demons",
    name: "Babilon Wielki",
    emoji: "🏙️",
    rarity: "legendary",
    text: "Ataki pomiotów zadają +10 obrażeń, a pomioty otrzymują o 10 mniej obrażeń.",
    effect: { k: "place", attackBonus: 10, armor: 10 },
    flavor:
      "„Siedzę jak królowa i smutku nie zaznam” (Ap 18,7). Wszystko tu jest na sprzedaż — także ludzie.",
    lesson: {
      tempts:
        "Miasto luksusu: kusi wygodą, przepychem i przekonaniem, że szczęście można kupić. Kto ma więcej, ten jest kimś.",
      defend:
        "„Wyjdźcie z niej, ludu mój” (Ap 18,4). Prostota, dzielenie się z biednymi i niedziela dla Boga — to Twoje wyjście z Babilonu.",
    },
  },
  {
    id: "ojciec-klamstwa",
    kind: "supporter",
    side: "demons",
    name: "Ojciec kłamstwa",
    emoji: "🐍",
    rarity: "legendary",
    text: "Rywal wtasowuje rękę do talii i dobiera 2 karty. Ty dobierasz 4 karty.",
    effect: { k: "disrupt", opp: 2, self: 4 },
    flavor:
      "„Gdy mówi kłamstwo, od siebie mówi” (J 8,44). Prawdy mówi zawsze tylko tyle, żeby uwierzyć w resztę.",
    lesson: {
      tempts:
        "Półprawdy o Bogu, o innych i o Tobie: „Bóg Cię nie słucha”, „nikt Cię nie kocha”, „to i tak nie ma znaczenia”. Kłamstwo zabiera nadzieję.",
      defend:
        "„Prawda was wyzwoli” (J 8,32). Nazwij kłamstwo po imieniu, sprawdź je ze Słowem Bożym i powiedz je komuś zaufanemu na głos.",
    },
  },
];
