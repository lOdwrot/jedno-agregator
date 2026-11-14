import { isMuted, setMuted } from "../../audio/mute";
/** Shared Web Audio graph of the card game: one context, separate volumes for effects and music. */
type AudioCtor = typeof AudioContext;

interface Graph {
  ctx: AudioContext;
  sfx: GainNode;
  music: GainNode;
}

let graph: Graph | null = null;
const KEY = "jedno-walka-o-dusze:audio";

export interface AudioPrefs {
  sfx: boolean;
  music: boolean;
}

export function loadPrefs(): AudioPrefs {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "null") as AudioPrefs | null;
    if (p && typeof p.music === "boolean") return { music: p.music, sfx: !isMuted() };
  } catch {
    /* ignore */
  }
  return { sfx: !isMuted(), music: true };
}

export function savePrefs(p: AudioPrefs) {
  if (p.sfx === isMuted()) setMuted(!p.sfx);
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode */
  }
  if (graph) {
    graph.sfx.gain.value = p.sfx ? 0.9 : 0;
    graph.music.gain.value = p.music ? 0.5 : 0;
  }
}

/** Lazily creates the context (must first happen inside a user gesture). */
export function audio(): Graph | null {
  if (typeof window === "undefined") return null;
  if (!graph) {
    const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    try {
      const ctx = new Ctor();
      const sfx = ctx.createGain();
      const music = ctx.createGain();
      sfx.connect(ctx.destination);
      music.connect(ctx.destination);
      graph = { ctx, sfx, music };
      savePrefs(loadPrefs());
    } catch {
      return null;
    }
  }
  if (graph.ctx.state === "suspended") void graph.ctx.resume();
  return graph;
}

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
  cutoff?: number;
  delay?: number;
  attack?: number;
  out?: "sfx" | "music";
}

/** One enveloped oscillator note. */
export function tone(freq: number, dur: number, o: ToneOpts = {}) {
  if (o.out !== "music" && isMuted()) return;
  const g = audio();
  if (!g) return;
  const { ctx } = g;
  const t = ctx.currentTime + (o.delay ?? 0);
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  osc.type = o.type ?? "triangle";
  osc.frequency.setValueAtTime(freq, t);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
  filter.type = "lowpass";
  filter.frequency.value = o.cutoff ?? 3000;
  const peak = o.gain ?? 0.12;
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(peak, t + (o.attack ?? 0.015));
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc
    .connect(filter)
    .connect(amp)
    .connect(o.out === "music" ? g.music : g.sfx);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Filtered noise burst (swishes, impacts). */
export function noise(
  dur: number,
  o: { cutoff?: number; gain?: number; delay?: number; highpass?: boolean } = {},
) {
  if (isMuted()) return;
  const g = audio();
  if (!g) return;
  const { ctx } = g;
  const t = ctx.currentTime + (o.delay ?? 0);
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++)
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  src.buffer = buf;
  filter.type = o.highpass ? "highpass" : "lowpass";
  filter.frequency.value = o.cutoff ?? 2000;
  amp.gain.value = o.gain ?? 0.2;
  src.connect(filter).connect(amp).connect(g.sfx);
  src.start(t);
}
