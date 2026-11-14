import { Link } from "@/ui";
import { ART } from "../data/art";
const RULES: [string, string][] = [
  [
    "Cel",
    "Ocal 4 dusze 🕊️ — za każdego pokonanego pomiota dostajesz 1 duszę (za legendarne 2) i kartę do ręki. Wygrywasz też, gdy pomiotom nie zostanie nikt na polu.",
  ],
  [
    "Start",
    "Talia ma 24 karty. Dobierasz 5, a 4 karty odkładasz jako dusze. Wybierasz postać podstawową do walki. Monetą losuje się, kto zaczyna — w pierwszej turze gry nie można atakować.",
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
    "Stany",
    "💤 Uśpiony — nie atakuje, budzi się po rzucie monetą. ✋ Zatrzymany — traci najbliższą turę ataku. 🌫️ Zwątpienie — 10 obrażeń po każdej turze. Wycofanie i rozwój zdejmują stany.",
  ],
  [
    "Kolekcja",
    "Za każdą walkę dostajesz talenty (więcej za wygraną i za ocalone dusze) i prawo do 1 boostera. Rzadkość: ● pospolita, ◆ niepospolita, ★ rzadka, 👑 legendarna. Ta sama karta może trafić się złocona ✦ lub witrażowa ❖ — jest wtedy silniejsza.",
  ],
  [
    "Talia",
    "W zakładce Talia składasz 24 karty: maksymalnie 2 egzemplarze tej samej karty, Łaski bez limitu. Nadmiarowe karty możesz oddać na tacę za talenty.",
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
