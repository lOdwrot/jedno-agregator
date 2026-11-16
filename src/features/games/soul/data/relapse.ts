/** Energy recovery items of the two hardest opponents (Otchłań Upadłych, Tron Bestii):
 *  old temptations brought back from the discard pile, so the strongest demons don't run dry. */
import type { CardDef } from "./types";

export const RELAPSE_CARDS: CardDef[] = [
  {
    id: "odgrzewany",
    kind: "item",
    side: "demons",
    name: "Odgrzewany grzech",
    emoji: "🍲",
    rarity: "uncommon",
    text: "Dołącz 1 Pokusę ze swoich odrzuconych kart do wybranego swojego pomiota.",
    effect: { k: "kindle", n: 1 },
    flavor: "Wczorajszy podobno smakuje jeszcze lepiej. Podobno.",
    lesson: {
      tempts:
        "Grzech, który już raz wyznałeś, wraca w myślach: „przecież to nic takiego, już to znasz”. Stara pokusa udaje bezpieczną, bo jest znajoma.",
      defend:
        "Co oddane Bogu w spowiedzi, jest przebaczone — nie odgrzewaj tego. Unikaj okazji, które prowadziły do upadku, i dziękuj za łaskę nowego początku.",
    },
  },
  {
    id: "nawrot",
    kind: "item",
    side: "demons",
    name: "Nawrót starego nałogu",
    emoji: "🔁",
    rarity: "rare",
    text: "Weź ze swoich odrzuconych kart do ręki 2 Pokusy.",
    effect: { k: "energyFromDiscard", n: 2 },
    flavor:
      "„Pies wraca do tego, co sam zwymiotował” (2 P 2,22). Elegancko to nie brzmi, bo nie jest.",
    lesson: {
      tempts:
        "Po walce przychodzi zmęczenie i szept: „raz nie zaszkodzi, przecież i tak zawsze wracasz”. Nawrót chce, żebyś uwierzył, że zmiana jest niemożliwa.",
      defend:
        "Upadek to nie koniec drogi. Wstań od razu, idź do spowiedzi, poproś kogoś o wsparcie. Nawrócenie to nie jednorazowy zryw, tylko codzienne wracanie do Boga.",
    },
  },
];
