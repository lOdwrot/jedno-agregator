/** The games' sound effect library, built on the synth. All calls respect the global mute. */
import { isMuted } from "./mute";
import { noise, unlockAudio, voice } from "./synth";

const NOTE = { C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, C6: 1047 } as const;
const PENTATONIC = [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C6];

function guard<A extends unknown[]>(fn: (...args: A) => void) {
  return (...args: A) => {
    if (!isMuted()) fn(...args);
  };
}

export const sfx = {
  unlock: unlockAudio,
  /** UI click / locking a gauge. */
  click: guard(() => voice(1400, 0.05, { type: "square", gain: 0.04, cutoff: 3000 })),
  tick: guard((accent: boolean) => voice(accent ? 880 : 660, 0.06, { gain: accent ? 0.05 : 0.03 })),
  /** Sling / lane change. */
  whoosh: guard(() => noise(0.28, { from: 400, to: 3000, type: "bandpass", gain: 0.35 })),
  swish: guard(() => noise(0.12, { from: 2500, to: 900, type: "bandpass", gain: 0.25 })),
  whistle: guard(() => voice(1300, 0.7, { slideTo: 700, gain: 0.025 })),
  clang: guard(() => {
    voice(1250, 0.5, { type: "square", gain: 0.035, cutoff: 5000 });
    voice(1870, 0.4, { type: "square", gain: 0.025, cutoff: 6000 });
  }),
  bonk: guard(() => voice(220, 0.22, { slideTo: 70, gain: 0.25 })),
  thud: guard(() => noise(0.18, { from: 320, gain: 0.45 })),
  stomp: guard(() => voice(70, 0.18, { slideTo: 40, gain: 0.18 })),
  boom: guard(() => {
    voice(110, 0.9, { slideTo: 35, gain: 0.3 });
    noise(0.9, { from: 600, to: 80, gain: 0.5 });
  }),
  pinch: guard(() => {
    voice(2200, 0.05, { type: "square", gain: 0.03 });
    voice(2600, 0.05, { type: "square", gain: 0.03, delay: 0.07 });
  }),
  blub: guard(() => {
    voice(300, 0.12, { slideTo: 700, gain: 0.12 });
    voice(350, 0.12, { slideTo: 800, gain: 0.1, delay: 0.13 });
  }),
  bleat: guard(() =>
    voice(520, 0.45, { type: "sawtooth", slideTo: 480, gain: 0.06, vibrato: 30, cutoff: 1800 }),
  ),
  /** Pentatonic chime — pass a growing step for rising "success" sounds. */
  chime: guard((step: number = 0) => {
    const f = PENTATONIC[step % PENTATONIC.length]! * (step >= PENTATONIC.length ? 2 : 1);
    voice(f, 0.45, { gain: 0.08 });
    voice(f * 2, 0.3, { gain: 0.03 });
  }),
  flip: guard(() => noise(0.07, { from: 3000, type: "highpass", gain: 0.18 })),
  boing: guard(() => voice(200, 0.4, { slideTo: 520, gain: 0.1, vibrato: 40 })),
  gallop: guard(() => {
    noise(0.05, { from: 900, gain: 0.25 });
    noise(0.05, { from: 700, gain: 0.2, delay: 0.09 });
  }),
  wave: guard(() => {
    noise(1.6, { from: 300, to: 2400, gain: 0.45 });
    noise(1.2, { from: 2000, to: 200, gain: 0.3, delay: 0.6 });
  }),
  coo: guard(() => {
    voice(480, 0.25, { slideTo: 430, gain: 0.07, vibrato: 12 });
    voice(460, 0.35, { slideTo: 400, gain: 0.07, vibrato: 12, delay: 0.3 });
  }),
  fanfare: guard(() => {
    [NOTE.C5, NOTE.E5, NOTE.G5].forEach((f, i) =>
      voice(f, 0.18, { type: "triangle", gain: 0.1, delay: i * 0.13 }),
    );
    voice(NOTE.C6, 0.7, { type: "triangle", gain: 0.12, delay: 0.42, vibrato: 6 });
    voice(NOTE.G5, 0.7, { type: "triangle", gain: 0.06, delay: 0.42 });
  }),
  /** The classic "wah wah wah wahhh". */
  sadTrombone: guard(() => {
    [392, 370, 349].forEach((f, i) =>
      voice(f, 0.32, { type: "sawtooth", gain: 0.06, delay: i * 0.38, cutoff: 1200 }),
    );
    voice(330, 1.1, { type: "sawtooth", gain: 0.07, delay: 1.14, vibrato: 8, cutoff: 1200 });
  }),
  horn: guard((perfect: boolean) => {
    voice(220, 0.38, { type: "sawtooth", slideTo: perfect ? 233 : 226, gain: 0.1, cutoff: 1600 });
    voice(330, 0.38, { type: "sawtooth", slideTo: perfect ? 349 : 340, gain: 0.06, cutoff: 1600 });
  }),
  fart: guard(() => voice(130, 0.42, { type: "sawtooth", slideTo: 70, gain: 0.1, cutoff: 700 })),
  shout: guard(() => {
    voice(196, 1.1, { type: "sawtooth", slideTo: 262, gain: 0.12, cutoff: 2200 });
    voice(294, 1.1, { type: "sawtooth", slideTo: 392, gain: 0.08, cutoff: 2200 });
    noise(0.6, { from: 1200, gain: 0.15 });
  }),
  rumble: guard(() => noise(1.8, { from: 220, gain: 0.5 })),
};
