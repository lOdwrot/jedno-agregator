/**
 * Generative background music: a slow organ-like chord progression (D dorian, like a quiet
 * church) with a sparse bell melody. Darker chords play while the demons take their turn.
 */
import { audio, tone } from "./context";

const D = 146.83;
const f = (semi: number) => D * 2 ** (semi / 12);
const LIGHT = [
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
const BELL = [12, 14, 15, 17, 19, 21, 24];
const BAR = 4.2;

let timer: ReturnType<typeof setTimeout> | null = null;
let bar = 0;
let dark = false;

function playBar() {
  const g = audio();
  if (!g) return;
  const chord = (dark ? DARK : LIGHT)[bar % 4]!;
  for (const s of chord) {
    tone(f(s), BAR + 0.6, { type: "sine", gain: 0.05, attack: 0.9, out: "music", cutoff: 1200 });
    tone(f(s) * 2, BAR, { type: "triangle", gain: 0.012, attack: 1.2, out: "music", cutoff: 1800 });
  }
  tone(f(chord[0]! - 12), BAR + 0.6, { type: "sine", gain: 0.06, attack: 0.6, out: "music" });
  // a few bell notes, pseudo-random but calm
  for (let i = 0; i < 3; i++) {
    if ((bar * 7 + i * 3) % 5 === 0) continue;
    const s = BELL[(bar * 5 + i * 2) % BELL.length]! + (dark ? -1 : 0);
    tone(f(s) * 2, 1.8, { type: "sine", gain: 0.025, delay: 0.6 + i * 1.2, out: "music" });
  }
  bar++;
}

export const music = {
  start() {
    if (timer) return;
    const loop = () => {
      playBar();
      timer = setTimeout(loop, BAR * 1000);
    };
    loop();
  },
  stop() {
    if (timer) clearTimeout(timer);
    timer = null;
  },
  /** Switch to darker harmonies (demons' turn) or back. */
  setDark(v: boolean) {
    dark = v;
  },
};
