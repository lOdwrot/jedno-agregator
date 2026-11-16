/** Synthesized one-shot nature sounds of the saints' tales (no audio files). Each plays into `out`. */
import type { Cue } from "../tales/soundscape";

type Pts = [number, number][];

interface VoiceOpts {
  type?: OscillatorType;
  gain?: number;
  cutoff?: number;
  delay?: number;
  attack?: number;
  /** Vibrato depth (Hz) and rate. */
  vib?: [number, number];
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** An oscillator whose pitch follows `pts` ([time, Hz], time 0..dur) with a soft envelope. */
function voice(ctx: AudioContext, out: AudioNode, pts: Pts, dur: number, o: VoiceOpts = {}) {
  const t = ctx.currentTime + (o.delay ?? 0);
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(pts[0]![1], t);
  for (const [at, hz] of pts.slice(1)) osc.frequency.linearRampToValueAtTime(hz, t + at);
  if (o.vib) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = o.vib[1];
    depth.gain.value = o.vib[0];
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + dur + 0.1);
  }
  filter.type = "lowpass";
  filter.frequency.value = o.cutoff ?? 4000;
  const peak = o.gain ?? 0.1;
  const att = o.attack ?? 0.02;
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(peak, t + att);
  amp.gain.setValueAtTime(peak, t + Math.max(att, dur * 0.6));
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(filter).connect(amp).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.1);
}

/** A short burst of filtered noise. */
function burst(
  ctx: AudioContext,
  out: AudioNode,
  dur: number,
  o: { type?: BiquadFilterType; freq?: number; q?: number; gain?: number; delay?: number } = {},
) {
  const t = ctx.currentTime + (o.delay ?? 0);
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  src.buffer = buf;
  filter.type = o.type ?? "lowpass";
  filter.frequency.value = o.freq ?? 2000;
  filter.Q.value = o.q ?? 1;
  amp.gain.value = o.gain ?? 0.2;
  src.connect(filter).connect(amp).connect(out);
  src.start(t);
}

type Play = (ctx: AudioContext, out: AudioNode) => void;

export const CUES: Record<Cue, Play> = {
  bleat: (ctx, out) => {
    const f = rnd(300, 420);
    voice(
      ctx,
      out,
      [
        [0, f * 0.9],
        [0.08, f],
        [0.6, f * 0.86],
      ],
      0.65,
      { type: "sawtooth", gain: 0.05, cutoff: 1500, vib: [f * 0.06, 11], attack: 0.04 },
    );
  },
  birds: (ctx, out) => {
    const n = Math.floor(rnd(2, 6));
    const base = rnd(2600, 3800);
    for (let i = 0; i < n; i++) {
      const f = base * rnd(0.9, 1.15);
      voice(
        ctx,
        out,
        [
          [0, f],
          [0.05, f * 1.35],
          [0.09, f * 1.05],
        ],
        0.1,
        { gain: 0.025, delay: i * rnd(0.11, 0.17), attack: 0.005 },
      );
    }
  },
  howl: (ctx, out) =>
    voice(
      ctx,
      out,
      [
        [0, 330],
        [0.6, 560],
        [2.2, 520],
        [3, 360],
      ],
      3.1,
      { type: "triangle", gain: 0.04, cutoff: 1400, vib: [6, 5], attack: 0.5 },
    ),
  moo: (ctx, out) =>
    voice(
      ctx,
      out,
      [
        [0, 105],
        [0.25, 125],
        [1.3, 92],
      ],
      1.4,
      { type: "sawtooth", gain: 0.07, cutoff: 520, vib: [2, 4], attack: 0.15 },
    ),
  donkey: (ctx, out) => {
    for (let i = 0; i < 3; i++) {
      voice(
        ctx,
        out,
        [
          [0, 620],
          [0.25, 560],
        ],
        0.28,
        { type: "sawtooth", gain: 0.04, cutoff: 1800, delay: i * 0.6 },
      );
      voice(
        ctx,
        out,
        [
          [0, 240],
          [0.3, 200],
        ],
        0.32,
        { type: "sawtooth", gain: 0.05, cutoff: 900, delay: i * 0.6 + 0.28 },
      );
    }
  },
  bell: (ctx, out) => {
    const f = 196;
    for (const [m, g] of [
      [1, 0.05],
      [2, 0.025],
      [2.4, 0.02],
      [3, 0.012],
    ] as const)
      voice(ctx, out, [[0, f * m]], 3.5, { gain: g, attack: 0.005 });
  },
  chime: (ctx, out) =>
    [0, 4, 7, 12].forEach((s, i) =>
      voice(ctx, out, [[0, 784 * 2 ** (s / 12)]], 1.6, {
        gain: 0.015,
        delay: i * 0.12,
        attack: 0.01,
      }),
    ),
  drip: (ctx, out) => {
    const f = rnd(900, 1400);
    voice(
      ctx,
      out,
      [
        [0, f],
        [0.07, f * 1.8],
      ],
      0.12,
      { gain: 0.05, attack: 0.003 },
    );
  },
  gush: (ctx, out) => {
    burst(ctx, out, 1.6, { type: "bandpass", freq: 900, q: 0.6, gain: 0.35 });
    for (let i = 0; i < 6; i++) CUES.drip(ctx, out);
  },
  stone: (ctx, out) => {
    burst(ctx, out, 0.12, { freq: 700, gain: 0.4 });
    voice(
      ctx,
      out,
      [
        [0, 190],
        [0.12, 120],
      ],
      0.15,
      { gain: 0.08, attack: 0.003 },
    );
  },
  crackle: (ctx, out) => {
    for (let i = 0; i < Math.floor(rnd(1, 4)); i++)
      burst(ctx, out, 0.03, { type: "highpass", freq: 3500, gain: 0.12, delay: rnd(0, 0.4) });
  },
  crunch: (ctx, out) => {
    for (let i = 0; i < 2; i++)
      burst(ctx, out, 0.16, { type: "bandpass", freq: 1800, q: 1.2, gain: 0.25, delay: i * 0.5 });
  },
  rooster: (ctx, out) =>
    voice(
      ctx,
      out,
      [
        [0, 520],
        [0.15, 700],
        [0.3, 660],
        [0.9, 760],
        [1.3, 480],
      ],
      1.35,
      { type: "sawtooth", gain: 0.035, cutoff: 2200, vib: [12, 9], attack: 0.03 },
    ),
  harness: (ctx, out) => {
    for (let i = 0; i < 3; i++)
      voice(ctx, out, [[0, rnd(2200, 2600)]], 0.25, {
        type: "triangle",
        gain: 0.02,
        delay: i * 0.18,
        attack: 0.003,
      });
  },
  lute: (ctx, out) => {
    const g = 196;
    [0, 7, 12, 16, 19, 16].forEach((s, i) =>
      voice(ctx, out, [[0, g * 2 ** (s / 12)]], 1.1, {
        type: "triangle",
        gain: 0.03,
        cutoff: 2400,
        delay: i * 0.22,
        attack: 0.004,
      }),
    );
  },
  crickets: (ctx, out) => {
    const f = rnd(4200, 4800);
    for (let i = 0; i < 8; i++)
      voice(ctx, out, [[0, f]], 0.035, {
        type: "square",
        gain: 0.008,
        cutoff: 6000,
        delay: i * 0.05 + (i >= 4 ? 0.2 : 0),
        attack: 0.003,
      });
  },
};
