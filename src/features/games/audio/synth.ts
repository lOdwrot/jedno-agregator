/**
 * Tiny Web Audio synthesizer shared by all games — no audio files, everything is generated.
 * The AudioContext is created lazily on the first sound (always after a user gesture: "Start" button).
 */
type AudioCtor = typeof AudioContext;

export interface VoiceOptions {
  type?: OscillatorType;
  gain?: number;
  /** Glide to this frequency over the duration. */
  slideTo?: number;
  cutoff?: number;
  /** Start offset in seconds (for little melodies). */
  delay?: number;
  /** Vibrato depth in Hz (0 = none). */
  vibrato?: number;
  attack?: number;
}

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio(): void {
  context();
}

export function voice(freq: number, dur: number, o: VoiceOptions = {}): void {
  const c = context();
  if (!c) return;
  const t = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator();
  const filter = c.createBiquadFilter();
  const amp = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
  if (o.vibrato) {
    const lfo = c.createOscillator();
    const depth = c.createGain();
    lfo.frequency.value = 7;
    depth.gain.value = o.vibrato;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
  }
  filter.type = "lowpass";
  filter.frequency.value = o.cutoff ?? 4000;
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.1, t + (o.attack ?? 0.015));
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(filter).connect(amp).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export interface NoiseOptions {
  gain?: number;
  /** Filter frequency at the start and (optionally) the end — sweeps make whooshes and waves. */
  from?: number;
  to?: number;
  type?: BiquadFilterType;
  delay?: number;
}

export function noise(dur: number, o: NoiseOptions = {}): void {
  const c = context();
  if (!c) return;
  const t = c.currentTime + (o.delay ?? 0);
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const amp = c.createGain();
  src.buffer = buf;
  filter.type = o.type ?? "lowpass";
  filter.frequency.setValueAtTime(o.from ?? 1200, t);
  if (o.to) filter.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  amp.gain.value = o.gain ?? 0.2;
  src.connect(filter).connect(amp).connect(c.destination);
  src.start(t);
}
