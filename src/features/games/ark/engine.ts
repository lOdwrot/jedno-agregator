/** Pure logic of "Arka Noego" — a pairs/memory game (Gen 7,9: "weszły do Noego do arki po dwoje"). */
import { createRng } from "../useGameLoop";

export const ANIMALS = [
  { id: "lion", emoji: "🦁", name: "Lwy", joke: "Lwy obiecały, że na Arce są wegetarianami." },
  {
    id: "elephant",
    emoji: "🐘",
    name: "Słonie",
    joke: "Słonie na pokładzie! Noe przesuwa resztę na drugą burtę.",
  },
  {
    id: "giraffe",
    emoji: "🦒",
    name: "Żyrafy",
    joke: "Żyrafy dostały miejsca z widokiem. Dosłownie jedyne.",
  },
  {
    id: "turtle",
    emoji: "🐢",
    name: "Żółwie",
    joke: "Żółwie wyruszyły dwa tygodnie temu. Zdążyły!",
  },
  {
    id: "penguin",
    emoji: "🐧",
    name: "Pingwiny",
    joke: "Pingwiny pytają, gdzie jest lód. Noe udaje, że nie słyszy.",
  },
  {
    id: "rabbit",
    emoji: "🐇",
    name: "Króliki",
    joke: "Króliki skaczą po pokładzie. Noe zamawia drugą tonę marchewki.",
  },
  {
    id: "kangaroo",
    emoji: "🦘",
    name: "Kangury",
    joke: "Kangury przyniosły bagaż we własnych kieszeniach.",
  },
  {
    id: "sloth",
    emoji: "🦥",
    name: "Leniwce",
    joke: "Leniwce dotarły. W końcu. Prawie zamknęli drzwi.",
  },
] as const;

export type AnimalId = (typeof ANIMALS)[number]["id"];
export const animal = (id: AnimalId) => ANIMALS.find((a) => a.id === id)!;

export interface ArkState {
  deck: AnimalId[];
  /** Indexes currently face up and not yet matched (0–2). */
  open: number[];
  matched: AnimalId[];
  moves: number;
  lastMatch: AnimalId | null;
  /** Two different cards are face up and wait for `hideMismatch`. */
  mismatch: boolean;
  won: boolean;
}

export function createArk(seed = Date.now() % 100000): ArkState {
  const rng = createRng(seed);
  const deck = ANIMALS.flatMap((a) => [a.id, a.id]);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return { deck, open: [], matched: [], moves: 0, lastMatch: null, mismatch: false, won: false };
}

export const isFaceUp = (s: ArkState, i: number) =>
  s.open.includes(i) || s.matched.includes(s.deck[i]!);

export function flip(s: ArkState, i: number): ArkState {
  if (s.won || s.mismatch || i < 0 || i >= s.deck.length || isFaceUp(s, i)) return s;
  const open = [...s.open, i];
  if (open.length < 2) return { ...s, open };
  const [a, b] = open as [number, number];
  const moves = s.moves + 1;
  if (s.deck[a] === s.deck[b]) {
    const matched = [...s.matched, s.deck[a]!];
    return {
      ...s,
      open: [],
      matched,
      moves,
      lastMatch: s.deck[a]!,
      won: matched.length === ANIMALS.length,
    };
  }
  return { ...s, open, moves, mismatch: true };
}

export const hideMismatch = (s: ArkState): ArkState =>
  s.mismatch ? { ...s, open: [], mismatch: false } : s;

export function rank(moves: number): string {
  if (moves <= 12) return "Kapitan Arki! Noe zatrudnia Cię na stałe.";
  if (moves <= 16) return "Pierwszy oficer Noego. Pamięć jak u słonia!";
  if (moves <= 22) return "Majtek pokładowy — solidna robota.";
  return "Tempo żółwia, ale liczy się, że wszyscy są na pokładzie!";
}
