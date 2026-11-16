/**
 * Sound of the saints' tales: a calm lullaby on the music bus and, on the effects bus, the soundscape
 * of the current page (beds + random cues), cross-faded when the page turns.
 */
import { isMuted } from "../../audio/mute";
import { LULLABY, lullabyBar, type Bed, type Soundscape } from "../tales/soundscape";
import { audio } from "./context";
import { CUES } from "./taleCues";

interface Layer {
  gain: GainNode;
  stops: (() => void)[];
}

let layer: Layer | null = null;

function noiseLoop(ctx: AudioContext, secs = 4): AudioBufferSourceNode {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * secs), ctx.sampleRate);
  const d = buf.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < d.length; i++) {
    brown = (brown + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = brown * 3.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

const BEDS: Record<
  Bed,
  { type: BiquadFilterType; freq: number; q: number; lfo: number; gain: number }
> = {
  breeze: { type: "bandpass", freq: 700, q: 0.7, lfo: 0.12, gain: 0.35 },
  wind: { type: "bandpass", freq: 500, q: 1.2, lfo: 0.18, gain: 0.5 },
  gale: { type: "bandpass", freq: 650, q: 2.5, lfo: 0.25, gain: 0.8 },
  stream: { type: "highpass", freq: 1400, q: 0.5, lfo: 1.7, gain: 0.5 },
  crowd: { type: "bandpass", freq: 420, q: 1.5, lfo: 0.6, gain: 0.6 },
  frost: { type: "highpass", freq: 2500, q: 0.8, lfo: 0.15, gain: 0.25 },
};

/** A looping noise bed; a slow LFO sweeps the filter and swells the volume (gusts, ripples). */
function startBed(ctx: AudioContext, out: AudioNode, bed: Bed, level: number): () => void {
  const b = BEDS[bed];
  const src = noiseLoop(ctx);
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  filter.type = b.type;
  filter.frequency.value = b.freq;
  filter.Q.value = b.q;
  amp.gain.value = b.gain * level;
  const lfo = ctx.createOscillator();
  const sweep = ctx.createGain();
  const swell = ctx.createGain();
  lfo.frequency.value = b.lfo;
  sweep.gain.value = b.freq * 0.4;
  swell.gain.value = b.gain * level * 0.45;
  lfo.connect(sweep).connect(filter.frequency);
  lfo.connect(swell).connect(amp.gain);
  src.connect(filter).connect(amp).connect(out);
  src.start();
  lfo.start();
  return () => {
    src.stop();
    lfo.stop();
  };
}

const between = ([a, b]: [number, number]) => a + Math.random() * (b - a);

function fadeOut(l: Layer, ctx: AudioContext) {
  const t = ctx.currentTime;
  l.gain.gain.cancelScheduledValues(t);
  l.gain.gain.setValueAtTime(l.gain.gain.value, t);
  l.gain.gain.linearRampToValueAtTime(0, t + 0.8);
  setTimeout(() => {
    l.stops.forEach((s) => s());
    l.gain.disconnect();
  }, 900);
}

export const taleAmbience = {
  /** Cross-fade into the soundscape of a page. */
  play(scape: Soundscape) {
    const g = audio();
    if (!g) return;
    const { ctx } = g;
    if (layer) fadeOut(layer, ctx);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
    gain.connect(g.sfx);
    const next: Layer = { gain, stops: [] };
    for (const { bed, gain: level } of scape.beds) next.stops.push(startBed(ctx, gain, bed, level));
    for (const c of scape.cues) {
      let timer: ReturnType<typeof setTimeout>;
      const fire = () => {
        if (!isMuted()) CUES[c.cue](ctx, gain);
        timer = setTimeout(fire, between(c.every) * 1000);
      };
      timer = setTimeout(fire, (c.first ?? between(c.every)) * 1000);
      next.stops.push(() => clearTimeout(timer));
    }
    layer = next;
  },
  stop() {
    const g = audio();
    if (layer && g) fadeOut(layer, g.ctx);
    layer = null;
  },
};

let musicTimer: ReturnType<typeof setTimeout> | null = null;

const G3 = 196;
const hz = (semi: number) => G3 * 2 ** (semi / 12);

function lullabyStep(n: number) {
  const g = audio();
  if (!g) return;
  const { ctx } = g;
  const t = ctx.currentTime;
  const len = LULLABY.bar;
  const chord = LULLABY.chords[n % LULLABY.chords.length]!;
  const note = (f: number, at: number, dur: number, peak: number, attack: number) => {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = attack > 0.1 ? "sine" : "triangle";
    osc.frequency.value = f;
    amp.gain.setValueAtTime(0.0001, t + at);
    amp.gain.exponentialRampToValueAtTime(peak, t + at + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
    osc.connect(amp).connect(g.music);
    osc.start(t + at);
    osc.stop(t + at + dur + 0.1);
  };
  // warm, slow pad + a low root
  for (const s of chord) note(hz(s), 0, len + 1.5, 0.018, 1.2);
  note(hz(chord[0]! - 12), 0, len + 1, 0.03, 0.8);
  // music-box melody (two partials for the tinkle)
  for (const [i, beat] of lullabyBar(n)) {
    const f = hz(12 + LULLABY.scale[i]!);
    note(f, beat, 2.2, 0.035, 0.01);
    note(f * 4, beat, 0.8, 0.006, 0.005);
  }
}

export const taleMusic = {
  start() {
    if (musicTimer) return;
    let n = 0;
    const loop = () => {
      lullabyStep(n++);
      musicTimer = setTimeout(loop, LULLABY.bar * 1000);
    };
    loop();
  },
  stop() {
    if (musicTimer) clearTimeout(musicTimer);
    musicTimer = null;
  },
};
