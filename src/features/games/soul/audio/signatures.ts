/** Unique synthesized sounds of the strongest / most iconic attacks, plus heavier generic hits. */
import { noise, tone } from "./context";

const A = 220;
const n = (semi: number) => A * 2 ** (semi / 12);

function chord(
  semis: number[],
  dur: number,
  o: { type?: OscillatorType; gain?: number; delay?: number } = {},
) {
  semis.forEach((s) =>
    tone(n(s), dur, { type: o.type ?? "sine", gain: o.gain ?? 0.05, delay: o.delay, attack: 0.08 }),
  );
}
function bell(semi: number, delay = 0, gain = 0.06) {
  for (const [r, g] of [
    [1, 1],
    [2.76, 0.5],
    [5.4, 0.25],
  ] as const)
    tone(n(semi) * r, 1.6, { type: "sine", gain: gain * g, delay });
}
function gong(delay = 0) {
  for (const [f, g] of [
    [82, 0.2],
    [117, 0.12],
    [164, 0.09],
    [231, 0.06],
  ] as const)
    tone(f, 2.6, { type: "sine", gain: g, delay, slideTo: f * 0.97 });
  noise(0.4, { cutoff: 1200, gain: 0.2, delay });
}
function drum(delay: number, gain = 0.3) {
  tone(120, 0.25, { type: "sine", gain, slideTo: 45, delay });
  noise(0.12, { cutoff: 900, gain: gain * 0.6, delay });
}
function choir(semis: number[], delay = 0, dur = 1.8) {
  semis.forEach((s) => {
    tone(n(s), dur, { type: "sawtooth", gain: 0.018, delay, attack: 0.25 });
    tone(n(s) * 1.004, dur, { type: "triangle", gain: 0.03, delay, attack: 0.3 });
  });
}

export const signatureSound: Record<string, () => void> = {
  keys: () => {
    for (let i = 0; i < 6; i++)
      tone(2200 + (i % 3) * 400, 0.08, { type: "square", gain: 0.03, delay: i * 0.06 });
    choir([0, 4, 7, 12], 0.35);
  },
  gong: () => gong(),
  scroll: () => {
    noise(0.5, { cutoff: 4000, gain: 0.12, highpass: true });
    drum(0.55, 0.35);
  },
  chant: () =>
    [0, 2, 3, 5, 3, 2, 0].forEach((s, i) =>
      tone(n(s), 0.5, { type: "triangle", gain: 0.06, delay: i * 0.18, attack: 0.05 }),
    ),
  hussars: () => {
    for (let i = 0; i < 10; i++) drum(i * 0.11 + (i % 2) * 0.03, 0.18);
    [7, 12, 16, 19, 24].forEach((s, i) =>
      tone(n(s), 0.35, { type: "sawtooth", gain: 0.05, delay: 0.25 + i * 0.13, attack: 0.02 }),
    );
  },
  book: () => {
    noise(0.2, { cutoff: 3000, gain: 0.1, highpass: true });
    drum(0.2, 0.4);
  },
  window: () => {
    noise(1.2, { cutoff: 900, gain: 0.08 });
    [12, 16, 19].forEach((s, i) => bell(s, 0.3 + i * 0.15, 0.04));
  },
  westerplatte: () => {
    drum(0, 0.6);
    noise(1.2, { cutoff: 300, gain: 0.45 });
    [0, 5, 7].forEach((s, i) => bell(s - 12, 0.4 + i * 0.35, 0.08));
    choir([0, 7, 12, 16], 0.6, 2.4);
  },
  fear_not: () => choir([0, 4, 7, 12], 0, 1.6),
  love: () => chord([0, 4, 7, 11, 14], 1.5, { type: "triangle", gain: 0.04 }),
  drums: () => [0, 0.15, 0.3, 0.38, 0.46, 0.6].forEach((d) => drum(d, 0.28)),
  hammer: () =>
    [0, 0.22, 0.44].forEach((d) => {
      tone(900, 0.06, { type: "square", gain: 0.06, delay: d });
      noise(0.15, { cutoff: 2500, gain: 0.3, delay: d });
    }),
  procession: () => [0, 4, 7, 12].forEach((s, i) => bell(s, i * 0.22)),
  organ: () => {
    [-12, 0, 7, 12, 16, 19].forEach((s) => {
      tone(n(s), 1.8, { type: "sawtooth", gain: 0.02, attack: 0.05 });
      tone(n(s) * 2, 1.8, { type: "square", gain: 0.008, attack: 0.05 });
    });
  },
  sea: () => {
    noise(1.4, { cutoff: 700, gain: 0.2 });
    bell(7, 0.5);
  },
  overcome: () => {
    noise(0.5, { cutoff: 400, gain: 0.25 });
    choir([0, 4, 7, 12, 16], 0.3, 2);
  },
  swarm: () => {
    for (let i = 0; i < 14; i++)
      tone(180 + Math.random() * 60, 0.25, {
        type: "sawtooth",
        gain: 0.025,
        delay: i * 0.07,
        cutoff: 1400,
        slideTo: 200 + Math.random() * 80,
      });
  },
  roar: () => {
    for (let i = 0; i < 3; i++)
      tone(160 / (i + 1), 0.9, {
        type: "sawtooth",
        gain: 0.08 / (i + 1),
        delay: i * 0.3,
        slideTo: 50,
        cutoff: 900,
      });
    noise(0.8, { cutoff: 500, gain: 0.25 });
  },
  coins: () => {
    for (let i = 0; i < 9; i++)
      tone(2600 + Math.random() * 1500, 0.12, { type: "triangle", gain: 0.04, delay: i * 0.06 });
    tone(1800, 0.3, { type: "square", gain: 0.03, delay: 0.6 });
  },
  boo: () =>
    [0, -1, -3, -5].forEach((s, i) =>
      tone(n(s - 12), 0.35, { type: "sawtooth", gain: 0.05, delay: i * 0.16, cutoff: 800 }),
    ),
  clock: () => {
    for (let i = 0; i < 8; i++)
      tone(i % 2 ? 1500 : 1100, 0.04, { type: "square", gain: 0.04, delay: i * 0.14 });
  },
  campfire: () => {
    noise(1, { cutoff: 2500, gain: 0.08, highpass: true });
    [0, 4, 7, 12].forEach((s, i) =>
      tone(n(s), 0.9, { type: "triangle", gain: 0.05, delay: i * 0.04 }),
    );
  },
  high_c: () =>
    tone(n(15) * 2, 1.0, { type: "sine", gain: 0.07, attack: 0.1, slideTo: n(15) * 2.02 }),
};

/** Generic attack sounds by power: light swish, medium whoosh, heavy boom. */
export function powerSound(damage: number) {
  if (damage >= 80) {
    tone(70, 0.8, { type: "sine", gain: 0.3, slideTo: 30 });
    noise(0.7, { cutoff: 500, gain: 0.35 });
  } else if (damage >= 40) noise(0.35, { cutoff: 1600, gain: 0.2 });
  else noise(0.2, { cutoff: 3500, gain: 0.12, highpass: true });
}
