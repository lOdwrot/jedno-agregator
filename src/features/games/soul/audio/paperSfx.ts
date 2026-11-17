/** Paper sounds of the saints' tales book: a page turn and a parchment swish. */
import { noise } from "./context";

export const paperSfx = {
  /** Lift (dry rustle), swing (airy swish) and the soft flap of the page landing. */
  turn() {
    noise(0.12, { highpass: true, cutoff: 2600, gain: 0.07 });
    noise(0.35, { highpass: true, cutoff: 1400, gain: 0.09, delay: 0.08 });
    noise(0.16, { cutoff: 700, gain: 0.16, delay: 0.62 });
  },
  /** A sheet of parchment sliding in. */
  swish() {
    noise(0.4, { highpass: true, cutoff: 1800, gain: 0.07 });
    noise(0.12, { cutoff: 900, gain: 0.1, delay: 0.32 });
  },
};
