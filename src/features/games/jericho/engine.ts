/** Pure logic of "Mury Jerycha": a one-button rhythm game (Joz 6 — seven laps, trumpets, a shout). */

export const BPM = 100;
export const BEAT = 60 / BPM;
export const LAPS = 7;
export const BEATS_PER_LAP = 8;
/** Count-in before the first note (seconds). */
export const LEAD_IN = 4 * BEAT;
export const LAP_TIME = BEATS_PER_LAP * BEAT;
/** Hit windows (seconds from the note). */
export const PERFECT = 0.07;
export const GOOD = 0.15;
/** Below this share of hit notes the priests lose the step. */
export const PASS_RATE = 0.6;
const COLLAPSE_TIME = 2.6;

/** Note offsets in beats, per lap — each lap a bit trickier. */
export const PATTERNS: readonly number[][] = [
  [0, 2, 4, 6],
  [0, 1, 2, 4, 5, 6],
  [0, 2, 3, 4, 6, 7],
  [0, 1, 2, 3, 4, 6],
  [0, 1.5, 2, 3.5, 4, 6, 7],
  [0, 0.5, 1, 2, 4, 4.5, 5, 6],
  [0, 1, 2, 3, 4, 5, 6, 7],
];

export type Judgement = "perfect" | "good" | "miss";
export interface Note {
  id: number;
  /** Game time when it should be played. */
  t: number;
  /** The very last note is the great shout (Joz 6,20). */
  kind: "horn" | "shout";
  result: Judgement | null;
}
export type Phase = "intro" | "playing" | "collapse" | "won" | "lost";

export interface JerichoState {
  phase: Phase;
  time: number;
  notes: Note[];
  combo: number;
  maxCombo: number;
  score: number;
  /** Blasts with no note around them (spamming does not pay off). */
  fumbles: number;
  feedback: { text: string; kind: Judgement | "early"; at: number } | null;
  /** Time spent in the collapse animation. */
  collapseT: number;
}

export function createNotes(): Note[] {
  const notes: Note[] = [];
  PATTERNS.forEach((pattern, lap) => {
    for (const beat of pattern) {
      notes.push({
        id: notes.length,
        t: LEAD_IN + lap * LAP_TIME + beat * BEAT,
        kind: "horn",
        result: null,
      });
    }
  });
  notes.push({ id: notes.length, t: LEAD_IN + LAPS * LAP_TIME, kind: "shout", result: null });
  return notes;
}

export function createJericho(): JerichoState {
  return {
    phase: "intro",
    time: 0,
    notes: createNotes(),
    combo: 0,
    maxCombo: 0,
    score: 0,
    fumbles: 0,
    feedback: null,
    collapseT: 0,
  };
}

export const startJericho = (): JerichoState => ({ ...createJericho(), phase: "playing" });

/** 1-based lap the procession is on (0 during the count-in, LAPS+1 at the shout). */
export const lapAt = (time: number) =>
  time < LEAD_IN ? 0 : Math.min(LAPS + 1, Math.floor((time - LEAD_IN) / LAP_TIME) + 1);

export const hitCount = (s: JerichoState) =>
  s.notes.filter((n) => n.result === "perfect" || n.result === "good").length;
/** Accuracy so far: hits against notes already played plus false blasts (for the HUD). */
export function accuracySoFar(s: JerichoState): number {
  const played = s.notes.filter((n) => n.result !== null).length + s.fumbles;
  return played === 0 ? 1 : hitCount(s) / played;
}

/** Hits against all notes plus false blasts (decides the result). */
export const hitRate = (s: JerichoState) => hitCount(s) / (s.notes.length + s.fumbles);

const PERFECT_LINES = ["Idealnie!", "Czysto jak dzwon!", "Trąba anielska!"];
const GOOD_LINES = ["Dobrze!", "Prawie idealnie!", "Rytm trzymany!"];

/** One trumpet blast (tap / Space). */
export function blow(s: JerichoState): JerichoState {
  if (s.phase !== "playing") return s;
  const near = s.notes.find((n) => n.result === null && Math.abs(n.t - s.time) <= GOOD);
  if (!near) {
    // a blast with no note around: the priests wobble, combo is lost
    return {
      ...s,
      combo: 0,
      fumbles: s.fumbles + 1,
      feedback: { text: "Fałszywa nuta! Ktoś w szeregu się potknął.", kind: "early", at: s.time },
    };
  }
  const perfect = Math.abs(near.t - s.time) <= PERFECT;
  const result: Judgement = perfect ? "perfect" : "good";
  const combo = s.combo + 1;
  const lines = perfect ? PERFECT_LINES : GOOD_LINES;
  const text = near.kind === "shout" ? "OKRZYK! Mury drżą…" : lines[combo % lines.length]!;
  return {
    ...s,
    notes: s.notes.map((n) => (n.id === near.id ? { ...n, result } : n)),
    combo,
    maxCombo: Math.max(s.maxCombo, combo),
    score: s.score + (perfect ? 100 : 50) + Math.min(combo, 20) * 5,
    feedback: { text, kind: result, at: s.time },
  };
}

export function stepJericho(s: JerichoState, dt: number): JerichoState {
  if (s.phase === "collapse") {
    const collapseT = s.collapseT + dt;
    return collapseT >= COLLAPSE_TIME
      ? { ...s, collapseT, time: s.time + dt, phase: "won" }
      : { ...s, collapseT, time: s.time + dt };
  }
  if (s.phase !== "playing") return s;

  const time = s.time + dt;
  let next: JerichoState = { ...s, time };
  const missed = s.notes.some((n) => n.result === null && time - n.t > GOOD);
  if (missed) {
    next = {
      ...next,
      combo: 0,
      notes: s.notes.map((n) =>
        n.result === null && time - n.t > GOOD ? { ...n, result: "miss" } : n,
      ),
      feedback: { text: "Pudło — trąba zachrypiała.", kind: "miss", at: time },
    };
  }

  const last = next.notes[next.notes.length - 1]!;
  if (last.result !== null && time > last.t + 0.3) {
    return hitRate(next) >= PASS_RATE && last.result !== "miss"
      ? {
          ...next,
          phase: "collapse",
          collapseT: 0,
          feedback: { text: "BUUUM! Mury Jerycha runęły!", kind: "perfect", at: time },
        }
      : {
          ...next,
          phase: "lost",
          feedback: { text: "Mury stoją. Strażnicy biją brawo… z ironią.", kind: "miss", at: time },
        };
  }
  return next;
}
