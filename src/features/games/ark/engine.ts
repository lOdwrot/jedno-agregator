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
  {
    id: "monkey",
    emoji: "🐒",
    name: "Małpy",
    joke: "Małpy od razu wspięły się na maszt. Arka nie ma masztu.",
  },
  {
    id: "zebra",
    emoji: "🦓",
    name: "Zebry",
    joke: "Zebry kłócą się, czy są białe w czarne paski, czy odwrotnie.",
  },
  {
    id: "croc",
    emoji: "🐊",
    name: "Krokodyle",
    joke: "Krokodyle uśmiechają się do wszystkich. Wszyscy trzymają dystans.",
  },
  {
    id: "owl",
    emoji: "🦉",
    name: "Sowy",
    joke: "Sowy zgłosiły się na nocną wachtę. Huu się nie zgłosi?",
  },
  { id: "cow", emoji: "🐄", name: "Krowy", joke: "Krowy obiecały mleko do porannej kawy Noego." },
  {
    id: "flamingo",
    emoji: "🦩",
    name: "Flamingi",
    joke: "Flamingi stoją na jednej nodze — oszczędzają miejsce na pokładzie.",
  },
  {
    id: "snail",
    emoji: "🐌",
    name: "Ślimaki",
    joke: "Ślimaki wyruszyły tydzień przed żółwiami. I tak przegrały wyścig.",
  },
  {
    id: "hedgehog",
    emoji: "🦔",
    name: "Jeże",
    joke: "Jeże dostały kajutę bez sąsiadów. Na wszelki wypadek.",
  },
  {
    id: "camel",
    emoji: "🐫",
    name: "Wielbłądy",
    joke: "Wielbłądy zabrały zapas wody na 40 dni. Tak na wszelki wypadek.",
  },
  {
    id: "chicken",
    emoji: "🐓",
    name: "Kury",
    joke: "Kury będą budzić całą Arkę o świcie. Noe już żałuje.",
  },
] as const;

export type Level = "latwy" | "sredni" | "trudny";
export const LEVELS: Record<Level, { label: string; pairs: number; cols: 4 | 6 }> = {
  latwy: { label: "Łatwy", pairs: 8, cols: 4 },
  sredni: { label: "Średni", pairs: 12, cols: 6 },
  trudny: { label: "Trudny", pairs: 18, cols: 6 },
};
export const isLevel = (v: string | null): v is Level => !!v && v in LEVELS;

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
  /** Number of pairs in this deck (depends on the level). */
  pairs: number;
}

export function createArk(level: Level = "latwy", seed = Date.now() % 100000): ArkState {
  const rng = createRng(seed);
  const pairs = LEVELS[level].pairs;
  const deck: AnimalId[] = ANIMALS.slice(0, pairs).flatMap((a) => [a.id, a.id]);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return {
    deck,
    open: [],
    matched: [],
    moves: 0,
    lastMatch: null,
    mismatch: false,
    won: false,
    pairs,
  };
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
      won: matched.length === s.pairs,
    };
  }
  return { ...s, open, moves, mismatch: true };
}

export const hideMismatch = (s: ArkState): ArkState =>
  s.mismatch ? { ...s, open: [], mismatch: false } : s;

/** Rank relative to the number of pairs (8 pairs: ≤12 / ≤16 / ≤22 moves). */
export function rank(moves: number, pairs = 8): string {
  const r = moves / pairs;
  if (r <= 1.5) return "Kapitan Arki! Noe zatrudnia Cię na stałe.";
  if (r <= 2) return "Pierwszy oficer Noego. Pamięć jak u słonia!";
  if (r <= 2.75) return "Majtek pokładowy — solidna robota.";
  return "Tempo żółwia, ale liczy się, że wszyscy są na pokładzie!";
}
