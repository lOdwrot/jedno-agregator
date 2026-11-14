/**
 * The unsettling arrangement of the "Niepokonany" duel: D phrygian/locrian clusters full of tritones and
 * minor seconds, a detuned pad that slowly beats against itself, a low drone, a heartbeat that speeds up
 * with the score and a cracked bell tolling off the beat. No bright finale — the last soul stays tense.
 */
import type { BarPlan, MusicLevel } from "./musicPlan";

/** Chords as semitones above D3. */
const CLUSTERS = [
  [0, 1, 6, 12],
  [-2, 1, 4, 10],
  [-1, 5, 6, 11],
  [0, 3, 6, 9],
];
/** The demons' turn: the same, a semitone lower and even tighter. */
const CLUSTERS_DARK = [
  [-1, 0, 6, 11],
  [-3, 0, 3, 9],
  [-2, 4, 5, 10],
  [-1, 2, 5, 8],
];
/** Cracked bell: minor seconds and the tritone. */
const TOLL = [12, 13, 18, 13, 12, 6];

const LEVELS: Record<MusicLevel, Omit<BarPlan, "chord" | "bells">> = {
  0: {
    bar: 5.2,
    padGain: 0.05,
    cutoff: 650,
    pulse: 0,
    arp: 0,
    hats: 0,
    kick: false,
    heartbeats: 1,
  },
  1: {
    bar: 4.6,
    padGain: 0.048,
    cutoff: 800,
    pulse: 2,
    arp: 0,
    hats: 0,
    kick: false,
    heartbeats: 2,
  },
  2: {
    bar: 4.0,
    padGain: 0.045,
    cutoff: 1000,
    pulse: 4,
    arp: 6,
    hats: 0,
    kick: false,
    heartbeats: 2,
  },
  3: {
    bar: 3.4,
    padGain: 0.042,
    cutoff: 1300,
    pulse: 8,
    arp: 12,
    hats: 4,
    kick: false,
    heartbeats: 4,
  },
};

export function planInfernalBar(level: MusicLevel, dark: boolean, n: number): BarPlan {
  const chord = (dark ? CLUSTERS_DARK : CLUSTERS)[n % 4]!;
  // the bell tolls rarely and never on the downbeat — you keep waiting for it
  const bells: [number, number][] = [];
  const tolls = level >= 2 ? 2 : 1;
  for (let i = 0; i < tolls; i++)
    if ((n + i) % (level === 0 ? 2 : 1) === 0)
      bells.push([TOLL[(n + i * 3) % TOLL.length]! - 12, 1.5 + i * 1.75]);
  return {
    ...LEVELS[level],
    chord,
    bells,
    drone: true,
    detune: dark ? 1.018 : 1.011,
  };
}
