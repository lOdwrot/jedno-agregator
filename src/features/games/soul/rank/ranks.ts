/** Rank ladder of "Walka o duszę": every rank has a patron (picture from `data/art.ts`) and a short story. */
export interface Patron {
  /** Key of the picture in `data/art.ts` / `public/soul/art`. */
  art: string;
  name: string;
  /** Years of life (or a short note). */
  life: string;
  /** Liturgical memorial. */
  feast: string;
  /** Short motto or quote. */
  motto: string;
  bio: string[];
}

export interface Rank {
  name: string;
  emoji: string;
  patron: Patron;
}

export const RANKS: readonly Rank[] = [
  {
    name: "Katechumen",
    emoji: "🕯️",
    patron: {
      art: "wojciech",
      name: "św. Wojciech",
      life: "ok. 956–997",
      feast: "23 kwietnia",
      motto: "Pierwszy, który przyniósł Ewangelię nad Motławę.",
      bio: [
        "Biskup Pragi, który wybrał drogę misjonarza. W 997 roku przybył do Gdańska i ochrzcił wielu jego mieszkańców — to najstarsza wzmianka o naszym mieście.",
        "Ruszył dalej, do Prusów, i tam zginął śmiercią męczeńską. Jest głównym patronem Polski — opiekunem tych, którzy dopiero zaczynają drogę wiary.",
      ],
    },
  },
  {
    name: "Ministrant",
    emoji: "🔔",
    patron: {
      art: "pius10",
      name: "św. Pius X",
      life: "1835–1914",
      feast: "21 sierpnia",
      motto: "Odnowić wszystko w Chrystusie.",
      bio: [
        "Syn listonosza z wioski Riese, został papieżem, ale do końca żył skromnie.",
        "To on pozwolił dzieciom przyjmować Komunię Świętą już od około siódmego roku życia i zachęcał wszystkich do częstej Komunii. Dlatego jest bliskim patronem dzieci pierwszokomunijnych i służby liturgicznej.",
      ],
    },
  },
  {
    name: "Lektor",
    emoji: "📖",
    patron: {
      art: "grzegorz1",
      name: "św. Grzegorz Wielki",
      life: "ok. 540–604",
      feast: "3 września",
      motto: "Sługa sług Bożych.",
      bio: [
        "Papież i doktor Kościoła, znakomity kaznodzieja — jego homilie o Ewangelii czytano przez całe średniowiecze. Od jego imienia pochodzi nazwa chorału gregoriańskiego.",
        "Wysłał misjonarzy do Anglii i jako pierwszy nazwał papieża „sługą sług Bożych”. Pokazuje, że czytanie Słowa to służba, nie popis.",
      ],
    },
  },
  {
    name: "Rycerz Niepokalanej",
    emoji: "🛡️",
    patron: {
      art: "kolbe",
      name: "św. Maksymilian Maria Kolbe",
      life: "1894–1941",
      feast: "14 sierpnia",
      motto: "Tylko miłość jest twórcza.",
      bio: [
        "Franciszkanin, założyciel Niepokalanowa i Rycerstwa Niepokalanej. Wydawał gazety, budował radiostację i marzył, by Dobra Nowina dotarła do każdego.",
        "W obozie Auschwitz dobrowolnie oddał życie za współwięźnia, ojca rodziny Franciszka Gajowniczka. Patron trudnych czasów i ludzi mediów.",
      ],
    },
  },
  {
    name: "Świadek Prawdy",
    emoji: "✊",
    patron: {
      art: "popieluszko",
      name: "bł. ks. Jerzy Popiełuszko",
      life: "1947–1984",
      feast: "19 października",
      motto: "Zło dobrem zwyciężaj.",
      bio: [
        "Kapelan „Solidarności”, który w stanie wojennym odprawiał w Warszawie Msze za Ojczyznę. Mówił o prawdzie, godności i przebaczeniu, nigdy o zemście.",
        "Zamordowany przez funkcjonariuszy Służby Bezpieczeństwa, w 2010 roku ogłoszony błogosławionym. Uczy odwagi bez nienawiści.",
      ],
    },
  },
  {
    name: "Pustelnik",
    emoji: "⛰️",
    patron: {
      art: "celestyn5",
      name: "św. Celestyn V",
      life: "ok. 1210–1296",
      feast: "19 maja",
      motto: "Cisza, w której słychać Boga.",
      bio: [
        "Pustelnik z gór Abruzji, który w 1294 roku niespodziewanie został wybrany papieżem.",
        "Po kilku miesiącach dobrowolnie zrzekł się urzędu, by wrócić do modlitwy i ciszy. Jego pokora przypomina, że najważniejsza walka toczy się w sercu.",
      ],
    },
  },
  {
    name: "Siewca Pokoju",
    emoji: "🕊️",
    patron: {
      art: "jan23",
      name: "św. Jan XXIII",
      life: "1881–1963",
      feast: "11 października",
      motto: "Posłuszeństwo i pokój.",
      bio: [
        "Nazywany „dobrym papieżem” — pogodny, serdeczny, z poczuciem humoru. Zwołał Sobór Watykański II, by otworzyć okna Kościoła na świat.",
        "W encyklice „Pacem in terris” pisał, że pokój buduje się na prawdzie, sprawiedliwości, miłości i wolności.",
      ],
    },
  },
  {
    name: "Hetman",
    emoji: "⚔️",
    patron: {
      art: "innocenty11",
      name: "bł. Innocenty XI",
      life: "1611–1689",
      feast: "12 sierpnia",
      motto: "Wspólnie bronić tego, co cenne.",
      bio: [
        "Papież, który zjednoczył chrześcijańskich władców w Lidze Świętej i wspierał króla Jana III Sobieskiego przed odsieczą wiedeńską w 1683 roku.",
        "Sam żył bardzo skromnie, walczył z nepotyzmem i rozrzutnością na dworze papieskim. Patron tych, którzy prowadzą innych.",
      ],
    },
  },
  {
    name: "Obrońca Bram",
    emoji: "🏰",
    patron: {
      art: "leon1",
      name: "św. Leon Wielki",
      life: "zm. 461",
      feast: "10 listopada",
      motto: "Poznaj, chrześcijaninie, swoją godność.",
      bio: [
        "Papież i doktor Kościoła. W 452 roku wyszedł bez wojska naprzeciw Attyli i przekonał go, by zawrócił spod Rzymu. Kilka lat później wyprosił u Wandalów oszczędzenie mieszkańców miasta.",
        "Jego list o dwóch naturach Chrystusa przyjął Sobór Chalcedoński słowami: „Piotr przemówił przez Leona”.",
      ],
    },
  },
  {
    name: "Pasterz",
    emoji: "🐑",
    patron: {
      art: "jp2",
      name: "św. Jan Paweł II",
      life: "1920–2005",
      feast: "22 października",
      motto: "Nie lękajcie się!",
      bio: [
        "Karol Wojtyła z Wadowic — aktor, robotnik, ksiądz, biskup Krakowa, a od 1978 roku papież. Odwiedził ponad sto krajów i zapoczątkował Światowe Dni Młodzieży.",
        "W 1987 roku na Westerplatte mówił do młodych: „Każdy z was, młodzi przyjaciele, znajduje też w życiu jakieś swoje Westerplatte”.",
      ],
    },
  },
  {
    name: "Opoka",
    emoji: "🗝️",
    patron: {
      art: "piotr",
      name: "św. Piotr Apostoł",
      life: "zm. ok. 64–67",
      feast: "29 czerwca",
      motto: "Ty jesteś Piotr, czyli Skała.",
      bio: [
        "Rybak z Galilei, którego Jezus uczynił rybakiem ludzi. Chodził po wodzie, a potem zaczął tonąć; trzy razy się zaparł, a potem trzy razy wyznał: „Panie, Ty wiesz, że Cię kocham”.",
        "Pierwszy papież, ukrzyżowany w Rzymie. Najwyższa ranga przypomina, że opoka to nie ktoś bez upadków, tylko ktoś, kto zawsze wraca.",
      ],
    },
  },
];
