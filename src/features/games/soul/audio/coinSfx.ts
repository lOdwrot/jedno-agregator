/** Sounds of the coin toss: a thumb flick with a ringing whirr, then metallic clinks on landing. */
import { noise, tone } from "./context";

/** Flick + the shimmer of a spinning coin. */
export function coinToss() {
  noise(0.05, { cutoff: 6000, gain: 0.18, highpass: true });
  tone(2637, 0.35, { type: "sine", gain: 0.05, slideTo: 3520 });
  tone(3951, 0.25, { type: "sine", gain: 0.025, delay: 0.02 });
  for (let i = 0; i < 9; i++)
    tone(3136 + (i % 2) * 520, 0.05, {
      type: "triangle",
      gain: 0.03 * (1 - i / 11),
      delay: 0.1 + i * 0.12,
      cutoff: 6000,
    });
}

/** Landing: a thud, two clinks (bounce) and a short bright chime for heads. */
export function coinLand(heads: boolean) {
  noise(0.08, { cutoff: 900, gain: 0.25 });
  for (const [delay, gain] of [
    [0, 0.08],
    [0.16, 0.045],
    [0.27, 0.02],
  ] as const) {
    tone(4186, 0.35, { type: "sine", gain, delay });
    tone(5274, 0.25, { type: "sine", gain: gain * 0.6, delay: delay + 0.005 });
  }
  (heads ? [12, 16, 19, 24] : [12, 19]).forEach((s, i) =>
    tone(523.25 * 2 ** ((s - 12) / 12), 0.6, { type: "sine", gain: 0.05, delay: 0.42 + i * 0.07 }),
  );
}
