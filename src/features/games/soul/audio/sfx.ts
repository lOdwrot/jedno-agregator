/** Synthesized sound effects for every move of the duel (no audio files). */
import { noise, tone } from "./context";

const C = 261.63;
const note = (semi: number) => C * 2 ** (semi / 12);

export const sfx = {
  click: () => tone(880, 0.06, { type: "square", gain: 0.03, cutoff: 2500 }),
  draw: () => noise(0.14, { cutoff: 5000, gain: 0.12, highpass: true }),
  deal: (i = 0) => noise(0.12, { cutoff: 4500, gain: 0.1, highpass: true, delay: i * 0.07 }),
  shuffle: () => {
    for (let i = 0; i < 6; i++)
      noise(0.07, { cutoff: 3500, gain: 0.08, highpass: true, delay: i * 0.05 });
  },
  place: () => {
    noise(0.12, { cutoff: 600, gain: 0.35 });
    tone(110, 0.18, { type: "sine", gain: 0.2, slideTo: 70 });
  },
  energy: (demon = false) =>
    (demon ? [0, 3, 6] : [12, 16, 19, 24]).forEach((s, i) =>
      tone(note(s), 0.35, {
        type: demon ? "sawtooth" : "sine",
        gain: 0.07,
        delay: i * 0.05,
        cutoff: demon ? 900 : 5000,
      }),
    ),
  evolve: () => {
    tone(note(0), 0.9, { type: "sawtooth", gain: 0.06, slideTo: note(24), cutoff: 2500 });
    [12, 16, 19, 24].forEach((s, i) =>
      tone(note(s), 0.6, { type: "sine", gain: 0.06, delay: 0.5 + i * 0.06 }),
    );
  },
  support: () => {
    noise(0.25, { cutoff: 2500, gain: 0.12, highpass: true });
    tone(note(19), 0.5, { type: "sine", gain: 0.06, delay: 0.1 });
    tone(note(24), 0.5, { type: "sine", gain: 0.05, delay: 0.18 });
  },
  place_card: () =>
    [0, 7, 12, 16].forEach((s, i) =>
      tone(note(s), 1.2, { type: "triangle", gain: 0.06, delay: i * 0.08 }),
    ),
  windup: () => noise(0.3, { cutoff: 1800, gain: 0.18 }),
  hit: (amount: number) => {
    const big = Math.min(1, amount / 100);
    noise(0.25 + big * 0.2, { cutoff: 900 + big * 600, gain: 0.35 + big * 0.25 });
    tone(140 - big * 60, 0.35, { type: "sine", gain: 0.3, slideTo: 40 });
  },
  weak: () =>
    [0, 4, 7].forEach((s, i) =>
      tone(note(s + 12), 0.15, { type: "square", gain: 0.04, delay: i * 0.05 }),
    ),
  heal: () =>
    [12, 16, 19, 24, 28].forEach((s, i) =>
      tone(note(s), 0.4, { type: "sine", gain: 0.05, delay: i * 0.06 }),
    ),
  status: () =>
    tone(note(6), 0.5, { type: "sawtooth", gain: 0.05, slideTo: note(-6), cutoff: 1200 }),
  cleanse: () => tone(note(12), 0.4, { type: "sine", gain: 0.06, slideTo: note(24) }),
  shield: () => tone(note(7), 0.6, { type: "triangle", gain: 0.07, slideTo: note(19) }),
  coin: () =>
    [0, 1, 2, 3].forEach((i) =>
      tone(2000 + i * 300, 0.06, { type: "square", gain: 0.03, delay: i * 0.09 }),
    ),
  ko: () => {
    tone(note(0), 0.9, { type: "sawtooth", gain: 0.09, slideTo: note(-24), cutoff: 1500 });
    noise(0.6, { cutoff: 400, gain: 0.3, delay: 0.1 });
  },
  soul: () =>
    [24, 28, 31, 36].forEach((s, i) =>
      tone(note(s), 1.1, { type: "sine", gain: 0.06, delay: i * 0.09 }),
    ),
  turn: (mine: boolean) =>
    (mine ? [7, 12] : [1, 0]).forEach((s, i) =>
      tone(note(s), 0.5, { type: "triangle", gain: 0.07, delay: i * 0.12 }),
    ),
  swap: () => noise(0.25, { cutoff: 2000, gain: 0.15 }),
  win: () =>
    [0, 4, 7, 12, 16, 19, 24].forEach((s, i) =>
      tone(note(s), 0.9, { type: "triangle", gain: 0.07, delay: i * 0.1 }),
    ),
  lose: () =>
    [7, 6, 5, 0].forEach((s, i) =>
      tone(note(s - 12), 0.7, { type: "sawtooth", gain: 0.06, delay: i * 0.25, cutoff: 900 }),
    ),
};
