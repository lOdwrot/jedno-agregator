/**
 * Generative background music: an organ-like chord progression (D dorian, like a quiet church)
 * with a bell melody. Darker chords play while the demons take their turn, and the music grows
 * with the score — faster and brighter until the fight for the last soul (see `musicPlan`).
 */
import { audio, noise, tone } from "./context";
import { musicLevel, planBar, type MusicLevel } from "./musicPlan";

const D = 146.83;
const f = (semi: number) => D * 2 ** (semi / 12);

let timer: ReturnType<typeof setTimeout> | null = null;
let bar = 0;
let dark = false;
let level: MusicLevel = 0;

function playBar(): number {
  const p = planBar(level, dark, bar);
  bar++;
  if (!audio()) return p.bar;
  const beat = p.bar / 4;
  const opts = { out: "music" as const, cutoff: p.cutoff };
  for (const s of p.chord) {
    tone(f(s), p.bar + 0.6, { ...opts, type: "sine", gain: p.padGain, attack: 0.9 });
    tone(f(s) * 2, p.bar, { ...opts, type: "triangle", gain: 0.012, attack: 1.2 });
  }
  const root = f(p.chord[0]! - 12);
  if (!p.pulse) tone(root, p.bar + 0.6, { type: "sine", gain: 0.06, attack: 0.6, out: "music" });
  for (let i = 0; i < p.pulse; i++) {
    const oct = p.pulse > 4 && i % 2 === 1 ? 2 : 1;
    const len = p.bar / p.pulse;
    tone(root * oct, len * 0.9, { ...opts, type: "triangle", gain: 0.07, delay: i * len });
  }
  for (let i = 0; i < p.arp; i++) {
    const s = p.chord[[0, 1, 2, 3, 2, 1][i % 6]!]! + 12;
    const len = p.bar / p.arp;
    tone(f(s), len * 1.6, { ...opts, type: "triangle", gain: 0.018, delay: i * len });
  }
  if (p.kick)
    for (let i = 0; i < 4; i++)
      tone(120, 0.22, {
        type: "sine",
        gain: 0.14,
        slideTo: 42,
        attack: 0.004,
        delay: i * beat,
        out: "music",
      });
  for (let i = 0; i < p.hats; i++) {
    const len = p.bar / p.hats;
    const accent = p.hats > 4 ? i % 2 === 1 : true;
    noise(0.05, {
      cutoff: 7000,
      gain: accent ? 0.05 : 0.025,
      delay: i * len + (p.hats > 4 ? 0 : len / 2),
      highpass: true,
      out: "music",
    });
  }
  for (const [s, at] of p.bells)
    tone(f(s) * 2, Math.min(1.8, beat * 1.6), {
      type: "sine",
      gain: 0.025,
      delay: at * beat,
      out: "music",
    });
  return p.bar;
}

/** A short rising bell run when the music steps up a level. */
function flourish(to: MusicLevel) {
  const run = to === 3 ? [12, 16, 19, 24, 28] : [12, 15, 19, 24];
  run.forEach((s, i) =>
    tone(f(s) * 2, 0.9, { type: "sine", gain: 0.03, delay: i * 0.09, out: "music" }),
  );
}

export const music = {
  start() {
    if (timer) return;
    bar = 0;
    level = 0;
    dark = false;
    const loop = () => {
      const len = playBar();
      timer = setTimeout(loop, len * 1000);
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
  /** Follow the score: pass the higher soul count of the two players. */
  setSouls(souls: number) {
    const next = musicLevel(souls);
    if (next === level) return;
    if (next > level && timer) flourish(next);
    level = next;
  },
};
