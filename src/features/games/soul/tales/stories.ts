/** Saints' tales: a short illustrated story (one animated scene per page) and a 3-question quiz. */

export type SceneId =
  | "meadow"
  | "wind"
  | "grotto"
  | "spring"
  | "candles"
  | "pilgrims"
  | "town"
  | "stones"
  | "birds"
  | "wolf"
  | "crib"
  | "sun"
  | "field"
  | "mist"
  | "angels"
  | "snow"
  | "harvest";

export interface TalePage {
  scene: SceneId;
  text: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Index of the right option. */
  answer: number;
}

export interface Tale {
  /** Card id of the saint (`data/tales.ts`). */
  id: string;
  title: string;
  pages: TalePage[];
  /** Three questions; the last one always asks who the tale was about. */
  quiz: [QuizQuestion, QuizQuestion, QuizQuestion];
}

const WHO = "O jakim świętym była ta opowieść?";

export const TALES: readonly Tale[] = [
  {
    id: "bernadetta",
    title: "Pastereczka z Lourdes",
    pages: [
      {
        scene: "meadow",
        text: "Dawno temu, u stóp wysokich gór Pirenejów, mieszkała mała Bernadetta. Była drobna, często chorowała i nie umiała jeszcze czytać. Za to bardzo kochała owieczki, które pasła na zielonych łąkach.",
      },
      {
        scene: "wind",
        text: "Pewnego zimowego dnia Bernadetta poszła nad rzekę zbierać chrust. Nagle usłyszała szum, jakby zerwał się silny wiatr… ale gałęzie drzew wcale się nie poruszały!",
      },
      {
        scene: "grotto",
        text: "W skalnej grocie zajaśniało łagodne światło. Stała w nim piękna Pani w białej sukni, z błękitną szarfą i złotymi różami na stopach. Uśmiechnęła się i razem z Bernadettą odmówiła różaniec.",
      },
      {
        scene: "spring",
        text: "Pani przychodziła jeszcze wiele razy. Któregoś dnia powiedziała: „Napij się ze źródła”. Bernadetta zaczęła kopać rękami w błocie… i spod ziemi popłynęła czysta woda. Płynie do dziś!",
      },
      {
        scene: "candles",
        text: "Dorośli nie chcieli wierzyć dziewczynce. Wtedy Pani wyjawiła swoje imię: „Jestem Niepokalane Poczęcie”. Bernadetta nie rozumiała tych trudnych słów, więc powtarzała je przez całą drogę, żeby nie zapomnieć.",
      },
      {
        scene: "pilgrims",
        text: "Dziś do Lourdes przyjeżdżają miliony pielgrzymów z zapalonymi świecami. A Bernadetta? Została siostrą zakonną i mówiła z uśmiechem, że była tylko miotłą, którą Matka Boża posłużyła się, a potem odstawiła do kąta.",
      },
    ],
    quiz: [
      {
        q: "Czym zajmowała się Bernadetta, gdy była małą dziewczynką?",
        options: ["Łowiła ryby w rzece", "Pasła owieczki", "Piekła chleb w piekarni"],
        answer: 1,
      },
      {
        q: "Co popłynęło spod ziemi, gdy Bernadetta kopała w grocie?",
        options: ["Czysta woda ze źródła", "Gorące mleko", "Złote monety"],
        answer: 0,
      },
      {
        q: WHO,
        options: ["Bł. Dorota z Mątów", "Św. Faustyna Kowalska", "Św. Bernadetta Soubirous"],
        answer: 2,
      },
    ],
  },
  {
    id: "biedaczyna",
    title: "Brat wilk i siostra ptaszyna",
    pages: [
      {
        scene: "town",
        text: "W słonecznym mieście Asyż, we Włoszech, żył syn bogatego kupca — Franciszek. Lubił piękne stroje, wesołe zabawy i śpiew. Marzył, że zostanie sławnym rycerzem.",
      },
      {
        scene: "stones",
        text: "Pewnego dnia modlił się w starym, rozpadającym się kościółku. Nagle usłyszał głos z krzyża: „Franciszku, idź i odbuduj mój dom!”. Zostawił bogactwa i zaczął własnymi rękami nosić kamienie.",
      },
      {
        scene: "birds",
        text: "Franciszek kochał wszystko, co stworzył Pan Bóg. Słońce nazywał bratem, a księżyc siostrą. Raz zaczął głosić kazanie ptakom — a one zleciały się całą gromadą i słuchały w ciszy!",
      },
      {
        scene: "wolf",
        text: "W miasteczku Gubbio grasował groźny wilk i wszyscy bali się wychodzić z domów. Franciszek poszedł do niego sam: „Bracie wilku, nie krzywdź już nikogo”. Wilk położył mu łapę na dłoni, a ludzie odtąd go karmili.",
      },
      {
        scene: "crib",
        text: "Na Boże Narodzenie w Greccio Franciszek przygotował w grocie żłóbek z prawdziwym wołem i osiołkiem, żeby każdy zobaczył, jak ubogo urodził się Jezus. Tak zaczęła się tradycja szopek!",
      },
      {
        scene: "sun",
        text: "Wokół Franciszka zebrali się bracia — franciszkanie. Pod koniec życia ułożył „Pieśń słoneczną”, w której dziękował Bogu za słońce, wiatr, wodę i ogień. Pozdrawiał wszystkich słowami: „Pokój i dobro!”.",
      },
    ],
    quiz: [
      {
        q: "Kogo Franciszek nazwał bratem w miasteczku Gubbio?",
        options: ["Niedźwiedzia", "Lisa", "Wilka"],
        answer: 2,
      },
      {
        q: "Co Franciszek przygotował w Greccio na Boże Narodzenie?",
        options: ["Szopkę z wołem i osiołkiem", "Choinkę z lampkami", "Wielki jarmark"],
        answer: 0,
      },
      {
        q: WHO,
        options: ["Św. Jerzy", "Św. Franciszek z Asyżu", "Św. Maksymilian Kolbe"],
        answer: 1,
      },
    ],
  },
  {
    id: "izydor",
    title: "Anioły przy pługu",
    pages: [
      {
        scene: "field",
        text: "Pod Madrytem, w Hiszpanii, żył prosty rolnik Izydor. Nie miał własnej ziemi — orał pole bogatego pana. Ale każdego ranka, zanim zaprzągł woły, biegł jeszcze do kościoła na Mszę świętą.",
      },
      {
        scene: "mist",
        text: "Inni parobkowie zazdrościli mu i skarżyli się: „Izydor się spóźnia, za mało pracuje!”. Pan wstał więc przed świtem i przez gęstą, poranną mgłę poszedł sprawdzić, co się dzieje na polu.",
      },
      {
        scene: "angels",
        text: "I co zobaczył? Izydor się modlił, a obok dwie pary białych wołów same ciągnęły pługi — prowadzone przez aniołów w świetlistych szatach! Bruzdy były proste jak struny.",
      },
      {
        scene: "snow",
        text: "Zimą, gdy śnieg przykrył pola, Izydor niósł do młyna worek ziarna. Zobaczył zmarznięte, głodne ptaki i wysypał im pół worka. Koledzy się śmiali… ale w młynie z worka wyszło więcej mąki niż zwykle!",
      },
      {
        scene: "spring",
        text: "Pewnego upalnego lata pan bardzo chciał pić, a w pobliżu nie było wody. Izydor uderzył ościeniem w suchą ziemię i wytrysnęło chłodne źródło. W Madrycie można je oglądać do dziś.",
      },
      {
        scene: "harvest",
        text: "Izydor i jego żona Maria dzielili się z biednymi każdym kawałkiem chleba. Dziś Izydor jest patronem rolników. Uczy, że modlitwa i praca idą w parze — jak dwa woły w jednym zaprzęgu.",
      },
    ],
    quiz: [
      {
        q: "Kto orał pole, gdy Izydor się modlił?",
        options: ["Sąsiedzi z wioski", "Aniołowie z wołami", "Nikt — pole zostało nieoprane"],
        answer: 1,
      },
      {
        q: "Co Izydor zrobił zimą z częścią ziarna?",
        options: ["Wysypał je głodnym ptakom", "Sprzedał na targu", "Schował w piwnicy"],
        answer: 0,
      },
      {
        q: WHO,
        options: ["Św. Wojciech", "Św. Mikołaj", "Św. Izydor Oracz"],
        answer: 2,
      },
    ],
  },
];

export const taleOf = (id: string): Tale | undefined => TALES.find((t) => t.id === id);

/** Number of right answers. */
export const score = (t: Tale, picks: readonly number[]) =>
  t.quiz.filter((q, i) => picks[i] === q.answer).length;
