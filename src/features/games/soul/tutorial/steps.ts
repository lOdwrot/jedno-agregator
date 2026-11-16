/**
 * The guided part of the tutorial: one step per mechanic. A step either waits for one exact move
 * of the player (`expect`), waits for the demons' turn to end (`until`), or is a short explanation
 * closed with "Dalej". After the last step the player is on their own (the last two souls).
 */
import type { Action } from "../engine/actions";
import { hpLeft, inPlay, nameOf, type Game } from "../engine/state";

export interface TutorialStep {
  id: string;
  title: string;
  /** Why it works this way. */
  text: string | ((g: Game) => string);
  /** What to do now — shown as the instruction (steps with `expect`). */
  todo?: string;
  /** The one move this step waits for. */
  expect?: (g: Game, a: Action) => boolean;
  /** Waits for the game (the demons' turn) — the step ends once this holds. */
  until?: (g: Game) => boolean;
  /** Label of the "next" button of an explanation step. */
  next?: string;
}

const handId = (g: Game, uid: number) => g.players.me.hand.find((c) => c.uid === uid)?.cardId;
const fieldId = (g: Game, uid: number) => inPlay(g.players.me).find((c) => c.uid === uid)?.cardId;
const myTurn = (g: Game, turnNo: number) =>
  g.phase === "main" && g.turn === "me" && g.turnNo === turnNo;
const foeName = (g: Game) => (g.players.ai.active ? nameOf(g.players.ai.active) : "pomiot");
const activeHp = (g: Game) => (g.players.me.active ? hpLeft(g, g.players.me.active) : 0);

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: "welcome",
    title: "Witaj w samouczku!",
    text: "Grasz gotową talią parafii przeciw Chochlikom z kanapy. Wygrywa ten, kto pierwszy ocali 4 dusze — duszę dostajesz za każdą pokonaną postać rywala (za legendarną 2). Przez pierwsze dwie dusze poprowadzę Cię krok po kroku, o dwie ostatnie zawalczysz sam.",
  },
  {
    id: "table",
    title: "Ręka i stół",
    text: "Na dole jest Twoja ręka. Stuknij kartę, by przeczytać jej opis i zobaczyć możliwe ruchy, albo przeciągnij ją na stół. Rywal siedzi u góry, Ty na dole: środek to aktywna postać (walczy), obok ławka — 3 miejsca w rezerwie. W zwykłym pojedynku możesz najpierw raz przetasować rękę, a rzut monetą decyduje, kto zaczyna. Tu zaczynasz Ty.",
  },
  {
    id: "active",
    title: "Wystaw postać do walki",
    text: "Postać podstawową (bez dopisku „rozwój z: …” na karcie) wystawiasz prosto z ręki. Aktywna postać atakuje i przyjmuje ciosy rywala.",
    todo: "Stuknij Ministranta w ręce i wybierz „Wystaw do walki” (albo przeciągnij go na środek stołu).",
    expect: (g, a) => a.type === "chooseActive" && handId(g, a.uid) === "ministrant",
  },
  {
    id: "turn1",
    title: "Twoja pierwsza tura",
    text: (g) =>
      `Pomioty też się rozstawiły: do walki staje ${foeName(g)}, reszta czeka na ławce. Na początku każdej tury dobierasz 1 kartę — właśnie przyszła Łaska. W pierwszej turze gry nikt nie atakuje: to czas, by się rozstawić.`,
  },
  {
    id: "bench",
    title: "Ławka",
    text: "Postacie na ławce czekają w rezerwie. Gdy aktywna zejdzie z pola, jedna z nich ją zastąpi — a gdy na polu nie zostanie Ci nikt, przegrywasz. Ławka to Twoje ubezpieczenie.",
    todo: "Posadź Oazowicza na ławce: stuknij go i wybierz „Posadź na ławce” (albo przeciągnij go na ławkę).",
    expect: (g, a) => a.type === "playBasic" && handId(g, a.uid) === "oazowicz",
  },
  {
    id: "energy",
    title: "Łaska ✨ — energia ataków",
    text: "Każdy atak kosztuje Łaskę — tyle, ile ikon ✨ stoi przy jego nazwie. Na turę dołączasz tylko jedną kartę Łaski, do aktywnej postaci albo do kogoś na ławce. Dołączona Łaska zostaje na postaci.",
    todo: "Dołącz Łaskę do Ministranta: przeciągnij kartę Łaski na niego albo stuknij ją i wybierz „Dołącz do: Ministrant”.",
    expect: (g, a) =>
      a.type === "attach" && handId(g, a.uid) === "laska" && fieldId(g, a.target) === "ministrant",
  },
  {
    id: "item",
    title: "Przedmioty",
    text: "Przedmiotów możesz zagrać w turze, ile chcesz. Medalik od chrzestnej osłoni Ministranta: do Twojej następnej tury każdy cios będzie o 20 słabszy.",
    todo: "Stuknij Medalik od chrzestnej i wybierz „Zagraj kartę”.",
    expect: (g, a) => a.type === "support" && handId(g, a.uid) === "medalik",
  },
  {
    id: "supporter",
    title: "Pomocnicy",
    text: "Pomocnicy to mocniejsze karty wsparcia — ale zagrasz tylko jednego na turę. Zbiórka ministrantów pozwala dobrać 3 karty.",
    todo: "Zagraj Zbiórkę ministrantów.",
    expect: (g, a) => a.type === "support" && handId(g, a.uid) === "zbiorka",
  },
  {
    id: "end1",
    title: "Koniec tury",
    text: "Archikatedrę Oliwską (miejsce) zachowamy na później. W pierwszej turze gry nie wolno atakować, więc to już wszystko.",
    todo: "Stuknij „Zakończ turę” na dolnym pasku.",
    expect: (_, a) => a.type === "endTurn",
  },
  {
    id: "ai2",
    title: "Ruch pomiotów",
    text: "Teraz rywal: dobiera kartę, dołącza Pokusę 🔥 i atakuje. Obserwuj — Medalik powinien zatrzymać cios.",
    until: (g) => myTurn(g, 3),
  },
  {
    id: "shielded",
    title: "Medalik zadziałał",
    text: (g) =>
      `Cios Pyszałka miał siłę 20, ale Medalik odjął 20 — Ministrant ma wciąż ${activeHp(g)} wytrwałości. Zaczyna się Twoja druga tura. Od drugiej tury każdego gracza można rozwijać postacie i atakować.`,
  },
  {
    id: "evolve",
    title: "Ewolucja",
    text: "Animatorka ma na karcie dopisek „rozwój z: Oazowicz”. Kładziesz ją na Oazowicza, który leży na stole co najmniej od poprzedniej tury: postać dostaje więcej wytrwałości, nowe ataki i moc, a dołączona Łaska (i obrażenia) zostają. Nie rozwiniesz postaci w pierwszej turze gry ani tej wystawionej w tej samej turze. Niektóre linie mają dwa stopnie, np. Ministrant → Lektor → Ceremoniarz.",
    todo: "Przeciągnij Animatorkę na Oazowicza albo stuknij ją i wybierz „Rozwiń: Oazowicz”.",
    expect: (g, a) =>
      a.type === "evolve" && handId(g, a.uid) === "animator" && fieldId(g, a.target) === "oazowicz",
  },
  {
    id: "ability",
    title: "Moce",
    text: "Niektóre postacie mają moc. „Ognisko” Animatorki raz na turę dołącza Łaskę prosto z talii — oprócz zwykłej Łaski z ręki — i działa także z ławki. Moc gotowa do użycia ma przycisk „✦ Moc” na karcie.",
    todo: "Stuknij „✦ Moc” na Animatorce (albo stuknij jej kartę i wybierz „Użyj mocy: Ognisko”).",
    expect: (g, a) => a.type === "ability" && fieldId(g, a.target) === "animator",
  },
  {
    id: "energy2",
    title: "Przygotuj następną postać",
    text: "Ognisko dało Ministrantowi drugą Łaskę — tyle kosztuje „Podanie ampułek”. Łaskę z ręki dołącz teraz Animatorce: przyda się w kolejnej turze.",
    todo: "Dołącz Łaskę do Animatorki na ławce.",
    expect: (g, a) =>
      a.type === "attach" && handId(g, a.uid) === "laska" && fieldId(g, a.target) === "animator",
  },
  {
    id: "weakness",
    title: "Słabość",
    text: "Stuknij kartę Pyszałka u góry (jeśli wskazówka ją zasłania, użyj „Zwiń”): ma słabość: 🤝 Służba ×2. Ministrant należy do Służby 🤝, więc zada mu podwójne obrażenia: 30 × 2 = 60 — dokładnie tyle, ile Pyszałek ma wytrwałości (♥). Przyciski ataków na dole pokazują obrażenia już ze słabością.",
  },
  {
    id: "attack1",
    title: "Atak!",
    text: "Atak kończy turę, więc atakuj na końcu — gdy zagrasz już wszystko, co chcesz.",
    todo: "Stuknij przycisk „Podanie ampułek” na dolnym pasku.",
    expect: (g, a) =>
      a.type === "attack" && a.index === 1 && g.players.me.active?.cardId === "ministrant",
  },
  {
    id: "soul1",
    title: "Pierwsza dusza ocalona! 🕊️",
    text: "Pyszałek schodzi z pola — ocalasz duszę! Za każdą duszę bierzesz kartę z puli dusz do ręki. Rywal musiał wystawić do walki postać z ławki — dlatego zawsze warto mieć kogoś w rezerwie.",
  },
  {
    id: "ai4",
    title: "Ruch pomiotów",
    text: "Rywal sadza nowego pomiota na ławce i atakuje. Tym razem Medalik już nie chroni.",
    until: (g) => myTurn(g, 5),
  },
  {
    id: "hurt",
    title: "Ministrant słabnie",
    text: (g) =>
      `Ministrantowi zostało ${activeHp(g)} wytrwałości. Gdyby zszedł z pola, rywal ocaliłby duszę. Animatorka jest silniejsza — przygotujemy ją i wyślemy do walki zamiast niego.`,
  },
  {
    id: "ability2",
    title: "Moc w nowej turze",
    text: "Moc działa raz na turę — w nowej turze znów możesz jej użyć. Ognisko działa też z ławki: Ministrant ma już dość Łaski, więc tym razem dostanie ją sama Animatorka.",
    todo: "Użyj mocy Animatorki (✦ Moc).",
    expect: (g, a) => a.type === "ability" && fieldId(g, a.target) === "animator",
  },
  {
    id: "retreat",
    title: "Wycofanie",
    text: "Raz na turę możesz zamienić aktywną postać z kimś z ławki. Kosztuje to tyle Łaski, ile pokazuje „wycofanie” na karcie (Ministrant: 1 ✨) — ta Łaska idzie na stos odrzuconych. Uśpiona 💤 albo zatrzymana ✋ postać nie może się wycofać.",
    todo: "Stuknij Animatorkę na ławce i wybierz „Zamień z aktywną”.",
    expect: (g, a) => a.type === "retreat" && fieldId(g, a.target) === "animator",
  },
  {
    id: "energy3",
    title: "Trzecia Łaska",
    text: "„Namiot spotkania” kosztuje 3 ✨. Z Łaską z ręki Animatorka będzie gotowa do ataku.",
    todo: "Dołącz Łaskę z ręki do Animatorki.",
    expect: (g, a) =>
      a.type === "attach" && handId(g, a.uid) === "laska" && fieldId(g, a.target) === "animator",
  },
  {
    id: "place",
    title: "Miejsca",
    text: "Miejsce leży na środku stołu i działa, dopóki ktoś nie zagra innego. Archikatedra Oliwska dodaje Twoim atakom +10. Niektóre miejsca obowiązują obu graczy — opis przeczytasz, stukając miejsce na stole.",
    todo: "Zagraj Archikatedrę Oliwską.",
    expect: (g, a) => a.type === "support" && handId(g, a.uid) === "oliwa",
  },
  {
    id: "attack2",
    title: "Atak z miejscem",
    text: (g) =>
      `„Namiot spotkania” zada 70 + 10 z Archikatedry = 80 — więcej niż wytrzyma ${foeName(g)}.`,
    todo: "Zaatakuj „Namiotem spotkania”.",
    expect: (g, a) =>
      a.type === "attack" && a.index === 1 && g.players.me.active?.cardId === "animator",
  },
  {
    id: "free",
    title: "Druga dusza! Teraz grasz sam 🕊️",
    text: "Masz 2 z 4 dusz — o resztę zawalcz sam, rób, co chcesz. Wskazówki: rozwiń Ministranta w Lektora, a potem w Ceremoniarza. Woda święcona leczy 30, a Koło Żywego Różańca — wszystkich. Stany: 💤 uśpiony i ✋ zatrzymany nie atakują ani się nie wycofują, 🌫️ zwątpienie zabiera 10 co turę — znika po ewolucji albo wycofaniu na ławkę. Gdy Twoja aktywna postać zejdzie z pola, stuknij kogoś na ławce. Przebieg walki: 📜 u góry.",
    next: "Gram sam!",
  },
];
