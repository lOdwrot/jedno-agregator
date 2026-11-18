/** "How it works" box of the experimental opponent, shown under its letter. */
export function IdealInfo() {
  return (
    <section
      aria-labelledby="ideal-info"
      className="mt-4 rounded-card border-2 border-dashed border-navy/30 bg-surface p-4 text-ink"
    >
      <h4 id="ideal-info" className="font-display text-lg font-extrabold text-navy">
        🧪 Tryb eksperymentalny — jak to działa?
      </h4>
      <p className="mt-1 text-sm">
        Idealny Oponent nie ma własnej talii. Za każdym razem składa nową — z wszystkich kart
        demonów, z naciskiem na najmocniejsze — tak, żeby jak najlepiej kontrowała{" "}
        <strong>Twoją aktualną talię</strong>. Wszystko liczy się w Twojej przeglądarce:
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
        <li>
          <strong>Rekonesans</strong> — talie najtrudniejszych przeciwników i kilka losowych,
          mocnych zestawów rozgrywają próbne pojedynki z Twoją talią.
        </li>
        <li>
          <strong>Szlifowanie</strong> — najlepsza talia jest zmieniana karta po karcie; zmiana
          zostaje tylko wtedy, gdy w symulacjach wygrywa co najmniej tak samo często.
        </li>
        <li>
          <strong>Sprawdzian</strong> — na koniec świeża seria pojedynków potwierdza, że to nie był
          przypadek.
        </li>
      </ol>
      <p className="mt-2 text-sm">
        Składanie trwa zwykle kilka–kilkanaście sekund (setki symulacji). Zasady są te same co
        Twoje: 50 kart, najwyżej 3 egzemplarze karty, zwykłe druki, jedna karta dobierana na turę —{" "}
        <strong>żadnych forów</strong>. Bez wpisowego; za zwycięstwo 500 talentów i booster losowej
        edycji. To wersja eksperymentalna — wyniki i balans mogą się jeszcze zmieniać.
      </p>
    </section>
  );
}
