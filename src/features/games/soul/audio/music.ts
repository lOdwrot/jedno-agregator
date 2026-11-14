/**
 * Generative background music: an organ-like chord progression (D dorian, like a quiet church)
 * with a bell melody. Darker chords play while the demons take their turn, and the music grows
 * with the score — faster and brighter until the fight for the last soul (see `musicPlan`).
 * The "infernal" theme (hardest opponent) swaps it for a detuned, droning, heartbeat-driven score.
 */
import { audio, noise, tone } from "./context";
import { musicLevel, planBar, type MusicLevel, type MusicTheme } from "./musicPlan";

const D = 146.83;
const f = (semi: number) => D * 2 ** (semi / 12);

let timer: ReturnType<typeof setTimeout> | null = null;
let bar = 0;
let dark = false;
let level: MusicLevel = 0;
let theme: MusicTheme = "church";

function playBar(): number {
  const p = planBar(level, dark, bar, theme);
  bar++;
  if (!audio()) return p.bar;
  const beat = p.bar / 4;
  const opts = { out: "music" as const, cutoff: p.cutoff };
  for (const s of p.chord) {
    tone(f(s), p.bar + 0.6, { ...opts, type: "sine", gain: p.padGain, attack: 0.9 });
    tone(f(s) * 2, p.bar, { ...opts, type: "triangle", gain: 0.012, attack: 1.2 });
  }
  if (p.detune)
    for (const s of p.chord)
      tone(f(s) * p.detune, p.bar + 0.6, { ...opts, type: "sawtooth", gain: 0.01, attack: 1.4 });
  if (p.drone)
    tone(f(p.chord[0]! - 24), p.bar + 0.8, {
      type: "sawtooth",
      gain: 0.05,
      attack: 1.2,
      cutoff: 260,
      out: "music",
    });
  for (let i = 0; i < (p.heartbeats ?? 0); i++) {
    const at = (i * p.bar) / (p.heartbeats ?? 1);
    for (const [d, gain] of [
      [0, 0.16],
      [0.22, 0.11],
    ] as const)
      tone(70, 0.28, {
        type: "sine",
        gain,
        slideTo: 34,
        attack: 0.006,
        delay: at + d,
        out: "music",
      });
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
  for (const [s, at] of p.bells) {
    const len = Math.min(1.8, beat * 1.6) * (theme === "infernal" ? 2 : 1);
    tone(f(s) * 2, len, { type: "sine", gain: 0.025, delay: at * beat, out: "music" });
    // cracked bell: an inharmonic, slightly flat partial
    if (theme === "infernal")
      tone(f(s) * 2 * 2.41, len * 0.7, {
        type: "sine",
        gain: 0.012,
        delay: at * beat,
        out: "music",
      });
  }
  return p.bar;
}

/** A short rising bell run when the music steps up a level. */
function flourish(to: MusicLevel) {
  const run =
    theme === "infernal"
      ? [12, 13, 18, 19, 24]
      : to === 3
        ? [12, 16, 19, 24, 28]
        : [12, 15, 19, 24];
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
  /** Church organ (default) or the unsettling infernal score; takes effect from the next bar. */
  setTheme(t: MusicTheme) {
    theme = t;
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
