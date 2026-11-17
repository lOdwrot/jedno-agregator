import type { CardDef } from "./types";

/**
 * Earlier stages of the apocalyptic evolutions: the big ones never enter the table fully grown —
 * they start small (a spark, a wolf in sheep's clothing, the herd) and must be evolved.
 * Bestia z morza and Legion are three-stage lines: Fala z otchłani → Mały róg → Bestia,
 * Tylko ten jeden raz → Kajdany nałogu → Legion.
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
  {
    id: "fala",
    kind: "character",
    side: "demons",
    name: "Fala z otchłani",
    subtitle: "Ap 13,1",
    emoji: "🌊",
    rarity: "rare",
    hp: 70,
    element: "pycha",
    weakness: "modlitwa",
    retreat: 1,
    souls: 1,
    ability: {
      name: "Odpływ",
      text: "Działa też z ławki: wycofanie każdej Twojej postaci kosztuje o 2 mniej (kilka Fal się nie sumuje).",
      effect: { k: "retreatMinus", n: 2 },
    },
    attacks: [
      { name: "Piana na ustach", cost: 1, damage: 20 },
      { name: "Przypływ", cost: 2, damage: 40 },
    ],
    flavor: "Z daleka to tylko fala. Ale coś pod nią płynie — i rośnie.",
    lesson: {
      tempts:
        "Zachwyt nad siłą zaczyna się niewinnie: podziw dla tego, kto rozpycha się łokciami, i ciche marzenie, żeby też tak móc.",
      defend:
        "„Kto chce być pierwszy, niech będzie sługą wszystkich” (Mk 9,35). Podziwiaj tych, którzy służą, a nie tych, którzy rządzą.",
    },
  },
  {
    id: "rog",
    kind: "character",
    side: "demons",
    name: "Mały róg",
    subtitle: "Dn 7,8",
    emoji: "🗯️",
    rarity: "rare",
    hp: 130,
    element: "pycha",
    weakness: "modlitwa",
    retreat: 2,
    evolvesFrom: "fala",
    souls: 1,
    attacks: [
      {
        name: "Usta mówiące wielkie rzeczy",
        cost: 2,
        damage: 50,
        text: "Odrzuć 1 Łaskę z postaci obrońcy.",
        effects: [{ k: "discardEnergy" }],
      },
      { name: "Wywyższenie", cost: 3, damage: 90 },
    ],
    flavor: "Najmniejszy z rogów, za to z najgłośniejszymi ustami (Dn 7,8).",
    lesson: {
      tempts:
        "Pycha rośnie z każdym wygranym sporem i każdym „miałem rację”. Mały róg wyrywa inne, żeby tylko on był widoczny.",
      defend:
        "Przyznaj się czasem do błędu na głos i ciesz się cudzym sukcesem. To łamie róg, zanim stanie się koroną Bestii.",
    },
  },
  {
    id: "raz",
    kind: "character",
    side: "demons",
    name: "Tylko ten jeden raz",
    emoji: "☝️",
    rarity: "rare",
    hp: 70,
    element: "gniew",
    weakness: "modlitwa",
    retreat: 1,
    souls: 1,
    attacks: [
      { name: "Ciekawość", cost: 1, damage: 20 },
      {
        name: "Jeszcze jeden",
        cost: 2,
        damage: 40,
        text: "Rzuć monetą. Orzeł: obrońca zostaje zatrzymany.",
        effects: [{ k: "status", s: "paralyzed", coin: true }],
      },
    ],
    flavor: "„Raz to jak nigdy”. Powiedział to już jedenaście razy.",
    lesson: {
      tempts:
        "Każdy nałóg zaczyna się od „tylko raz”, „przecież panuję nad tym”, „wszyscy próbowali”. Pierwszy raz jest najłatwiejszy do odmówienia.",
      defend:
        "Nie negocjuj z pokusą — po prostu odejdź. Najprościej powiedzieć „nie” na samym początku, zanim coś zacznie Cię mieć.",
    },
  },
  {
    id: "kajdany",
    kind: "character",
    side: "demons",
    name: "Kajdany nałogu",
    subtitle: "Mk 5,4",
    emoji: "⛓️",
    rarity: "rare",
    hp: 130,
    element: "gniew",
    weakness: "modlitwa",
    retreat: 2,
    evolvesFrom: "raz",
    souls: 1,
    attacks: [
      {
        name: "Zaciśnięte ogniwa",
        cost: 2,
        damage: 50,
        text: "Rzuć monetą. Orzeł: obrońca zostaje zatrzymany.",
        effects: [{ k: "status", s: "paralyzed", coin: true }],
      },
      { name: "Coraz ciaśniej", cost: 3, damage: 90 },
    ],
    flavor: "Najpierw był łańcuszek, potem łańcuch. Teraz to on nosi Ciebie.",
    lesson: {
      tempts:
        "Nawyk staje się przymusem: robisz to, choć już nie chcesz, i wstydzisz się komukolwiek powiedzieć. Samotność zaciska kajdany najmocniej.",
      defend:
        "Łańcuchy pękają w świetle: powiedz o tym spowiednikowi, rodzicom albo przyjacielowi. Proszenie o pomoc to odwaga, nie słabość.",
    },
  },
];
