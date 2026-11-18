/** Drives the `forge` generator: progress at most every ~100 ms, a time limit for slow phones. */
import type { DeckList } from "../engine/state";
import { DEFAULT_BUDGET, forge, type ForgeProgress, type ForgeResult } from "./forge";

export type ForgeMessage =
  { type: "progress"; progress: ForgeProgress } | { type: "done"; result: ForgeResult };

/** The climb stops after this many seconds (the verification still runs). */
export const CLIMB_SECONDS = 14;
const PROGRESS_MS = 100;

const now = () => performance.now();

function start(deck: DeckList, seed: number) {
  const t0 = now();
  return forge(deck, seed, { ...DEFAULT_BUDGET, stop: () => now() - t0 > CLIMB_SECONDS * 1000 });
}

/** In one go (Web Worker). */
export function runForge(deck: DeckList, seed: number, post: (m: ForgeMessage) => void) {
  const it = start(deck, seed);
  let last = 0;
  for (let r = it.next(); ; r = it.next()) {
    if (r.done) return post({ type: "done", result: r.value });
    if (now() - last > PROGRESS_MS) {
      last = now();
      post({ type: "progress", progress: r.value });
    }
  }
}

/** In slices of ~12 ms on the main thread (no Worker available). Returns a cancel function. */
export function runForgeSliced(deck: DeckList, seed: number, post: (m: ForgeMessage) => void) {
  const it = start(deck, seed);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const slice = () => {
    const end = now() + 12;
    let r = it.next();
    while (!r.done && now() < end) r = it.next();
    if (r.done) return post({ type: "done", result: r.value });
    post({ type: "progress", progress: r.value });
    timer = setTimeout(slice, 0);
  };
  timer = setTimeout(slice, 0);
  return () => clearTimeout(timer);
}
