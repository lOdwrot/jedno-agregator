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
    hp: 260,
    element: "pycha",
    weakness: "modlitwa",
    retreat: 4,
    souls: 2,
    ability: {
      name: "Śmiertelna rana zagojona",
      text: "Na koniec Twojej tury ta postać odzyskuje 40 wytrwałości.",
      effect: { k: "endHeal", n: 40 },
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
        damage: 200,
        text: "30 obrażeń każdej postaci na ławce rywala.",
        effects: [{ k: "bench", n: 30 }],
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
    hp: 200,
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
        damage: 70,
        text: "Obrońca zostaje zatrzymany.",
        effects: [{ k: "status", s: "paralyzed" }],
      },
      {
        name: "Ogień z nieba",
        cost: 4,
        damage: 150,
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
    hp: 230,
    element: "gniew",
    weakness: "modlitwa",
    retreat: 3,
    souls: 2,
    ability: {
      name: "Bo nas wielu",
      text: "Ataki pomiotów zadają +20 obrażeń.",
      effect: { k: "attackBonus", n: 20 },
    },
    attacks: [
      {
        name: "Zerwane kajdany",
        cost: 2,
        damage: 70,
        text: "Dołącz 1 Pokusę z talii do postaci na ławce.",
        effects: [{ k: "searchEnergy", n: 1 }],
      },
      {
        name: "Stado w przepaść",
        cost: 4,
        damage: 130,
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
    text: "Ataki pomiotów zadają +20 obrażeń, a pomioty otrzymują o 20 mniej obrażeń.",
    effect: { k: "place", attackBonus: 20, armor: 20 },
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
    text: "Rywal wtasowuje rękę do talii i dobiera 2 karty. Ty dobierasz 5 kart.",
    effect: { k: "disrupt", opp: 2, self: 5 },
    flavor:
      "„Gdy mówi kłamstwo, od siebie mówi” (J 8,44). Prawdy mówi zawsze tylko tyle, żeby uwierzyć w resztę.",
    lesson: {
      tempts:
        "Półprawdy o Bogu, o innych i o Tobie: „Bóg Cię nie słucha”, „nikt Cię nie kocha”, „to i tak nie ma znaczenia”. Kłamstwo zabiera nadzieję.",
      defend:
        "„Prawda was wyzwoli” (J 8,32). Nazwij kłamstwo po imieniu, sprawdź je ze Słowem Bożym i powiedz je komuś zaufanemu na głos.",
    },
  },
  {
    id: "duch-swiata",
    kind: "character",
    side: "demons",
    name: "Duch tego świata",
    subtitle: "1 Kor 2,12",
    emoji: "🌫️",
    rarity: "legendary",
    hp: 180,
    element: "lenistwo",
    weakness: "sluzba",
    retreat: 1,
    souls: 1,
    ability: {
      name: "Wszyscy tak robią",
      text: "Działa także z ławki: dopóki ta postać jest w grze, pomioty nie mają słabości.",
      effect: { k: "noWeakness" },
    },
    attacks: [
      {
        name: "Szara codzienność",
        cost: 2,
        damage: 70,
        text: "Obrońca popada w zwątpienie.",
        effects: [{ k: "status", s: "poisoned" }],
      },
    ],
    flavor:
      "Nie atakuje wprost. Po prostu sprawia, że to, co kiedyś raziło, wydaje się normalne — także nasze słabe strony.",
    lesson: {
      tempts:
        "Mentalność „wszyscy tak robią”: przestajemy widzieć grzech, bo jest powszechny, i nie szukamy już pomocy tam, gdzie jesteśmy słabi.",
      defend:
        "„Nie bierzcie wzoru z tego świata, lecz przemieniajcie się przez odnawianie umysłu” (Rz 12,2). Rachunek sumienia pokazuje słabe miejsca — i tam działa łaska.",
    },
  },
  {
    id: "jezdziec",
    kind: "character",
    side: "demons",
    name: "Jeździec na rudym koniu",
    subtitle: "Ap 6,4",
    emoji: "🐎",
    rarity: "legendary",
    hp: 210,
    element: "gniew",
    weakness: "modlitwa",
    retreat: 2,
    souls: 2,
    ability: {
      name: "Ostroga",
      text: "Raz na turę (także z ławki): dołącz 1 Pokusę z talii do swojego pomiota, który jej najbardziej potrzebuje.",
      effect: { k: "energyOnce" },
    },
    attacks: [
      {
        name: "Miecz wielki",
        cost: 3,
        damage: 110,
        text: "20 obrażeń każdej postaci na ławce rywala.",
        effects: [{ k: "bench", n: 20 }],
      },
    ],
    flavor:
      "„Dano mu władzę odebrać ziemi pokój, żeby się wzajemnie zabijali” (Ap 6,4). Galopuje szybciej, niż zdążysz przeprosić.",
    lesson: {
      tempts:
        "Wojna zaczyna się w sercu: w domu, w sieci, przy stole. Złość nakręca się szybko, a każda kłótnia dokłada ognia do następnej.",
      defend:
        "„Błogosławieni, którzy wprowadzają pokój” (Mt 5,9). Zatrzymaj konia, zanim ruszy: policz do dziesięciu, pomódl się i pierwszy podaj rękę.",
    },
  },
  {
    id: "kielich",
    kind: "item",
    side: "demons",
    name: "Złoty kielich Babilonu",
    emoji: "🍷",
    rarity: "legendary",
    text: "Dołącz 3 Pokusy z talii do wybranego swojego pomiota.",
    effect: { k: "energyFromDeck", n: 3 },
    flavor:
      "Złoty z zewnątrz, pełen obrzydliwości w środku (Ap 17,4). Każdy łyk smakuje jak „jeszcze trochę”.",
    lesson: {
      tempts:
        "Upijanie się czymkolwiek — alkoholem, sukcesem, przyjemnością — żeby nie czuć pustki. Na chwilę dodaje sił, potem zostawia jeszcze większy głód.",
      defend:
        "Jezus daje kielich, który naprawdę syci: Eucharystię. Szukaj radości, po której nie zostaje wstyd.",
    },
  },
];
