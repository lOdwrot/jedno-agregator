export type IntroPhase = "charge" | "tear" | "burst";

/**
 * Timeline (ms) of the booster intro; `charge` has no timer — it lasts until the player cuts the
 * pack open with a swipe. The reveal starts when `burst` ends.
 */
export const INTRO_MS: Record<Exclude<IntroPhase, "charge">, number> = { tear: 650, burst: 1650 };
