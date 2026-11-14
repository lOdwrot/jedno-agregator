export type IntroPhase = "charge" | "tear" | "burst";

/** Timeline (ms) of the booster intro; the reveal starts when `burst` ends. */
export const INTRO_MS: Record<IntroPhase, number> = { charge: 1100, tear: 650, burst: 1650 };
