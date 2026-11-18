import type { PackId } from "../collection/packs";
import type { Finish } from "./types";

/** One booster edition a victory can bring, with its chance (the chances of a table sum to 1). */
export interface PrizeChance {
  pack: PackId;
  chance: number;
}

/** Computer opponents — each comes with a letter from an old demon to his young nephew. */
export interface Opponent {
  id: "kanapa" | "plotkary" | "pycha" | "zastepy" | "otchlan" | "niepokonany" | "idealny";
  name: string;
  emoji: string;
  difficulty:
    | "łatwy"
    | "średni"
    | "trudny"
    | "bardzo trudny"
    | "ekstremalny"
    | "niepokonany"
    | "eksperymentalny";
  reward: { win: number; loss: number };
  /** Talents paid to challenge this opponent (harder levels). */
  fee?: number;
  /** A victory also brings one free booster, drawn from this table and opened right away. */
  prize?: readonly PrizeChance[];
  /** Card ids (energy included) — 50 cards. Empty for an `adaptive` opponent. */
  deck: Record<string, number>;
  /**
   * No fixed deck: before every duel one is put together in the browser against the player's
   * current deck (`soul/ideal/forge.ts`, AI-vs-AI simulations). Experimental.
   */
  adaptive?: true;
  /**
   * Extra cards drawn each turn — an openly stated rule shown on the opponent's card (only Tron Bestii).
   * No other handicap: difficulty comes from the deck and the AI's play.
   */
  extraDraw?: number;
  /** Print of every card in the computer's deck (stained = +20 HP, +10 damage). */
  finish?: Finish;
  /** Look & sound of the duel: the infernal board and unsettling music. */
  theme?: "infernal";
  letter: { greeting: string; body: string[]; signature: string };
  /** What the player should take away from this duel. */
  moral: string;
}

export const OPPONENTS: readonly Opponent[] = [
  {
    id: "kanapa",
    name: "Chochliki z kanapy",
    emoji: "🛋️",
    difficulty: "łatwy",
    reward: { win: 100, loss: 30 },
    deck: {
      algorytm: 1,
      banka: 1,
      "ciche-dni": 1,
      czat: 1,
      drzemka: 3,
      falszywy: 1,
      nawyki: 1,
      obietnica: 1,
      odkladanie: 2,
      powiadomienie: 1,
      reklama: 4,
      scroll: 2,
      szyderca: 2,
      "wieczne-jutro": 1,
      wybredny: 1,
      zniechecenie: 2,
      pokusa: 25,
    },
    letter: {
      greeting: "Mój drogi Smołku,",
      body: [
        "piszesz, że Twój podopieczny znów był w niedzielę w kościele i że „modlił się szczerze”. Nie panikuj. Nie musisz od razu robić z niego złoczyńcy — to męczące i, co gorsza, budzi sumienie.",
        "Wystarczy kanapa, telefon i słowo „jutro”. Niech nie odrzuca Boga — niech tylko odkłada Go na później. Niech schodzi w dół małymi kroczkami, wygodnie i bez szarpnięć — wtedy niczego nie zauważy.",
      ],
      signature: "Twój kochający wuj Siarkowąs",
    },
    moral:
      "Najczęściej nie kusi wielkie zło, tylko małe „później”. Dobra decyzja podjęta dziś jest mocniejsza niż wielkie postanowienie na kiedyś.",
  },
  {
    id: "plotkary",
    name: "Biesy plotkary",
    emoji: "🗣️",
    difficulty: "średni",
    reward: { win: 140, loss: 40 },
    deck: {
      algorytm: 1,
      "ciche-dni": 2,
      drzemka: 1,
      falszywy: 2,
      galeria: 1,
      influencer: 1,
      kabaret: 1,
      krytykant: 3,
      mamona: 1,
      obmowa: 3,
      plotka: 4,
      powiadomienie: 1,
      reklama: 1,
      remont: 2,
      scroll: 2,
      szef: 3,
      szyderca: 1,
      wymowka: 1,
      zlosnik: 3,
      pokusa: 16,
    },
    letter: {
      greeting: "Smołku, ty kompletny amatorze,",
      body: [
        "Twój podopieczny zaczął chodzić do wspólnoty. Fatalnie. Ale nie wszystko stracone: niech patrzy nie na ołtarz, tylko na ludzi obok. Ten fałszuje, tamta ma dziwny płaszcz, a lektor się jąka.",
        "A w domu? Niech się modli za „całą ludzkość”, a złości na matkę o każdy drobiazg. Dobrze podana plotka przy obiedzie zrobi więcej niż sto pokus na raz.",
      ],
      signature: "Zniecierpliwiony wuj Siarkowąs",
    },
    moral:
      "Wspólnota składa się z niedoskonałych ludzi — tak jak Ty. Miłość zaczyna się od tych najbliższych, a język potrafi budować albo ranić.",
  },
  {
    id: "pycha",
    name: "Legion Pychy",
    emoji: "🐉",
    difficulty: "trudny",
    reward: { win: 200, loss: 50 },
    deck: {
      pyszalek: 4,
      lewiatan: 3,
      porownania: 3,
      mamona: 2,
      belzebub: 2,
      krytykant: 2,
      falszywy: 1,
      szef: 2,
      powiadomienie: 2,
      algorytm: 2,
      remont: 2,
      galeria: 1,
      reklama: 1,
      obietnica: 1,
      czat: 1,
      kompleksy: 1,
      reset: 1,
      influencer: 1,
      rozpamietywanie: 1,
      nawyki: 1,
      impreza: 1,
      banka: 1,
      pokusa: 14,
    },
    letter: {
      greeting: "Smołku, ostatnia szansa,",
      body: [
        "Słyszę, że Twój podopieczny stał się… pokorny. Wspaniale! Teraz tylko szepnij mu, jak bardzo jest pokorny. Niech się tym pochwali choćby przed sobą — i już jest nasz.",
        "Dorzuć porównywanie z innymi, odrobinę zakupów na poprawę humoru i przekonanie, że sam sobie poradzi. Do tego wezwałem posiłki z samej góry. To znaczy z samego dołu.",
      ],
      signature: "Wuj Siarkowąs (w złym humorze, jak zawsze)",
    },
    moral:
      "Pycha przebiera się nawet za pokorę. Najlepszą obroną jest wdzięczność i patrzenie bardziej na Boga i innych niż na siebie.",
  },
  {
    id: "zastepy",
    name: "Smocze Zastępy",
    emoji: "🐲",
    difficulty: "bardzo trudny",
    reward: { win: 300, loss: 60 },
    fee: 30,
    prize: [
      { pack: "wspolnota", chance: 0.5 },
      { pack: "swieci", chance: 0.5 },
    ],
    deck: {
      algorytm: 2,
      banka: 1,
      belzebub: 2,
      "ciche-dni": 1,
      czat: 1,
      influencer: 1,
      kompleksy: 1,
      lawina: 1,
      letni: 1,
      lewiatan: 3,
      mamona: 2,
      marazm: 2,
      nawyki: 2,
      obietnica: 1,
      obmowa: 1,
      obojetnosc: 2,
      plotka: 1,
      powiadomienie: 2,
      pyszalek: 3,
      remont: 1,
      rozpamietywanie: 1,
      smok: 1,
      szef: 2,
      pokusa: 15,
    },
    letter: {
      greeting: "Smołku, nie waż się więcej meldować porażki,",
      body: [
        "Legion wrócił poobijany, a Twój podopieczny dalej dziękuje Bogu za byle drobiazg. Czas na Zastępy. Plotka urośnie w lawinę oszczerstw, a mała pycha — w smoka o siedmiu głowach.",
        "Tym razem zagramy zgraną talią. Gniew i pycha ramię w ramię: niech się obraża na ludzi i jednocześnie uważa się za lepszego od nich. A gdy się zmęczy, czeka na niego Duszek Marazmu z ciepłym kocykiem i Duch Letniości — „byle bez przesady”. Zarząd obserwuje.",
      ],
      signature: "Wuj Siarkowąs (z dopiskiem: „ostatnie ostrzeżenie”)",
    },
    moral:
      "Gniew i pycha karmią się nawzajem: kto czuje się lepszy, łatwo się obraża — a potem zostaje zmęczona obojętność. Przebaczenie, pokora i odrobina gorliwości gaszą te ognie, zanim urosną w smoka.",
  },
  {
    id: "otchlan",
    name: "Otchłań Upadłych",
    emoji: "🔥",
    difficulty: "ekstremalny",
    reward: { win: 450, loss: 80 },
    fee: 50,
    prize: [
      { pack: "swieci", chance: 0.15 },
      { pack: "zakrystia", chance: 0.15 },
      { pack: "papieze", chance: 0.65 },
      { pack: "witraze", chance: 0.05 },
    ],
    deck: {
      abaddon: 2,
      acedia: 1,
      algorytm: 1,
      antypapiez: 1,
      belzebub: 2,
      czat: 4,
      falszywy: 1,
      galeria: 3,
      letni: 1,
      lewiatan: 1,
      lucyfer: 1,
      mamona: 3,
      nawrot: 1,
      marazm: 1,
      obietnica: 2,
      odgrzewany: 2,
      obojetnosc: 1,
      powiadomienie: 2,
      pyszalek: 1,
      remont: 1,
      reset: 1,
      rozpamietywanie: 2,
      smok: 1,
      wybredny: 2,
      letarg: 1,
      pokusa: 11,
    },
    letter: {
      greeting: "Smołku, odsuń się,",
      body: [
        "Skoro Ty i Twoje chochliki nie dajecie rady, zajmie się tym zarząd. Twój podopieczny bierze kartę po karcie, jakby miał nieskończenie wiele czasu. Nie ma. Sprawimy, że talia skończy mu się szybciej niż cierpliwość.",
        "Nie potrzebujemy forów — wystarczy dobrze ułożona talia. Gniew, pycha i cały dwór lenistwa naraz — Duszek Marazmu rozkłada kocyk, a Bies Obojętności już wzrusza ramionami. Tego nie wytrzyma nikt. No, prawie nikt. Ale o Tamtym nie rozmawiamy.",
      ],
      signature: "Rada Otchłani (wuj Siarkowąs protokołował)",
    },
    moral:
      "Zło bywa głośne i przytłaczające, ale nie jest wszechmocne. Nikt nie walczy sam: modlitwa, sakramenty i wspólnota są silniejsze niż najgroźniejsza pokusa.",
  },
  {
    id: "niepokonany",
    name: "Tron Bestii",
    emoji: "👁️",
    difficulty: "niepokonany",
    reward: { win: 1000, loss: 100 },
    fee: 100,
    prize: [
      { pack: "skarbiec", chance: 0.1 },
      { pack: "witraze", chance: 0.2 },
      { pack: "zakrystia", chance: 0.3 },
      { pack: "papieze", chance: 0.4 },
    ],
    extraDraw: 1,
    finish: "stained",
    theme: "infernal",
    deck: {
      acedia: 1,
      algorytm: 1,
      antypapiez: 1,
      babilon: 1,
      belfegor: 2,
      bestia: 2,
      "duch-swiata": 2,
      fala: 3,
      jezdziec: 2,
      kajdany: 2,
      kielich: 2,
      legion: 2,
      nawrot: 1,
      niezgoda: 2,
      "ojciec-klamstwa": 1,
      odgrzewany: 2,
      "owczy-ped": 1,
      prorok: 1,
      raz: 3,
      rog: 2,
      rozpamietywanie: 1,
      szef: 1,
      wilk: 2,
      wygoda: 2,
      znamie: 1,
      pokusa: 9,
    },
    letter: {
      greeting: "Do robaczka zwanego Smołkiem — i do Ciebie, który to czytasz,",
      body: [
        "Rada Otchłani została rozwiązana. Za miękka. Od dziś piszę ja. Moje karty są witrażowe, bo kradnę wszystko, co piękne — są przez to twardsze i biją mocniej. I nie ukrywam: co turę dobieram dwie karty, a Ty jedną, bo w Babilonie zawsze jest „więcej”.",
        "Bestia z morza leczy swoje rany, Prorok zamyka Ci usta, Jeździec na rudym koniu ładuje nas szybciej, niż zdążysz mrugnąć, a Duch tego świata sprawia, że nie mamy już słabych stron. Legion… cóż, jest nas wielu. Mówią na mnie „Niepokonany” i nikt jeszcze nie udowodnił, że jest inaczej. Ten Baranek się nie liczy. Nie wspominaj przy mnie o Baranku.",
      ],
      signature: "Tron Bestii (wuj Siarkowąs nie ma już nic do powiedzenia)",
    },
    moral:
      "Zło lubi nazywać się niepokonanym, ale ostatnie słowo nie należy do niego: „Baranek ich zwycięży, bo jest Panem panów i Królem królów” (Ap 17,14). Nawet gdy przegrywasz bitwę — wojna jest już wygrana.",
  },
];

const IDEAL_PRIZE: readonly PrizeChance[] = (
  ["wspolnota", "swieci", "papieze", "zakrystia", "witraze", "skarbiec", "rozeta"] as const
).map((pack) => ({ pack, chance: 1 / 7 }));

/**
 * "Idealny oponent" (experimental): no fixed deck — the strongest demon deck against the player's
 * current one is computed before the duel. Plain prints, one card a turn: no handicap at all.
 */
export const IDEAL_OPPONENT: Opponent = {
  id: "idealny",
  name: "Idealny Oponent",
  emoji: "🧪",
  difficulty: "eksperymentalny",
  reward: { win: 500, loss: 50 },
  prize: IDEAL_PRIZE,
  adaptive: true,
  deck: {},
  letter: {
    greeting: "Szanowny Kliencie (dawniej: Smołku),",
    body: [
      "Laboratorium Otchłani z dumą przedstawia prototyp: przeciwnika bez stałej talii. Zanim usiądziesz do stołu, przejrzymy Twoje karty, a potem rozegramy w tajemnicy setki próbnych pojedynków — i zostawimy tylko te demony, które najlepiej wiedzą, gdzie Cię boli.",
      "Bez sztuczek: zwykłe karty, jedna dobierana na turę, te same zasady co u Ciebie. Po prostu talia skrojona na miarę. Uprzedzam, że to wersja eksperymentalna — jeśli coś wybuchnie, to był test.",
    ],
    signature: "Laboratorium Otchłani, dział badań i rozwoju",
  },
  moral:
    "Pokusa zna nasze słabe strony i chętnie w nie celuje. Ale Bóg zna nas jeszcze lepiej — i nie pozwala kusić ponad nasze siły (1 Kor 10,13). Zmień talię, zmień nawyki: nawet idealnie dobrany przeciwnik nie jest wszechmocny.",
};

/** Everyone the player can challenge: the ladder, then the experimental opponent at the very end. */
export const ALL_OPPONENTS: readonly Opponent[] = [...OPPONENTS, IDEAL_OPPONENT];

export const findOpponent = (id: string) => ALL_OPPONENTS.find((o) => o.id === id);
