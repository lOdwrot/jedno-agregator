import { Link } from "@/ui";
import { ART } from "../data/art";
const RULES: [string, string][] = [
  [
    "Cel",
    "Ocal 4 dusze 🕊️ — za każdego pokonanego pomiota dostajesz 1 duszę (za legendarne 2) i kartę do ręki. Wygrywasz też, gdy pomiotom nie zostanie nikt na polu albo gdy na początku swojej tury nie będą mogły dobrać karty.",
  ],
  [
    "Start",
    "Talia ma 50 kart. Dobierasz 7, a 4 karty odkładasz jako dusze. Wybierasz postać podstawową do walki. Monetą losuje się, kto zaczyna — w pierwszej turze gry nie można atakować.",
  ],
  [
    "Twoja tura",
    "Dobierz kartę. Potem w dowolnej kolejności: posadź postacie na ławce (3 miejsca), rozwijaj je (np. Ministrant → Lektor → Ceremoniarz), dołącz 1 Łaskę ✨, zagraj dowolnie przedmiotów, 1 pomocnika i miejsce, raz wycofaj aktywną postać. Atak kończy turę.",
  ],
  [
    "Atak",
    "Atak kosztuje tyle Łask, ile ✨ przy nazwie — Łaski zostają przy postaci. Słabość podwaja obrażenia: np. Pycha 👑 bije mocno w lektorów, a Służba 🤝 w pomioty lenistwa.",
  ],
  [
    "Zapał",
    "Niektóre ataki pozwalają odrzucić Łaski z ręki — każda dodaje obrażenia (np. Kaznodzieja rekolekcyjny: +30 za Łaskę). Przy takim ataku pojawią się dodatkowe przyciski +🔥1, +🔥2… Inne ataki są potężne, ale po nich postać traci dołączone Łaski (np. Pielgrzym na Jasną Górę, św. Maksymilian Kolbe).",
  ],
  [
    "Moce",
    "Niektóre postacie mają moc. Moce stałe działają cały czas (np. mniej obrażeń). Moce aktywne użyjesz raz na turę: stuknij przycisk „✦ Moc” na postaci na stole (albo stuknij postać i wybierz „Użyj mocy”) — np. Pani z kancelarii dobiera karty, Siostra zakonna leczy, Animatorka dokłada Łaskę. Moc można użyć także z ławki. Uwaga na papieży-strażników: dopóki Św. Celestyn V jest aktywną postacią, nikt nie zagrywa przedmiotów, a przy Bł. Piusie IX — pomocników.",
  ],
  [
    "Dobieranie kart",
    "Talia jest duża, więc warto ją szybko przeglądać: Zbiórka ministrantów i Rada parafialna (pomocnicy) dobierają karty, Różaniec pozwala zajrzeć na wierzch talii — wziąć tę kartę albo odrzucić ją i dobrać następną, Ksiądz profesor wymienia całą rękę na 7 nowych, a Ksiądz rzecznik zmusza obu graczy do oddania ręki — dobiera ten, komu zostało więcej dusz do zdobycia. Ogłoszenia parafialne: odrzuć 2 karty z ręki i weź z talii dowolnie wybraną postać.",
  ],
  [
    "Pusta talia",
    "Odrzucone karty same nie wracają do talii — odzyskasz je tylko kartami: Księga parafialna bierze z odrzuconych postać do ręki, a Powrót marnotrawnego syna wtasowuje 5 kart z powrotem do talii (pomioty mają swoje odpowiedniki: Rozpamiętywanie i Stare nawyki). Jeśli na początku tury musisz dobrać kartę, a talia jest pusta — przegrywasz. Uważaj z dobieraniem pod koniec długiej walki (licznik kart pokazuje talia na planszy).",
  ],
  [
    "Stany",
    "💤 Uśpiony — nie atakuje, budzi się po rzucie monetą. ✋ Zatrzymany — traci najbliższą turę ataku. 🌫️ Zwątpienie — 10 obrażeń po każdej turze. Wycofanie i rozwój zdejmują stany.",
  ],
  [
    "Sztuczki pomiotów",
    "Uważaj: Toksyczny szef wyciąga postać z Twojej ławki na pierwszą linię, Remont u sąsiada po rzucie monetą odbiera Łaskę dowolnej Twojej postaci, Ciche dni potrafią ją zatrzymać, a Kompleksy zabierają Ci rękę. Trzymaj na ławce postać gotową do walki i nie wkładaj wszystkich Łask w jedną kartę.",
  ],
  [
    "Poziomy trudności",
    "Chochliki z kanapy są łatwe, Biesy plotkary średnie (ich pierwszy pomiot zaczyna z 1 Pokusą), Legion Pychy trudny, Smocze Zastępy bardzo trudne (ich pierwszy pomiot zaczyna z 2 Pokusami), a Otchłań Upadłych ekstremalna: Lucyfer, Abaddon i Acedia, 2 Pokusy na pierwszym pomiocie od startu i dodatkowa karta co turę. Za to ich talia kończy się szybciej… Ponad nimi jest już tylko Tron Bestii — poziom „niepokonany”: Babilon Wielki (+20 do ataków, −20 otrzymywanych obrażeń) i pomocnik Złoty kielich (3 Pokusy naraz). Bestia z morza i Legion (+20 do ataków pomiotów) — najsilniejsze karty w grze — rosną w trzech etapach: Fala z otchłani → Mały róg → Bestia oraz Tylko ten jeden raz → Kajdany nałogu → Legion. Fałszywy Prorok, Jeździec na rudym koniu (co turę dokłada Pokusę z talii), Duch tego świata (dopóki jest w grze — nawet na ławce — pomioty nie mają słabości) i Belfegor nie wchodzą do gry od razu: to ewolucje Wilka w owczej skórze, Iskry niezgody, Owczego pędu i Biesa Wygody — pokonaj formę bazową, zanim urośnie; wszystkie karty witrażowe (+20 wytrwałości, +10 obrażeń), 3 Pokusy na pierwszym pomiocie, dodatkowa karta co turę i piekielna plansza. Najpierw pokonaj Ducha tego świata — wtedy słabości wracają. Prawie nikt go nie pokonał.",
  ],
  [
    "Kolekcja",
    "Za każdą walkę dostajesz talenty (więcej za wygraną i za ocalone dusze) i prawo do 1 boostera. Rzadkość: ● pospolita, ◆ niepospolita, ★ rzadka, 👑 legendarna. Ta sama karta może trafić się złocona ✦ lub witrażowa ❖ — jest wtedy silniejsza. Legendarny Skarbiec Katedry (1000 talentów) zawsze ma kartę rzadką i legendarną. Wyzwanie najtrudniejszych przeciwników kosztuje wpisowe (bardzo trudny 30, ekstremalny 50, niepokonany 100 talentów), ale zwycięstwo nad nimi daje dodatkowo darmowy booster, otwierany od razu po walce — jego edycję losuje tabela szans danego przeciwnika. Z każdym z nich możesz też za darmo potrenować („Trenuj”) — bez wpisowego, ale i bez talentów, boostera i wpisu do statystyk.",
  ],
  [
    "Talia",
    "W zakładce Talia składasz 50 kart: maksymalnie 3 egzemplarze tej samej karty, Łaski bez limitu. Nadmiarowe karty możesz oddać na tacę za talenty.",
  ],
];

/** Short rules (inspired by trading card games) and credits of the illustrations. */
export function Rules() {
  const credits = Object.entries(ART);
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <dl className="grid gap-3">
        {RULES.map(([t, d]) => (
          <div key={t} className="rounded-card bg-surface p-4 shadow-card">
            <dt className="font-display font-extrabold text-navy">{t}</dt>
            <dd className="mt-1 text-ink">{d}</dd>
          </div>
        ))}
      </dl>
      {credits.length > 0 && (
        <section aria-labelledby="soul-credits" className="rounded-card bg-surface p-4 shadow-card">
          <h3 id="soul-credits" className="font-display font-extrabold text-navy">
            Źródła ilustracji
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            Obrazy i zdjęcia pochodzą z Wikimedia Commons (domena publiczna lub wolne licencje).
            Zostały przycięte i zmniejszone.
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {credits.map(([key, c]) => (
              <li key={key}>
                <Link to={c.url}>{c.title}</Link> — {c.author}, {c.license}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
