/** Tiny Web Audio synth for the Jericho game: ram's-horn blasts, a silly "bwaaap" on misses, beat ticks. */
type AudioCtor = typeof AudioContext;

export interface JerichoSound {
  unlock(): void;
  horn(perfect: boolean): void;
  miss(): void;
  tick(accent: boolean): void;
  shout(): void;
  rumble(): void;
}

export function createSound(): JerichoSound {
  let ctx: AudioContext | null = null;
  const get = () => {
    if (!ctx) {
      const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
      const Ctor = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  function voice(
    freq: number,
    dur: number,
    {
      type = "sawtooth",
      gain = 0.12,
      slideTo,
      cutoff = 1600,
    }: {
      type?: OscillatorType;
      gain?: number;
      slideTo?: number;
      cutoff?: number;
    } = {},
  ) {
    const c = get();
    if (!c) return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const filter = c.createBiquadFilter();
    const amp = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.03);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(filter).connect(amp).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function noise(dur: number, cutoff: number, gain: number) {
    const c = get();
    if (!c) return;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const amp = c.createGain();
    src.buffer = buf;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    amp.gain.value = gain;
    src.connect(filter).connect(amp).connect(c.destination);
    src.start();
  }

  return {
    unlock: () => void get(),
    horn(perfect) {
      // a ram's horn: a fifth with a little scoop up
      voice(220, 0.38, { slideTo: perfect ? 233 : 226, gain: 0.1 });
      voice(330, 0.38, { slideTo: perfect ? 349 : 340, gain: 0.06 });
    },
    miss: () => voice(130, 0.42, { slideTo: 70, gain: 0.1, cutoff: 700 }),
    tick: (accent) => voice(accent ? 880 : 660, 0.06, { type: "sine", gain: accent ? 0.05 : 0.03 }),
    shout() {
      voice(196, 1.1, { slideTo: 262, gain: 0.12, cutoff: 2200 });
      voice(294, 1.1, { slideTo: 392, gain: 0.08, cutoff: 2200 });
      noise(0.6, 1200, 0.15);
    },
    rumble: () => noise(1.8, 220, 0.5),
  };
}
