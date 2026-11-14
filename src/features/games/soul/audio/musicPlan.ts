/**
 * Pure arrangement of the duel music. The intensity level follows the souls taken so far
 * (the higher score of the two players): 0 = calm organ, 3 = the fight for the last soul —
 * faster, brighter, in D major, with a driving pulse, arpeggios and light percussion.
 */
import { SOULS_TO_WIN } from "../data/cards";

export type MusicLevel = 0 | 1 | 2 | 3;

/** Chords as semitones above D3. */
const CALM = [
  [0, 7, 12, 15],
  [-2, 5, 10, 14],
  [-4, 3, 8, 12],
  [-5, 2, 7, 10],
];
const DARK = [
  [0, 6, 12, 15],
  [1, 7, 13, 16],
  [-1, 6, 11, 14],
  [0, 3, 6, 12],
];
/** D – A – Bm – G: the joyful finale. */
const FINALE = [
  [0, 7, 12, 16],
  [-5, 2, 7, 11],
  [-3, 4, 9, 12],
  [-7, 0, 5, 9],
];
/** The demons' turn in the finale: still driving, but minor with a dominant A. */
const FINALE_DARK = [
  [0, 7, 12, 15],
  [-2, 5, 10, 14],
  [-4, 3, 8, 12],
  [-5, 2, 7, 11],
];

const BELL_DORIAN = [12, 14, 15, 17, 19, 21, 24];
const BELL_MAJOR = [12, 14, 16, 19, 21, 24, 26, 28];

export interface BarPlan {
  /** Bar length in seconds. */
  bar: number;
  chord: number[];
  padGain: number;
  cutoff: number;
  /** Bass notes per bar (0 = one long held note). */
  pulse: number;
  /** Arpeggio notes per bar (0 = none). */
  arp: number;
  kick: boolean;
  /** Hi-hat ticks per bar (0 = none). */
  hats: number;
  /** Bell melody: [semitone, delay in beats] pairs. */
  bells: [number, number][];
}

interface LevelSpec {
  bar: number;
  padGain: number;
  cutoff: number;
  pulse: number;
  arp: number;
  hats: number;
  bellCount: number;
}

const LEVELS: Record<MusicLevel, LevelSpec> = {
  0: { bar: 4.2, padGain: 0.05, cutoff: 1200, pulse: 0, arp: 0, hats: 0, bellCount: 3 },
  1: { bar: 3.6, padGain: 0.045, cutoff: 1500, pulse: 4, arp: 0, hats: 0, bellCount: 3 },
  2: { bar: 3.0, padGain: 0.04, cutoff: 2000, pulse: 4, arp: 8, hats: 4, bellCount: 4 },
  3: { bar: 2.4, padGain: 0.035, cutoff: 2800, pulse: 8, arp: 16, hats: 8, bellCount: 8 },
};

/** Level from the score: 0 at the start, 3 once someone needs just one more soul. */
export function musicLevel(souls: number): MusicLevel {
  const n = Math.max(0, Math.min(SOULS_TO_WIN - 1, souls));
  return Math.round((n / (SOULS_TO_WIN - 1)) * 3) as MusicLevel;
}

export function planBar(level: MusicLevel, dark: boolean, n: number): BarPlan {
  const finale = level === 3;
  const set = finale ? (dark ? FINALE_DARK : FINALE) : dark ? DARK : CALM;
  const chord = set[n % 4]!;
  const scale = finale && !dark ? BELL_MAJOR : BELL_DORIAN;
  const shift = dark && !finale ? -1 : 0;
  const bells: [number, number][] = [];
  const { bellCount: count, ...rest } = LEVELS[level];
  const step = 4 / count;
  for (let i = 0; i < count; i++) {
    if (!finale && (n * 7 + i * 3) % 5 === 0) continue;
    if (finale && i % 4 === 3 && n % 2 === 1) continue;
    const s = scale[(n * 5 + i * 2) % scale.length]! + shift;
    bells.push([s, (level === 0 ? 0.6 : 0) + i * step]);
  }
  return { ...rest, chord, kick: finale, bells };
}
