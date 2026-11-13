/** Static catalog of the small Bible games (no CMS data — content lives here). */
export type GameSlug = "dawid-i-goliat" | "morze-czerwone" | "arka-noego";

export interface GameInfo {
  slug: GameSlug;
  title: string;
  /** Serif italic accent shown after the title. */
  accent: string;
  emoji: string;
  tagline: string;
  /** Background gradient of the game card (token utilities only). */
  gradient: string;
  minutes: number;
  controls: { touch: string; keyboard: string };
  verse: { text: string; ref: string };
  reflection: string;
  prayer: string;
}

export const GAMES: readonly GameInfo[] = [
  {
    slug: "dawid-i-goliat",
    title: "Dawid i Goliat",
    accent: "pięć kamieni",
    emoji: "🪨",
    tagline:
      "Goliat ma trzy metry wzrostu, zbroję i bardzo dużo do powiedzenia. Ty masz procę, pięć gładkich kamieni i Pana Boga.",
    gradient: "from-logo-yellow via-logo-orange to-logo-red",
    minutes: 2,
    controls: {
      touch: "Przeciągnij palcem w lewo-w dół (jak gumkę procy) i puść, żeby rzucić.",
      keyboard: "↑ ↓ — kąt, ← → — siła, Spacja lub Enter — rzut.",
    },
    verse: {
      text: "Ty idziesz na mnie z mieczem, dzidą i zakrzywionym nożem, ja zaś idę na ciebie w imię Pana Zastępów.",
      ref: "1 Sm 17,45",
    },
    reflection:
      "Twoje „Goliaty” — strach, nałóg, egzamin, samotność — potrafią wyglądać na trzy metry. Dawid nie był najsilniejszy, ale wiedział, Komu ufa. Jaki Goliat stoi dziś przed Tobą?",
    prayer: "Panie, daj mi odwagę Dawida. Z Tobą nie boję się olbrzymów.",
  },
  {
    slug: "morze-czerwone",
    title: "Przez Morze",
    accent: "Czerwone",
    emoji: "🌊",
    tagline:
      "Morze się rozstąpiło, a za plecami pędzą rydwany faraona. Uciekaj suchą stopą, omijaj kraby i na drugim brzegu wyciągnij rękę nad morze!",
    gradient: "from-logo-blue via-navy-600 to-navy",
    minutes: 2,
    controls: {
      touch: "Stuknij lewą lub prawą stronę planszy (albo przyciski ◀ ▶), żeby zmienić tor.",
      keyboard: "← → (lub A / D) — zmiana toru, Spacja — wyciągnij rękę nad morze.",
    },
    verse: { text: "Pan będzie walczył za was, a wy będziecie spokojni.", ref: "Wj 14,14" },
    reflection:
      "Kiedy za plecami goni przeszłość, a przed Tobą widać tylko wodę, Bóg potrafi otworzyć drogę tam, gdzie jej nie było. Nie musisz wygrywać wszystkiego sam.",
    prayer: "Boże, prowadź mnie przez moje morza. Ufam, że Ty walczysz za mnie.",
  },
  {
    slug: "arka-noego",
    title: "Arka Noego",
    accent: "po dwoje",
    emoji: "🕊️",
    tagline:
      "Zaraz zacznie padać! Znajdź pary zwierząt i wprowadź je na Arkę — lwy, żyrafy, a nawet bardzo powolne żółwie.",
    gradient: "from-logo-blue via-logo-orange to-logo-yellow",
    minutes: 3,
    controls: {
      touch: "Stuknij kartę, żeby ją odkryć. Znajdź dwie takie same.",
      keyboard: "Tab / strzałki — wybór karty, Enter lub Spacja — odkrycie.",
    },
    verse: {
      text: "Łuk mój kładę na obłoki, aby był znakiem przymierza między Mną a ziemią.",
      ref: "Rdz 9,13",
    },
    reflection:
      "Noe budował arkę, zanim spadła pierwsza kropla — zaufał, zanim zobaczył. Bóg dotrzymuje obietnic, a tęcza przypomina, że po każdej burzy On wciąż jest z nami.",
    prayer: "Panie, naucz mnie ufać Ci, zanim zobaczę tęczę.",
  },
];

export function findGame(slug: string | undefined): GameInfo | undefined {
  return GAMES.find((g) => g.slug === slug);
}
