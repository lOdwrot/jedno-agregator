/**
 * "Poznaj historię" — short, encouraging stories of the popes in the card game (the "i" button on
 * every pope card). Plain facts written for teenagers; quotes only where the source is well known.
 */
export interface PopeFact {
  emoji: string;
  title: string;
  text: string;
}

export interface PopeStory {
  /** Card id of the pope. */
  id: string;
  /** Year the pontificate began — position on the timeline. */
  year: number;
  /** Pontificate, as printed. */
  reign: string;
  /** Which pope in the line of St Peter. */
  number: number;
  born: string;
  /** One-sentence hook under the name. */
  hook: string;
  facts: PopeFact[];
  quote?: { text: string; source: string };
  /** "Twój krok" — what this life says to a young reader today. */
  today: string;
}

export const POPE_STORIES: PopeStory[] = [
  {
    id: "piotr",
    year: 33,
    reign: "ok. 30 – ok. 64/67",
    number: 1,
    born: "Betsaida nad Jeziorem Galilejskim",
    hook: "Zwykły rybak, który popełniał błędy — i właśnie jemu Jezus powierzył swój Kościół.",
    facts: [
      {
        emoji: "🎣",
        title: "Rybak z charakterem",
        text: "Szymon łowił ryby z bratem Andrzejem. Gdy Jezus powiedział „pójdź za Mną”, zostawił sieci od razu — bez planu B.",
      },
      {
        emoji: "🪨",
        title: "Nowe imię: Skała",
        text: "Jezus nazwał go Kefas, czyli Skała (po grecku Petros): „Ty jesteś Piotr i na tej skale zbuduję mój Kościół” (Mt 16,18).",
      },
      {
        emoji: "🌊",
        title: "Szedł po wodzie",
        text: "Jako jedyny z uczniów wyszedł z łodzi i szedł po wodzie do Jezusa. Zaczął tonąć, gdy spojrzał na fale zamiast na Niego.",
      },
      {
        emoji: "🐓",
        title: "Upadek i powrót",
        text: "Trzy razy zaparł się Jezusa, zanim kogut zapiał. Po zmartwychwstaniu Jezus trzy razy zapytał: „Czy miłujesz Mnie?” — i dał mu drugą szansę.",
      },
      {
        emoji: "⛪",
        title: "Grób pod kopułą",
        text: "Zginął za wiarę w Rzymie za cesarza Nerona. Bazylika św. Piotra stoi dokładnie nad miejscem, gdzie go pochowano.",
      },
    ],
    quote: {
      text: "Panie, do kogo pójdziemy? Ty masz słowa życia wiecznego.",
      source: "J 6,68",
    },
    today:
      "Nie musisz być idealny, żeby Bóg na Ciebie liczył. Piotr upadał, ale zawsze wracał — i to wystarczyło, by stać się opoką dla innych.",
  },
  {
    id: "leon1",
    year: 440,
    reign: "440–461",
    number: 45,
    born: "Toskania (prawdopodobnie)",
    hook: "Wyszedł bez armii naprzeciw najgroźniejszego wodza swoich czasów — i Rzym ocalał.",
    facts: [
      {
        emoji: "🐎",
        title: "Twarzą w twarz z Attylą",
        text: "W 452 r. Hunowie pustoszyli Italię. Leon pojechał do Attyli z kilkoma posłami i przekonał go, by zawrócił. Hunowie nie ruszyli na Rzym.",
      },
      {
        emoji: "🔥",
        title: "Negocjator z Wandalami",
        text: "Trzy lata później pod Rzymem stanęli Wandalowie. Miasta nie dało się obronić, ale Leon wymógł, że nie będzie podpalone, a mieszkańcy nie zginą.",
      },
      {
        emoji: "✉️",
        title: "List, który zakończył spór",
        text: "W „Liście do Flawiana” jasno wyjaśnił, że Jezus jest prawdziwym Bogiem i prawdziwym człowiekiem. Na soborze w Chalcedonie biskupi wołali: „Piotr przemówił przez Leona!”.",
      },
      {
        emoji: "👑",
        title: "Pierwszy „Wielki”",
        text: "Był pierwszym papieżem, którego nazwano Wielkim. Jest też doktorem Kościoła — jego kazania czyta się do dziś.",
      },
    ],
    quote: {
      text: "Poznaj, chrześcijaninie, swoją godność!",
      source: "kazanie na Boże Narodzenie",
    },
    today:
      "Odwaga nie zawsze oznacza siłę mięśni. Czasem to spokojna rozmowa z kimś, kogo wszyscy się boją — i wiara, że Bóg idzie z Tobą.",
  },
  {
    id: "grzegorz1",
    year: 590,
    reign: "590–604",
    number: 64,
    born: "Rzym",
    hook: "Bogacz i burmistrz Rzymu, który rozdał majątek, został mnichem i nazwał siebie „sługą sług Bożych”.",
    facts: [
      {
        emoji: "🏛️",
        title: "Kariera, którą porzucił",
        text: "Był prefektem Rzymu — najważniejszym urzędnikiem miasta. Zostawił to, a z rodzinnego majątku założył klasztory i sam został mnichem.",
      },
      {
        emoji: "🙏",
        title: "Papież w czasie zarazy",
        text: "Wybrano go, gdy Rzym dziesiątkowała dżuma. Pierwsze, co zrobił: poprowadził przez miasto wielką procesję modlitwy i pokuty.",
      },
      {
        emoji: "🍞",
        title: "Chleb dla głodnych",
        text: "Zorganizował rozdawanie zboża ubogim i codziennie gościł ubogich przy swoim stole. Mówił o sobie: „sługa sług Bożych” — papieże używają tego tytułu do dziś.",
      },
      {
        emoji: "⛵",
        title: "Misja na koniec świata",
        text: "Wysłał mnichów z Augustynem do Anglii, by głosili Ewangelię Anglosasom. Tak powstał Kościół w Canterbury.",
      },
      {
        emoji: "🎶",
        title: "Chorał gregoriański",
        text: "Jego imieniem nazwano śpiew, którym Kościół modli się od wieków. Tradycja mówi, że to on zadbał o porządek liturgicznych melodii.",
      },
    ],
    quote: {
      text: "Dowodem miłości jest czyn.",
      source: "homilie na Ewangelie",
    },
    today:
      "Prawdziwa wielkość to służba. Zamiast pytać „co z tego będę miał?”, zapytaj dziś: „komu mogę pomóc?”.",
  },
  {
    id: "celestyn5",
    year: 1294,
    reign: "1294 (5 miesięcy)",
    number: 192,
    born: "Molise, Italia",
    hook: "Pustelnik z gór, którego wyciągnięto z jaskini na tron papieski — a on miał odwagę powiedzieć: „to nie dla mnie”.",
    facts: [
      {
        emoji: "⛰️",
        title: "Pustelnik z Morrone",
        text: "Piotr z Morrone przez lata żył w samotności w górach Abruzji, modląc się i poszcząc. Wokół niego powstała wspólnota — celestyni.",
      },
      {
        emoji: "🗳️",
        title: "Konklawe, które trwało 2 lata",
        text: "Kardynałowie nie mogli się dogadać przez ponad dwa lata. Gdy pustelnik napisał do nich list z napomnieniem, wybrali… właśnie jego. Miał ok. 85 lat.",
      },
      {
        emoji: "🕊️",
        title: "Bulla przebaczenia",
        text: "W L'Aquili ogłosił odpust dla każdego, kto szczerze się nawróci. To święto — Perdonanza — obchodzi się tam do dziś, co roku pod koniec sierpnia.",
      },
      {
        emoji: "🚪",
        title: "Odważna rezygnacja",
        text: "Po pięciu miesiącach uznał, że nie da rady rządzić, i zrzekł się urzędu. W 2009 r. Benedykt XVI położył na jego grobie swój paliusz — a 4 lata później sam zrezygnował.",
      },
    ],
    today:
      "Pokora to nie słabość. Znać swoje granice i szczerze o nich powiedzieć — to też jest odwaga.",
  },
  {
    id: "pius5",
    year: 1566,
    reign: "1566–1572",
    number: 225,
    born: "Bosco koło Alessandrii, Włochy",
    hook: "Pasterz owiec, który został papieżem — i poprosił całą Europę o różaniec.",
    facts: [
      {
        emoji: "🐑",
        title: "Najpierw owce",
        text: "Antonio Ghislieri pochodził z ubogiej rodziny i jako chłopiec pasł owce. W wieku 14 lat wstąpił do dominikanów.",
      },
      {
        emoji: "🤍",
        title: "Skąd biała sutanna?",
        text: "Jako papież nie zrezygnował z białego habitu dominikanina. Według tradycji właśnie od niego papieże ubierają się na biało.",
      },
      {
        emoji: "📖",
        title: "Porządek po Soborze",
        text: "Wprowadzał w życie postanowienia Soboru Trydenckiego: wydał Katechizm Rzymski, nowy brewiarz i Mszał, z którego Kościół korzystał przez 400 lat.",
      },
      {
        emoji: "⚓",
        title: "Lepanto",
        text: "W 1571 r. pod Lepanto flota chrześcijan stanęła do bitwy z potężną flotą turecką. Pius V prosił wszystkich o modlitwę różańcową — bitwa zakończyła się zwycięstwem.",
      },
      {
        emoji: "📿",
        title: "Święto Różańca",
        text: "Na pamiątkę zwycięstwa ustanowił święto Matki Bożej Zwycięskiej — dziś obchodzimy je 7 października jako wspomnienie Matki Bożej Różańcowej.",
      },
    ],
    today:
      "Pius V wiedział, że modlitwa to nie dodatek, tylko najmocniejsza broń. Masz w kieszeni różaniec albo aplikację — sięgnij po nią, zanim zaczniesz się martwić.",
  },
  {
    id: "innocenty11",
    year: 1676,
    reign: "1676–1689",
    number: 240,
    born: "Como, Lombardia",
    hook: "Papież, który zjednoczył Europę, by pomóc Wiedniowi — a Jan III Sobieski przysłał mu zdobyty sztandar.",
    facts: [
      {
        emoji: "⚔️",
        title: "Liga Święta",
        text: "Gdy w 1683 r. ogromna armia turecka oblegała Wiedeń, Innocenty XI przekonywał władców do sojuszu i wysyłał pieniądze na wojsko — także polskie.",
      },
      {
        emoji: "🇵🇱",
        title: "Odsiecz wiedeńska",
        text: "12 września 1683 r. husaria Jana III Sobieskiego rozbiła Turków. Król napisał do papieża: „Przybyliśmy, zobaczyliśmy, Bóg zwyciężył”.",
      },
      {
        emoji: "💙",
        title: "Święto Imienia Maryi",
        text: "Na pamiątkę zwycięstwa papież ustanowił dla całego Kościoła święto Najświętszego Imienia Maryi — 12 września.",
      },
      {
        emoji: "🪙",
        title: "Oszczędny i uczciwy",
        text: "Skończył z rozdawaniem urzędów krewnym, ciął wydatki i spłacał długi Państwa Kościelnego. Sam żył bardzo skromnie.",
      },
    ],
    quote: {
      text: "Venimus, vidimus, Deus vicit — przybyliśmy, zobaczyliśmy, Bóg zwyciężył.",
      source: "Jan III Sobieski do papieża, 1683",
    },
    today:
      "Wielkie rzeczy dzieją się, gdy ludzie potrafią działać razem. Ty też możesz łączyć, zamiast dzielić — w klasie, w drużynie, w parafii.",
  },
  {
    id: "pius9",
    year: 1846,
    reign: "1846–1878",
    number: 255,
    born: "Senigallia, Italia",
    hook: "Rekordzista: rządził Kościołem 31 lat — dłużej niż ktokolwiek po św. Piotrze.",
    facts: [
      {
        emoji: "⏳",
        title: "Najdłuższy pontyfikat",
        text: "31 lat i ponad 7 miesięcy — żaden inny papież (poza św. Piotrem według tradycji) nie był nim dłużej.",
      },
      {
        emoji: "🤍",
        title: "Niepokalane Poczęcie",
        text: "W 1854 r. ogłosił dogmat, że Maryja od początku była wolna od grzechu. Cztery lata później w Lourdes Maryja przedstawiła się Bernadecie: „Jestem Niepokalane Poczęcie”.",
      },
      {
        emoji: "🏛️",
        title: "Sobór Watykański I",
        text: "Zwołał pierwszy od 300 lat sobór. Przerwała go wojna — wojska włoskie zajęły Rzym w 1870 r.",
      },
      {
        emoji: "🔒",
        title: "Więzień Watykanu",
        text: "Po utracie Rzymu nie opuszczał już Watykanu na znak protestu. Pokazał jednak, że siła papieża nie zależy od ziemi i armii.",
      },
      {
        emoji: "💪",
        title: "Pokonał chorobę",
        text: "Jako chłopak chorował na padaczkę i bał się, że nie zostanie księdzem. Modlił się o zdrowie — i wyzdrowiał.",
      },
    ],
    today:
      "Gdy coś tracisz, nie tracisz siebie. To, kim jesteś w Bożych oczach, zostaje nawet wtedy, gdy wszystko wokół się sypie.",
  },
  {
    id: "leon13",
    year: 1878,
    reign: "1878–1903",
    number: 256,
    born: "Carpineto Romano, Włochy",
    hook: "Papież, który stanął po stronie robotników, kochał różaniec i jako pierwszy dał się nagrać kamerze.",
    facts: [
      {
        emoji: "⚒️",
        title: "Rerum novarum",
        text: "W 1891 r. napisał encyklikę o sprawach robotników: o godnej zapłacie, odpoczynku w niedzielę i prawie do zrzeszania się. To początek nauki społecznej Kościoła.",
      },
      {
        emoji: "📿",
        title: "Papież różańca",
        text: "Napisał aż jedenaście encyklik o różańcu. To dzięki niemu październik stał się miesiącem różańcowym.",
      },
      {
        emoji: "🎥",
        title: "Pierwszy na filmie",
        text: "W 1896 r. jako pierwszy papież został sfilmowany — pobłogosławił kamerę. Zachowało się też nagranie jego głosu.",
      },
      {
        emoji: "🗡️",
        title: "Modlitwa do św. Michała",
        text: "Ułożył modlitwę do św. Michała Archanioła, którą do dziś wiele osób odmawia po Mszy świętej.",
      },
      {
        emoji: "🎂",
        title: "93 lata",
        text: "Gdy go wybrano, miał 67 lat i słabe zdrowie — myślano, że będzie papieżem krótko. Rządził 25 lat i zmarł w wieku 93 lat.",
      },
    ],
    quote: {
      text: "Święty Michale Archaniele, wspomagaj nas w walce.",
      source: "Modlitwa do św. Michała Archanioła",
    },
    today:
      "Leon XIII pokazał, że wiara dotyczy też pracy, płacy i sprawiedliwości. Gdy widzisz, że ktoś jest traktowany nieuczciwie, nie przechodź obojętnie.",
  },
  {
    id: "pius10",
    year: 1903,
    reign: "1903–1914",
    number: 257,
    born: "Riese, Wenecja Euganejska",
    hook: "Chłopak z biednej wiejskiej rodziny, który otworzył dzieciom drogę do Komunii Świętej.",
    facts: [
      {
        emoji: "👞",
        title: "Boso do szkoły",
        text: "Giuseppe Sarto był synem gminnego posłańca. Żeby oszczędzać buty, nosił je w ręku i zakładał dopiero przed szkołą.",
      },
      {
        emoji: "🍞",
        title: "Komunia dla dzieci",
        text: "Wcześniej do I Komunii przystępowano często dopiero jako nastolatki. Pius X pozwolił dzieciom przyjmować Jezusa, gdy tylko odróżniają zwykły chleb od Eucharystii — mniej więcej od 7. roku życia.",
      },
      {
        emoji: "🔁",
        title: "Częsta Komunia",
        text: "Zachęcał, by przyjmować Komunię często, nawet codziennie — nie jako nagrodę dla doskonałych, ale jako lekarstwo dla słabych.",
      },
      {
        emoji: "🎼",
        title: "Powrót chorału",
        text: "Chciał, by w kościołach znów brzmiał chorał gregoriański zamiast operowych arii.",
      },
      {
        emoji: "⭐",
        title: "Święty papież po wiekach",
        text: "Kanonizowano go w 1954 r. Był pierwszym papieżem ogłoszonym świętym od czasów Piusa V (XVI w.).",
      },
    ],
    quote: {
      text: "Odnowić wszystko w Chrystusie.",
      source: "zawołanie papieskie (Instaurare omnia in Christo)",
    },
    today:
      "Jezus chce być blisko Ciebie już teraz, nie dopiero „kiedy dorośniesz” albo „kiedy będziesz lepszy”.",
  },
  {
    id: "jan23",
    year: 1958,
    reign: "1958–1963",
    number: 261,
    born: "Sotto il Monte, Lombardia",
    hook: "„Dobry Papież” z wielkiej chłopskiej rodziny — miał być papieżem „na chwilę”, a otworzył okna całego Kościoła.",
    facts: [
      {
        emoji: "👨‍👩‍👧‍👦",
        title: "Jedno z trzynaściorga",
        text: "Angelo Roncalli był czwartym z trzynaściorga dzieci w biednej rodzinie rolników. Całe życie pamiętał, jak smakuje skromny obiad.",
      },
      {
        emoji: "🩺",
        title: "Sanitariusz na wojnie",
        text: "W czasie I wojny światowej służył jako sanitariusz i kapelan wojskowy. Widział cierpienie z bliska — i dlatego tak bardzo pragnął pokoju.",
      },
      {
        emoji: "🛂",
        title: "Ratował ludzi",
        text: "Jako dyplomata papieski w Turcji w czasie II wojny pomagał Żydom uciekającym przed nazistami — m.in. załatwiając im dokumenty.",
      },
      {
        emoji: "🪟",
        title: "Sobór Watykański II",
        text: "Wszyscy myśleli, że będzie papieżem „na chwilę”. A on zwołał sobór, który odnowił Kościół — mówił, że chce „otworzyć okna”.",
      },
      {
        emoji: "😄",
        title: "Poczucie humoru",
        text: "Zapytany, ilu ludzi pracuje w Watykanie, odpowiedział: „Mniej więcej połowa”.",
      },
    ],
    quote: {
      text: "Wracając do domu, znajdziecie dzieci. Pogłaszczcie je i powiedzcie: to jest pieszczota od papieża.",
      source: "„przemówienie przy świetle księżyca”, 11 X 1962",
    },
    today:
      "Dobroć i uśmiech zmieniają świat bardziej, niż myślisz. Nie trzeba czekać na wielką okazję — zacznij od domu.",
  },
  {
    id: "jp2",
    year: 1978,
    reign: "1978–2005",
    number: 264,
    born: "Wadowice",
    hook: "Aktor, poeta, robotnik, narciarz — i papież, który był też w Gdańsku, Sopocie i Pelplinie.",
    facts: [
      {
        emoji: "🎭",
        title: "Aktor i poeta",
        text: "Karol Wojtyła grał w teatrze, pisał wiersze i dramaty. W czasie wojny pracował fizycznie w kamieniołomie i fabryce Solvay.",
      },
      {
        emoji: "⛷️",
        title: "Góry i kajaki",
        text: "Kochał narty, wędrówki i spływy kajakowe z młodzieżą — oni mówili do niego „Wujek”. Nawet jako papież wymykał się czasem w góry.",
      },
      {
        emoji: "🌍",
        title: "104 podróże",
        text: "W 104 pielgrzymkach zagranicznych odwiedził ok. 130 krajów. Zapoczątkował Światowe Dni Młodzieży, na które przyjeżdżają miliony młodych z całego świata.",
      },
      {
        emoji: "⚓",
        title: "Westerplatte i Wybrzeże",
        text: "W 1987 r. na Westerplatte powiedział młodym, że każdy ma w życiu „swoje Westerplatte” — wartości, których trzeba bronić. W 1999 r. odprawił Mszę w Sopocie i odwiedził Pelplin.",
      },
      {
        emoji: "🕊️",
        title: "Przebaczył zamachowcy",
        text: "13 maja 1981 r. został ciężko postrzelony na placu św. Piotra. Po wyjściu ze szpitala odwiedził zamachowca w więzieniu i mu przebaczył.",
      },
    ],
    quote: {
      text: "Musicie od siebie wymagać, nawet gdyby inni od was nie wymagali.",
      source: "do młodzieży na Jasnej Górze, 1983",
    },
    today:
      "Twoje Westerplatte to coś, czego nie oddasz — prawda, czystość serca, przyjaźń z Bogiem. Nie lękaj się go bronić!",
  },
  {
    id: "benedykt16",
    year: 2005,
    reign: "2005–2013",
    number: 265,
    born: "Marktl, Bawaria",
    hook: "Profesor, który grał Mozarta na fortepianie i pokazał, że wiara i rozum to przyjaciele.",
    facts: [
      {
        emoji: "🎹",
        title: "Pianista",
        text: "Joseph Ratzinger od dziecka grał na fortepianie. Jego ulubionym kompozytorem był Mozart — nawet jako papież znajdował czas na muzykę.",
      },
      {
        emoji: "📚",
        title: "Genialny teolog",
        text: "Był profesorem, ekspertem na Soborze Watykańskim II i przez prawie 25 lat najbliższym współpracownikiem Jana Pawła II.",
      },
      {
        emoji: "❤️",
        title: "Bóg jest miłością",
        text: "Pierwszą encyklikę zatytułował „Deus caritas est” — „Bóg jest miłością”. Napisał też trzy książki o Jezusie z Nazaretu.",
      },
      {
        emoji: "🐈",
        title: "Przyjaciel kotów",
        text: "Słynął z miłości do kotów — podobno w Rzymie te z sąsiedztwa przychodziły do niego jak do starego znajomego.",
      },
      {
        emoji: "🚪",
        title: "Pokorna decyzja",
        text: "W 2013 r. jako pierwszy od prawie 600 lat papież zrezygnował z urzędu, bo czuł, że brakuje mu sił. Resztę życia spędził na modlitwie.",
      },
    ],
    quote: {
      text: "Kto wierzy, nigdy nie jest sam.",
      source: "homilia na rozpoczęcie pontyfikatu, 2005",
    },
    today:
      "Pytaj, myśl, czytaj — wiara nie boi się trudnych pytań. A gdy czujesz się samotny, pamiętaj: z Bogiem nigdy nie jesteś sam.",
  },
  {
    id: "franciszek",
    year: 2013,
    reign: "2013–2025",
    number: 266,
    born: "Buenos Aires, Argentyna",
    hook: "Pierwszy papież z Ameryki, który jeździł metrem, sam gotował i prosił młodych: „róbcie raban!”.",
    facts: [
      {
        emoji: "🧪",
        title: "Technik chemik",
        text: "Zanim wstąpił do jezuitów, Jorge Bergoglio skończył technikum chemiczne i pracował w laboratorium. Dorabiał też, pilnując wejścia do klubu — sam to potem ze śmiechem wspominał.",
      },
      {
        emoji: "⚽",
        title: "Kibic San Lorenzo",
        text: "Całe życie kibicował drużynie piłkarskiej San Lorenzo z Buenos Aires. Kochał też tango i literaturę.",
      },
      {
        emoji: "🚇",
        title: "Biskup z metra",
        text: "Jako arcybiskup Buenos Aires mieszkał w małym mieszkaniu, sam gotował i jeździł do ubogich dzielnic metrem i autobusem.",
      },
      {
        emoji: "🥇",
        title: "Same „pierwsze”",
        text: "Pierwszy papież z Ameryki, pierwszy jezuita i pierwszy, który wybrał imię Franciszek — na cześć świętego od ubogich.",
      },
      {
        emoji: "🛋️",
        title: "Zejdźcie z kanapy!",
        text: "Na Światowych Dniach Młodzieży w Krakowie w 2016 r. przekonywał, że szczęście nie leży na kanapie — i zachęcał młodych, by wstali i zostawili ślad.",
      },
    ],
    quote: {
      text: "Nie przyszliśmy na świat, aby wegetować, ale by zostawić ślad.",
      source: "ŚDM w Krakowie, 2016",
    },
    today:
      "Chochliki z kanapy chcą, żebyś tylko przewijał ekran. Franciszek mówi: wstań, idź do ludzi i zrób coś dobrego — Twoje życie ma zostawić ślad.",
  },
  {
    id: "leon14",
    year: 2025,
    reign: "od 2025",
    number: 267,
    born: "Chicago, Stany Zjednoczone",
    hook: "Matematyk z Chicago i misjonarz z Peru, który przywitał świat słowami: „Pokój wam wszystkim!”.",
    facts: [
      {
        emoji: "📐",
        title: "Matematyk",
        text: "Robert Francis Prevost najpierw skończył studia matematyczne, a potem wstąpił do zakonu augustianów.",
      },
      {
        emoji: "🇵🇪",
        title: "Misjonarz w Peru",
        text: "Wiele lat pracował jako misjonarz w Peru, a później był biskupem w Chiclayo. Ma także obywatelstwo peruwiańskie.",
      },
      {
        emoji: "🥇",
        title: "Same „pierwsze”",
        text: "Wybrany 8 maja 2025 r. jako pierwszy papież ze Stanów Zjednoczonych i pierwszy augustianin na Stolicy Piotrowej.",
      },
      {
        emoji: "⚒️",
        title: "Dlaczego Leon?",
        text: "Imię wybrał na pamiątkę Leona XIII — tamten bronił robotników w czasach maszyn parowych, a nowy papież chce pomagać ludziom w czasach sztucznej inteligencji.",
      },
      {
        emoji: "🤝",
        title: "W Tym Jedynym — jedno",
        text: "Jego zawołanie to słowa św. Augustyna „In Illo uno unum”: choć jest nas wielu, w Chrystusie jesteśmy jedno.",
      },
    ],
    quote: {
      text: "Pokój wam wszystkim!",
      source: "pierwsze słowa z loggii, 8 maja 2025",
    },
    today:
      "Papież nazywa się pontifex — budowniczy mostów. Ty też możesz budować mosty: pogódź się z kimś, zaproś do grupy osobę, która stoi z boku.",
  },
];

const BY_ID = new Map(POPE_STORIES.map((s) => [s.id, s]));

export const popeStory = (cardId: string): PopeStory | undefined => BY_ID.get(cardId);
