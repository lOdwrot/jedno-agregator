/** What the laboratory is "doing" while the deck is computed — one line every few seconds. */
import type { ForgePhase } from "./forge";

export const PHASE_LABEL: Record<ForgePhase, string> = {
  scout: "Rekonesans: stare talie Otchłani grają z Twoją",
  climb: "Szlifowanie: karta po karcie, symulacja po symulacji",
  verify: "Ostatnie testy na świeżo potasowanych kartach",
  done: "Talia gotowa",
};

export const QUIPS: Record<Exclude<ForgePhase, "done">, readonly string[]> = {
  scout: [
    "Przeglądam Twoją talię… o, znowu ten Kleryk.",
    "Wyciągam z szafy stare talie Rady Otchłani.",
    "Chochliki tasują karty ogonami. Wolno, ale dokładnie.",
    "Pytam Tron Bestii, czy pożyczy parę kart. Nie pożyczył, ale skopiowałem.",
    "Rozgrzewam piec laboratoryjny do 666°C.",
    "Liczę Twoje Łaski. Dwa razy, bo za pierwszym razem wyszło za dużo.",
  ],
  climb: [
    "Wymieniam Pokusę na Pokusę. Bardzo naukowo.",
    "Sprawdzam, czy Legion zmieści się w talii. Jest ich wielu.",
    "Liczę, jak często dobierzesz Kandydata na papieża. Wynik: za rzadko.",
    "Belzebub domaga się podwyżki za udział w symulacjach.",
    "Kalibruję poziom zniechęcenia…",
    "Algorytm podpowiada: „Klientom, którzy kupili Proboszcza, polecamy…”",
    "Uczę Duszka Marazmu wstawać przed południem. Bez skutku.",
    "Lewiatan oblał test kompatybilności. Szukam zastępstwa.",
    "Doktorant z Otchłani pisze z tego pracę magisterską.",
    "Przesiewam talię przez sito. Zostają same najmocniejsze.",
    "Symulowany Ty właśnie przegrał. Nie bierz tego do siebie.",
    "Mutacja numer kolejny. Nikomu nie mów, to tajemnica laboratorium.",
    "Fałszywy Prorok przepowiada wynik. Zgadł… chyba.",
    "Wyrzucam karty, które przegrywają. Bez sentymentów.",
    "Rysuję wykres skuteczności. Rośnie. Jak rachunek za prąd w Otchłani.",
  ],
  verify: [
    "Sprawdzam, czy to nie był fart. Diabeł tkwi w szczegółach.",
    "Tasuję od nowa i gram jeszcze raz. Tak dla pewności.",
    "Podpisuję cyrograf z generatorem liczb losowych.",
    "Ostatnie poprawki: pudruję rogi Lucyferowi.",
  ],
};

/** The `i`-th line of a phase (cycles). */
export const quip = (phase: ForgePhase, i: number) => {
  if (phase === "done") return "Talia jest gotowa. Laboratorium życzy… no, nie powodzenia.";
  const list = QUIPS[phase];
  return list[i % list.length]!;
};
