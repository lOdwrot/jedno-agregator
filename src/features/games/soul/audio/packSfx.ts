/** Synthesized sounds of opening a booster: foil crinkle, the tear, the snap and the cards popping out. */
import { noise, tone } from "./context";

const C = 261.63;
const note = (semi: number) => C * 2 ** (semi / 12);

export const packSfx = {
  /** Foil being squeezed in the hands: a cloud of tiny, bright crackles. */
  crinkle: (dur = 1) => {
    const n = Math.round(dur * 22);
    for (let i = 0; i < n; i++)
      noise(0.02 + Math.random() * 0.03, {
        cutoff: 3500 + Math.random() * 4500,
        gain: 0.04 + Math.random() * 0.07,
        highpass: true,
        delay: (i / n) * dur + Math.random() * 0.03,
      });
  },
  /** The top strip tearing off: a dense, accelerating series of rips over a papery body. */
  rip: (dur = 0.5) => {
    noise(dur, { cutoff: 1400, gain: 0.12 });
    const n = 26;
    for (let i = 0; i < n; i++) {
      const p = i / n;
      noise(0.025 + Math.random() * 0.03, {
        cutoff: 2200 + p * 3500 + Math.random() * 1500,
        gain: 0.12 + Math.random() * 0.14,
        highpass: true,
        delay: dur * p ** 0.8 + Math.random() * 0.012,
      });
    }
  },
  /** The strip coming loose. */
  snap: () => {
    noise(0.09, { cutoff: 2500, gain: 0.3, highpass: true });
    tone(520, 0.12, { type: "triangle", gain: 0.06, slideTo: 260 });
  },
  /** Whoosh of air and light escaping the open pack. */
  whoosh: () => {
    noise(0.5, { cutoff: 900, gain: 0.18 });
    tone(note(12), 0.8, { type: "sine", gain: 0.04, slideTo: note(24), attack: 0.2 });
  },
  /** One card popping out — each next card a step higher. */
  pop: (i = 0) => {
    tone(220 + i * 30, 0.14, { type: "sine", gain: 0.18, slideTo: 760 + i * 90 });
    noise(0.1, { cutoff: 3800, gain: 0.1, highpass: true, delay: 0.02 });
    tone(note(19 + [0, 2, 4, 7, 9, 12][i % 6]!), 0.35, {
      type: "triangle",
      gain: 0.045,
      delay: 0.05,
    });
  },
  /** Empty pack falling away. */
  drop: () => {
    noise(0.25, { cutoff: 500, gain: 0.15 });
    tone(130, 0.3, { type: "sine", gain: 0.08, slideTo: 60 });
  },
};
