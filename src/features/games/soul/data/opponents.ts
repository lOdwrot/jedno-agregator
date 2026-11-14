/** Computer opponents — each comes with a letter from an old demon to his young nephew. */
export interface Opponent {
  id: "kanapa" | "plotkary" | "pycha";
  name: string;
  emoji: string;
  difficulty: "łatwy" | "średni" | "trudny";
  reward: { win: number; loss: number };
  /** Card ids (energy included) — 40 cards. */
  deck: Record<string, number>;
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
      drzemka: 3,
      odkladanie: 1,
      scroll: 2,
      zniechecenie: 2,
      szyderca: 3,
      wybredny: 1,
      powiadomienie: 2,
      wymowka: 2,
      reklama: 2,
      obietnica: 1,
      pokusa: 21,
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
      plotka: 3,
      obmowa: 2,
      zlosnik: 3,
      krytykant: 2,
      scroll: 2,
      powiadomienie: 2,
      falszywy: 1,
      hejt: 1,
      galeria: 1,
      reklama: 2,
      czat: 1,
      reset: 1,
      influencer: 1,
      obietnica: 1,
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
      pyszalek: 3,
      lewiatan: 2,
      porownania: 3,
      mamona: 1,
      belzebub: 1,
      krytykant: 2,
      falszywy: 2,
      powiadomienie: 2,
      galeria: 1,
      reklama: 2,
      czat: 1,
      reset: 1,
      influencer: 1,
      obietnica: 1,
      pokusa: 17,
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
];

export const findOpponent = (id: string) => OPPONENTS.find((o) => o.id === id);
