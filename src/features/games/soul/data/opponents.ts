import type { AiBoost } from "../engine/state";

/** Computer opponents — each comes with a letter from an old demon to his young nephew. */
export interface Opponent {
  id: "kanapa" | "plotkary" | "pycha" | "otchlan";
  name: string;
  emoji: string;
  difficulty: "łatwy" | "średni" | "trudny" | "ekstremalny";
  reward: { win: number; loss: number };
  /** Card ids (energy included) — 50 cards. */
  deck: Record<string, number>;
  /** Handicap in the computer's favour (harder opponents). */
  boost?: AiBoost;
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
      drzemka: 4,
      odkladanie: 3,
      scroll: 3,
      zniechecenie: 2,
      szyderca: 1,
      wybredny: 1,
      powiadomienie: 2,
      wymowka: 1,
      reklama: 2,
      "ciche-dni": 1,
      obietnica: 1,
      algorytm: 1,
      czat: 1,
      "wieczne-jutro": 1,
      pokusa: 26,
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
    boost: { startEnergy: 1, extraDraw: 0 },
    deck: {
      plotka: 4,
      obmowa: 3,
      zlosnik: 4,
      krytykant: 3,
      scroll: 2,
      powiadomienie: 2,
      algorytm: 2,
      falszywy: 1,
      szef: 2,
      remont: 2,
      "ciche-dni": 1,
      galeria: 1,
      reklama: 1,
      kompleksy: 1,
      czat: 1,
      influencer: 1,
      rozpamietywanie: 1,
      lawina: 1,
      pokusa: 17,
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
      pokusa: 16,
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
    id: "otchlan",
    name: "Otchłań Upadłych",
    emoji: "🔥",
    difficulty: "ekstremalny",
    reward: { win: 450, loss: 80 },
    boost: { startEnergy: 2, extraDraw: 1 },
    deck: {
      lucyfer: 2,
      abaddon: 2,
      acedia: 2,
      belzebub: 2,
      pyszalek: 4,
      lewiatan: 3,
      zlosnik: 1,
      mamona: 2,
      algorytm: 3,
      szef: 2,
      remont: 2,
      hejt: 1,
      "ciche-dni": 1,
      galeria: 1,
      obietnica: 2,
      czat: 1,
      kompleksy: 1,
      reklama: 1,
      rozpamietywanie: 1,
      nawyki: 1,
      smok: 1,
      pokusa: 14,
    },
    letter: {
      greeting: "Smołku, odsuń się,",
      body: [
        "Skoro Ty i Twoje chochliki nie dajecie rady, zajmie się tym zarząd. Twój podopieczny bierze kartę po karcie, jakby miał nieskończenie wiele czasu. Nie ma. Sprawimy, że talia skończy mu się szybciej niż cierpliwość.",
        "Zaczynamy z przewagą: pierwszy z nas wchodzi do gry z ogniem w garści i co turę dobiera więcej. Gniew, pustka i pycha naraz — tego nie wytrzyma nikt. No, prawie nikt. Ale o Tamtym nie rozmawiamy.",
      ],
      signature: "Rada Otchłani (wuj Siarkowąs protokołował)",
    },
    moral:
      "Zło bywa głośne i przytłaczające, ale nie jest wszechmocne. Nikt nie walczy sam: modlitwa, sakramenty i wspólnota są silniejsze niż najgroźniejsza pokusa.",
  },
];

export const findOpponent = (id: string) => OPPONENTS.find((o) => o.id === id);
