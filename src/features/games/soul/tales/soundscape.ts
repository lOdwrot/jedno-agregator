/**
 * Soundscape of every tale page: continuous beds (wind, water, crowd…) plus one-shot cues repeated
 * at random intervals (sheep, birds, bells…). Pure data — synthesized by `audio/taleAmbience.ts`.
 */
import type { SceneId } from "./stories";

export type Bed = "breeze" | "wind" | "gale" | "stream" | "crowd" | "frost";
export type Cue =
  | "bleat"
  | "birds"
  | "howl"
  | "moo"
  | "donkey"
  | "bell"
  | "chime"
  | "drip"
  | "gush"
  | "stone"
  | "crackle"
  | "crunch"
  | "rooster"
  | "harness"
  | "lute"
  | "crickets";

export interface CuePlan {
  cue: Cue;
  /** Seconds between repeats: random in [min, max]. */
  every: [number, number];
  /** Seconds before the first one (default: a random point of `every`). */
  first?: number;
}

export interface Soundscape {
  beds: { bed: Bed; gain: number }[];
  cues: CuePlan[];
}

const s = (beds: Soundscape["beds"], cues: CuePlan[]): Soundscape => ({ beds, cues });

export const SOUNDSCAPES: Record<SceneId, Soundscape> = {
  meadow: s(
    [{ bed: "breeze", gain: 0.5 }],
    [
      { cue: "bleat", every: [4, 8], first: 1 },
      { cue: "birds", every: [5, 10] },
    ],
  ),
  wind: s(
    [
      { bed: "gale", gain: 0.9 },
      { bed: "stream", gain: 0.25 },
    ],
    [],
  ),
  grotto: s(
    [{ bed: "stream", gain: 0.2 }],
    [
      { cue: "drip", every: [1.5, 4] },
      { cue: "chime", every: [6, 11], first: 1.5 },
    ],
  ),
  spring: s(
    [{ bed: "stream", gain: 0.6 }],
    [
      { cue: "gush", every: [14, 22], first: 0.6 },
      { cue: "drip", every: [2, 5] },
    ],
  ),
  candles: s(
    [{ bed: "breeze", gain: 0.25 }],
    [
      { cue: "crackle", every: [0.8, 2.5] },
      { cue: "bell", every: [10, 16], first: 2 },
    ],
  ),
  pilgrims: s(
    [{ bed: "crowd", gain: 0.5 }],
    [
      { cue: "bell", every: [7, 12], first: 1 },
      { cue: "crackle", every: [1.5, 3.5] },
    ],
  ),
  town: s(
    [{ bed: "crowd", gain: 0.55 }],
    [
      { cue: "lute", every: [5, 9], first: 1 },
      { cue: "bell", every: [12, 18] },
      { cue: "birds", every: [8, 14] },
    ],
  ),
  stones: s(
    [{ bed: "breeze", gain: 0.4 }],
    [
      { cue: "stone", every: [2, 4], first: 0.8 },
      { cue: "birds", every: [7, 12] },
    ],
  ),
  birds: s(
    [{ bed: "breeze", gain: 0.35 }],
    [
      { cue: "birds", every: [1, 2.5], first: 0.3 },
      { cue: "chime", every: [9, 14] },
    ],
  ),
  wolf: s(
    [{ bed: "wind", gain: 0.6 }],
    [
      { cue: "howl", every: [8, 13], first: 1.2 },
      { cue: "crunch", every: [5, 9] },
    ],
  ),
  crib: s(
    [{ bed: "frost", gain: 0.25 }],
    [
      { cue: "moo", every: [8, 13], first: 1.5 },
      { cue: "donkey", every: [11, 17], first: 5 },
      { cue: "bleat", every: [9, 15] },
      { cue: "chime", every: [7, 11] },
    ],
  ),
  sun: s(
    [
      { bed: "breeze", gain: 0.45 },
      { bed: "stream", gain: 0.2 },
    ],
    [
      { cue: "birds", every: [3, 6], first: 0.8 },
      { cue: "chime", every: [9, 14] },
    ],
  ),
  field: s(
    [{ bed: "breeze", gain: 0.45 }],
    [
      { cue: "harness", every: [3, 6], first: 0.5 },
      { cue: "moo", every: [8, 13], first: 2.5 },
      { cue: "birds", every: [6, 10] },
    ],
  ),
  mist: s(
    [{ bed: "wind", gain: 0.35 }],
    [
      { cue: "rooster", every: [9, 15], first: 1.5 },
      { cue: "crunch", every: [3, 6] },
    ],
  ),
  angels: s(
    [{ bed: "breeze", gain: 0.35 }],
    [
      { cue: "chime", every: [3, 6], first: 0.5 },
      { cue: "harness", every: [4, 7] },
      { cue: "moo", every: [10, 15] },
    ],
  ),
  snow: s(
    [{ bed: "frost", gain: 0.6 }],
    [
      { cue: "crunch", every: [2.5, 5], first: 0.5 },
      { cue: "birds", every: [3, 7] },
    ],
  ),
  harvest: s(
    [{ bed: "breeze", gain: 0.5 }],
    [
      { cue: "crickets", every: [2, 4], first: 0.4 },
      { cue: "birds", every: [6, 10] },
      { cue: "bell", every: [12, 18] },
    ],
  ),
};

/** Isidore's spring gushes from a hot, dry field: crickets instead of grotto drips. */
const OVERRIDE: Partial<Record<string, Partial<Record<SceneId, Soundscape>>>> = {
  izydor: {
    spring: s(
      [{ bed: "stream", gain: 0.45 }],
      [
        { cue: "gush", every: [14, 22], first: 0.6 },
        { cue: "crickets", every: [2, 4] },
      ],
    ),
  },
};

export function soundscapeOf(scene: SceneId, tale: string): Soundscape {
  return OVERRIDE[tale]?.[scene] ?? SOUNDSCAPES[scene];
}

/** Calm music-box lullaby in G major: pentatonic melody over I–vi–IV–V, one slow bar per chord. */
export const LULLABY = {
  /** Seconds per bar (4 beats at 60 bpm). */
  bar: 4,
  /** Chords as semitones above G3. */
  chords: [
    [0, 4, 7],
    [-3, 0, 4],
    [-7, -3, 0],
    [-5, -1, 2],
  ],
  /** Allowed melody notes: G major pentatonic (semitones above G4). */
  scale: [0, 2, 4, 7, 9, 12, 14, 16],
} as const;

/** Melody of bar `n`: [scale index, beat] pairs, deterministic and gentle (steps, no leaps > 2). */
export function lullabyBar(n: number): [number, number][] {
  const shapes: [number, number][][] = [
    [
      [2, 0],
      [3, 1],
      [4, 2],
    ],
    [
      [4, 0],
      [3, 1.5],
      [2, 2],
      [1, 3],
    ],
    [
      [1, 0],
      [2, 1],
      [3, 2.5],
    ],
    [
      [3, 0],
      [2, 1],
      [1, 2],
      [0, 3],
    ],
    [
      [4, 0],
      [5, 1],
      [6, 2],
      [5, 3],
    ],
    [
      [4, 0],
      [2, 2],
    ],
  ];
  const shape = shapes[(n * 5 + Math.floor(n / 4)) % shapes.length]!;
  // every 8th bar rests on the tonic, so the loop breathes
  return n % 8 === 7 ? [[0, 0]] : shape;
}
