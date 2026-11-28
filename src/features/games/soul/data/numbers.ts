import { COLLECTIBLE } from "./cards";
import { TALE_CARDS } from "./tales";

/**
 * Album order of the player's cards — the card's in-game number is its place here (1-based).
 * Evolution lines stay together, then supporters, items, places and the saints of the tales.
 * NEVER reorder or remove entries (numbers would change on cards already owned): a new
 * collectible card is APPENDED at the end (`numbers.test.ts` checks every one is listed).
 * Demon cards and energy have no number.
 */
export const ALBUM_ORDER: readonly string[] = [
  "ministrant", // Ministrant
  "lektor", // Lektor
  "ceremoniarz", // Ceremoniarz
  "kleryk", // Kleryk na praktykach
  "wikariusz", // Ksiądz wikariusz
  "proboszcz", // Ksiądz proboszcz
  "scholanka", // Scholanka
  "dyrygentka", // Dyrygentka scholi
  "chor", // Chór katedralny
  "babcia", // Babcia z różańcem
  "oazowicz", // Oazowicz
  "animator", // Animatorka
  "moderator", // Moderator oazy
  "siostra", // Siostra zakonna
  "organista", // Pan organista
  "kancelaria", // Pani z kancelarii
  "wojciech", // Św. Wojciech
  "dorota", // Bł. Dorota z Mątów
  "komorowski", // Bł. ks. Bronisław Komorowski
  "popieluszko", // Bł. ks. Jerzy Popiełuszko
  "kandydat", // Kandydat na papieża
  "piotr", // Św. Piotr
  "leon1", // Św. Leon I Wielki
  "grzegorz1", // Św. Grzegorz I Wielki
  "celestyn5", // Św. Celestyn V
  "pius5", // Św. Pius V
  "innocenty11", // Bł. Innocenty XI
  "pius9", // Bł. Pius IX
  "leon13", // Leon XIII
  "pius10", // Św. Pius X
  "jan23", // Św. Jan XXIII
  "jp2", // Św. Jan Paweł II
  "benedykt16", // Benedykt XVI
  "franciszek", // Franciszek
  "leon14", // Leon XIV
  "wolontariuszka", // Wolontariuszka Caritas
  "kaznodzieja", // Kaznodzieja rekolekcyjny
  "ewangelizator", // Ewangelizator uliczny
  "pielgrzym", // Pielgrzym na Jasną Górę
  "jerzy", // Św. Jerzy
  "kolbe", // Św. Maksymilian Kolbe
  "postulant", // Postulant
  "cysters", // Brat cysters
  "opat", // Opat oliwski
  "zuch", // Zuch
  "harcerz", // Harcerz
  "harcmistrz", // Harcmistrz
  "koscielny", // Pan kościelny
  "katechetka", // Pani katechetka
  "kolo", // Koło Żywego Różańca
  "rekolekcje", // Zaproszenie na rekolekcje
  "spowiedz", // Spowiedź
  "pielgrzymka", // Pielgrzymka na Jasną Górę
  "zbiorka", // Zbiórka ministrantów
  "rada", // Rada parafialna
  "profesor", // Ksiądz profesor
  "rzecznik", // Ksiądz rzecznik
  "marnotrawny", // Powrót marnotrawnego syna
  "sobor", // Przyspieszony Sobór Watykański
  "woda", // Woda święcona
  "rozaniec", // Różaniec
  "medalik", // Medalik od chrzestnej
  "pismo", // Pismo Święte
  "ogloszenia", // Ogłoszenia parafialne
  "ksiega", // Księga parafialna
  "kadzidlo", // Kadzidło
  "gromnica", // Gromnica
  "zapisy", // Zapisy na oazę
  "paschal", // Paschał
  "damaszek", // Droga do Damaszku
  "oliwa", // Archikatedra Oliwska
  "mariacka", // Bazylika Mariacka
  "kalwaria", // Kalwaria Wejherowska
  "swarzewo", // Sanktuarium w Swarzewie
  "brygida", // Bazylika św. Brygidy
  "mikolaj", // Bazylika św. Mikołaja
  "adoracja", // Kaplica Wieczystej Adoracji
  "kartuzy", // Klasztor w Kartuzach
  "matemblewo", // Sanktuarium w Matemblewie
  "pelplin", // Katedra w Pelplinie
  "paradyz", // Seminarium w Paradyżu
  "jur", // Archikatedralny Sobór św. Jura we Lwowie
  "bernadetta", // Św. Bernadetta Soubirous
  "biedaczyna", // Św. Franciszek z Asyżu
  "izydor", // Św. Izydor Oracz
];

const NUMBER = new Map(ALBUM_ORDER.map((id, i) => [id, i + 1]));

/** Total cards in the album. */
export const ALBUM_SIZE = ALBUM_ORDER.length;

/** The card's number in the album (1-based), or null for demons and energy. */
export const cardNumber = (cardId: string): number | null => NUMBER.get(cardId) ?? null;

/** "007" — a number padded to three digits, like on the printed cards. */
export const formatNumber = (n: number): string => String(n).padStart(3, "0");

/** "007/85" for album cards, null otherwise. */
export function cardNumberLabel(cardId: string): string | null {
  const n = cardNumber(cardId);
  return n === null ? null : `${formatNumber(n)}/${ALBUM_SIZE}`;
}

/** Every card id the album should list (collectible parish cards + the saints of the tales). */
export const albumCardIds = (): string[] => [...COLLECTIBLE, ...TALE_CARDS].map((c) => c.id);
