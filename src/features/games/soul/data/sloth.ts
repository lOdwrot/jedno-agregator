import type { CardDef } from "./types";

/**
 * The court of sloth — demons of the "lenistwo" domain played only by the harder opponents
 * (Smocze Zastępy, Otchłań Upadłych, Tron Bestii). Evolution lines: Marazm → Obojętność → Letarg, Bies Wygody → Belfegor.
 */
export const SLOTH_CARDS: CardDef[] = [
  {
    id: "marazm",
    kind: "character",
    side: "demons",
    name: "Duszek Marazmu",
    emoji: "🛌",
    rarity: "uncommon",
    hp: 70,
    element: "lenistwo",
    weakness: "sluzba",
    retreat: 2,
    souls: 1,
    ability: {
      name: "Ciepły kocyk",
      text: "Ta postać otrzymuje o 10 mniej obrażeń.",
      effect: { k: "armor", n: 10 },
    },
    attacks: [
      {
        name: "Nic mi się nie chce",
        cost: 2,
        damage: 30,
        text: "Rzuć monetą. Orzeł: obrońca zostaje zatrzymany.",
        effects: [{ k: "status", s: "paralyzed", coin: true }],
      },
    ],
    flavor: "Leży pod kocem od piątku. Twierdzi, że „ładuje baterie”. Baterie mają się świetnie.",
    lesson: {
      tempts:
        "Zamienia odpoczynek w ucieczkę: dzień za dniem przelatuje „na luzie”, a dobro, które można było zrobić, po prostu się nie dzieje.",
      defend:
        "Odpoczynek jest święty, ale ma cel. Wstań, przewietrz pokój i zrób jedną konkretną rzecz dla kogoś innego.",
    },
  },
  {
    id: "obojetnosc",
    kind: "character",
    side: "demons",
    name: "Bies Obojętności",
    emoji: "🫥",
    rarity: "rare",
    hp: 120,
    element: "lenistwo",
    weakness: "sluzba",
    retreat: 2,
    evolvesFrom: "marazm",
    souls: 1,
    attacks: [
      {
        name: "Mnie to nie dotyczy",
        cost: 2,
        damage: 40,
        text: "Odrzuć 1 Łaskę z postaci obrońcy.",
        effects: [{ k: "discardEnergy" }],
      },
      { name: "Wzruszenie ramion", cost: 3, damage: 90 },
    ],
    flavor: "Widział, że ktoś potrzebuje pomocy. Uznał, że na pewno pomoże ktoś inny.",
    lesson: {
      tempts:
        "Obojętność udaje spokój: „nie wtrącam się”, „to nie moja sprawa”. Tak kapłan i lewita minęli rannego na drodze do Jerycha.",
      defend:
        "Bądź jak Samarytanin (Łk 10,33): zatrzymaj się, zobacz człowieka i zrób pierwszy krok, nawet mały.",
    },
  },
  {
    id: "letarg",
    kind: "character",
    side: "demons",
    name: "Letarg, Strażnik Snu",
    emoji: "🌙",
    rarity: "legendary",
    hp: 180,
    element: "lenistwo",
    weakness: "sluzba",
    retreat: 3,
    evolvesFrom: "obojetnosc",
    souls: 2,
    ability: {
      name: "Sen regeneracyjny",
      text: "Na koniec Twojej tury ta postać odzyskuje 20 wytrwałości.",
      effect: { k: "endHeal", n: 20 },
    },
    attacks: [
      {
        name: "Kołysanka",
        cost: 2,
        damage: 60,
        text: "Obrońca zasypia.",
        effects: [{ k: "status", s: "asleep" }],
      },
      {
        name: "Sen zimowy duszy",
        cost: 4,
        damage: 140,
        text: "20 obrażeń każdej postaci na ławce rywala.",
        effects: [{ k: "bench", n: 20 }],
      },
    ],
    flavor: "„Czemu śpicie? Wstańcie i módlcie się” (Łk 22,46). On wolałby, żebyście nie wstawali.",
    lesson: {
      tempts:
        "Duchowy sen: wiara niby jest, ale nic nie budzi — ani Słowo, ani cudza bieda. Uczniowie zasnęli w Ogrójcu, gdy Jezus najbardziej ich potrzebował.",
      defend:
        "„Czuwajcie i módlcie się” (Mt 26,41). Stała pora modlitwy i wspólnota, która Cię budzi, są lepsze niż najmocniejsza kawa.",
    },
  },
  {
    id: "letni",
    kind: "character",
    side: "demons",
    name: "Duch Letniości",
    subtitle: "Ap 3,16",
    emoji: "🌡️",
    rarity: "rare",
    hp: 110,
    element: "lenistwo",
    weakness: "modlitwa",
    retreat: 1,
    souls: 1,
    ability: {
      name: "Ani zimny, ani gorący",
      text: "Ta postać otrzymuje o 20 mniej obrażeń.",
      effect: { k: "armor", n: 20 },
    },
    attacks: [
      {
        name: "Byle bez przesady",
        cost: 3,
        damage: 70,
        text: "Obrońca popada w zwątpienie.",
        effects: [{ k: "status", s: "poisoned" }],
      },
    ],
    flavor: "Chodzi do kościoła, ale bez entuzjazmu. Pomaga, ale bez przesady. Kocha — w miarę.",
    lesson: {
      tempts:
        "Letniość to wiara „na pół gwizdka”: wszystko jest w porządku, byle nic nie kosztowało. Nie grzeszy wielko, ale też niczego nie daje.",
      defend:
        "„Obyś był zimny albo gorący” (Ap 3,15). Poproś Ducha Świętego o ogień i daj Bogu coś, co naprawdę kosztuje — czas, wyrzeczenie, odwagę.",
    },
  },
  {
    id: "wygoda",
    kind: "character",
    side: "demons",
    name: "Bies Wygody",
    emoji: "🛋️",
    rarity: "rare",
    hp: 80,
    element: "lenistwo",
    weakness: "sluzba",
    retreat: 2,
    souls: 1,
    attacks: [
      { name: "Pilot w dłoni", cost: 1, damage: 20 },
      {
        name: "Jeszcze pięć minut",
        cost: 2,
        damage: 40,
        text: "Ulecz 10 tej postaci.",
        effects: [{ k: "heal", target: "self", n: 10 }],
      },
    ],
    flavor: "Ma pilota do telewizora, do bramy, do klimatyzacji. Szuka jeszcze pilota do sumienia.",
    lesson: {
      tempts:
        "Mała wygoda staje się nawykiem: zamiast przejść się do kogoś — wyślę emotkę, zamiast pomóc — „ktoś inny zrobi”. Z takich drobiazgów rośnie książę lenistwa.",
      defend:
        "Raz dziennie wybierz coś trudniejszego, choć mogłoby być łatwiej: schody zamiast windy, telefon zamiast SMS-a, pomoc zamiast wymówki.",
    },
  },
  {
    id: "belfegor",
    kind: "character",
    side: "demons",
    name: "Belfegor, Książę Wygody",
    emoji: "🦥",
    rarity: "legendary",
    hp: 180,
    element: "lenistwo",
    weakness: "sluzba",
    retreat: 3,
    evolvesFrom: "wygoda",
    souls: 2,
    ability: {
      name: "Wynalazki na skróty",
      text: "Raz na turę: dobieraj karty, aż będziesz mieć 5 kart w ręce.",
      effect: { k: "drawUntil", n: 5 },
    },
    attacks: [
      {
        name: "Złoty leżak",
        cost: 2,
        damage: 60,
        text: "Ulecz 30 tej postaci.",
        effects: [{ k: "heal", target: "self", n: 30 }],
      },
      {
        name: "Świat bez wysiłku",
        cost: 4,
        damage: 130,
        text: "Obrońca zasypia.",
        effects: [{ k: "status", s: "asleep" }],
      },
    ],
    flavor:
      "W dawnych bestiariuszach — książę lenistwa. Obiecuje wynalazek, dzięki któremu nic już nie trzeba będzie robić. Nawet kochać.",
    lesson: {
      tempts:
        "Kult wygody: wszystko ma być szybkie, łatwe i bez wysiłku — także wiara i relacje. Co wymaga trudu, zaczyna wydawać się niepotrzebne.",
      defend:
        "Miłość zawsze kosztuje. Wybieraj czasem to, co trudniejsze: wcześniejsze wstanie, post, odwiedziny u kogoś samotnego.",
    },
  },
];
