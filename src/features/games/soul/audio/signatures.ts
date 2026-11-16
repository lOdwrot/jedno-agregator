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
  pardon: () => {
    bell(12);
    bell(7, 0.35, 0.05);
    choir([0, 4, 7], 0.6, 2.2);
  },
  council: () => {
    gong();
    choir([-12, -5, 0, 4, 7], 0.3, 2.4);
    [0.9, 1.15, 1.4].forEach((d) => bell(12, d, 0.04));
  },
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
  abbey: () => {
    // pedal + full registers, then the abbey bells answer
    [-24, -12, 0, 4, 7, 12, 16].forEach((x) => {
      tone(n(x), 2.2, { type: "sawtooth", gain: 0.016, attack: 0.12 });
      tone(n(x) * 2, 2.2, { type: "square", gain: 0.006, attack: 0.12 });
    });
    [12, 7, 4, 0].forEach((x, i) => bell(x, 1 + i * 0.25, 0.045));
  },
  bonfire: () => {
    noise(1.6, { cutoff: 3000, gain: 0.1, highpass: true });
    for (let i = 0; i < 8; i++)
      noise(0.05, { cutoff: 5000, gain: 0.12, highpass: true, delay: 0.1 + i * 0.17 });
    [0, 4, 7, 4, 7, 12].forEach((x, i) =>
      tone(n(x), 0.4, { type: "triangle", gain: 0.06, delay: 0.3 + i * 0.2, attack: 0.03 }),
    );
    drum(1.5, 0.35);
  },
  campfire: () => {
    noise(1, { cutoff: 2500, gain: 0.08, highpass: true });
    [0, 4, 7, 12].forEach((s, i) =>
      tone(n(s), 0.9, { type: "triangle", gain: 0.05, delay: i * 0.04 }),
    );
  },
  fall: () => {
    tone(1400, 1.4, { type: "sawtooth", gain: 0.05, slideTo: 60, cutoff: 2000 });
    gong(1.1);
    choir([-12, -9, -5, 0], 1.1, 2.2);
  },
  inferno: () => {
    noise(1.4, { cutoff: 600, gain: 0.35 });
    [0, 0.3, 0.6].forEach((d) => drum(d, 0.4));
    tone(90, 1.2, { type: "sawtooth", gain: 0.06, slideTo: 40, cutoff: 700 });
  },
  void: () => {
    [-24, -23, -17].forEach((s) =>
      tone(n(s), 2.2, { type: "sine", gain: 0.12, attack: 0.6, slideTo: n(s) * 0.94 }),
    );
    noise(1.8, { cutoff: 250, gain: 0.15 });
  },
  beast: () => {
    noise(1.2, { cutoff: 500, gain: 0.3 });
    [-24, -18, -13].forEach((s, i) =>
      tone(n(s), 1.8, {
        type: "sawtooth",
        gain: 0.06,
        delay: i * 0.2,
        slideTo: n(s) * 0.9,
        cutoff: 800,
      }),
    );
    gong(0.8);
  },
  skyfire: () => {
    for (let i = 0; i < 5; i++)
      tone(1600 - i * 120, 0.6, {
        type: "sawtooth",
        gain: 0.03,
        delay: i * 0.12,
        slideTo: 90,
        cutoff: 1800,
      });
    noise(1.3, { cutoff: 900, gain: 0.3, delay: 0.5 });
  },
  stampede: () => {
    for (let i = 0; i < 10; i++) drum(i * 0.09, 0.22);
    tone(n(-12), 0.6, { type: "square", gain: 0.03, delay: 0.95, slideTo: n(-30), cutoff: 1200 });
  },
  warhorse: () => {
    [0, 0.14, 0.28, 0.42, 0.56, 0.7].forEach((d) => drum(d, 0.2));
    tone(n(-5), 0.5, { type: "sawtooth", gain: 0.05, delay: 0.1, slideTo: n(7), cutoff: 1600 });
    noise(0.4, { cutoff: 5000, gain: 0.12, delay: 0.85, highpass: true });
  },
  /** A boastful horn swelling upward, then a crown-like clang. */
  boast: () => {
    tone(n(-12), 0.9, { type: "sawtooth", gain: 0.05, slideTo: n(0), cutoff: 1400, attack: 0.1 });
    tone(n(-5), 0.9, { type: "sawtooth", gain: 0.035, delay: 0.1, slideTo: n(7), cutoff: 1400 });
    noise(0.3, { cutoff: 6000, gain: 0.1, delay: 0.9, highpass: true });
    tone(60, 0.6, { type: "sine", gain: 0.25, delay: 0.95, slideTo: 32 });
  },
  /** Rattling chain links tightening into a heavy clank. */
  chains: () => {
    for (let i = 0; i < 6; i++)
      noise(0.07, { cutoff: 7000, gain: 0.1, delay: i * (0.16 - i * 0.015), highpass: true });
    tone(n(-19), 0.5, { type: "square", gain: 0.03, delay: 0.75, slideTo: n(-24), cutoff: 900 });
    drum(0.8, 0.28);
  },
  /** Bobbing "meh": a lazy two-note slide down. */
  shrug: () => {
    tone(n(7), 0.25, { type: "triangle", gain: 0.06, slideTo: n(9) });
    tone(n(4), 0.5, { type: "triangle", gain: 0.06, delay: 0.25, slideTo: n(-3) });
    noise(0.5, { cutoff: 700, gain: 0.12, delay: 0.5 });
  },
  /** A slow lullaby that sinks into a deep thud. */
  lullaby: () => {
    [12, 7, 9, 4].forEach((s, i) => bell(s, i * 0.28, 0.045));
    tone(70, 1.2, { type: "sine", gain: 0.28, delay: 1.15, slideTo: 32 });
  },
  /** A long yawn (falling filtered saw) and a soft cushion boom. */
  yawn: () => {
    tone(n(5), 1.1, { type: "sawtooth", gain: 0.04, slideTo: n(-14), cutoff: 900, attack: 0.2 });
    noise(0.8, { cutoff: 400, gain: 0.3, delay: 1.0 });
    tone(60, 0.9, { type: "sine", gain: 0.25, delay: 1.0, slideTo: 30 });
  },
  /** Bubbling spring water under a calm major chord (Bernadetta). */
  spring: () => {
    for (let i = 0; i < 9; i++)
      tone(n(12 + ((i * 5) % 12)), 0.12, {
        type: "sine",
        gain: 0.05,
        delay: i * 0.07,
        slideTo: n(19),
      });
    noise(1.0, { cutoff: 2400, gain: 0.08, delay: 0.1 });
    choir([0, 4, 7, 12], 0.5, 1.6);
  },
  /** A wolf's howl that softens into a lullaby (Franciszek). */
  howl: () => {
    tone(n(0), 1.2, { type: "triangle", gain: 0.05, slideTo: n(7), attack: 0.3 });
    tone(n(7), 0.8, { type: "triangle", gain: 0.04, delay: 1.1, slideTo: n(2) });
    [12, 9, 7].forEach((s, i) => bell(s, 1.4 + i * 0.25, 0.04));
  },
  /** Heavy ploughing steps and an angelic chord (Izydor). */
  plough: () => {
    [0, 0.35, 0.7].forEach((d) => drum(d, 0.22));
    choir([0, 7, 12, 16], 0.9, 1.6);
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
