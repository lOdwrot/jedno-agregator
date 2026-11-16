/**
 * Short vibrations on phones that support them (`navigator.vibrate`). Their own persisted switch
 * (on by default, independent from the sound): "Wibracje" in the duel bar and in the settings tab.
 */
import { useSyncExternalStore } from "react";

const KEY = "jedno-walka-o-dusze:haptics";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}

let on = typeof window === "undefined" ? true : read();

export const hapticsOn = () => on;

export function setHaptics(value: boolean): void {
  on = value;
  try {
    localStorage.setItem(KEY, value ? "1" : "0");
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l());
  if (value) buzz(25); // a little "hello" so the player feels it works
}

export function useHaptics(): [boolean, (v: boolean) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    hapticsOn,
    () => true,
  );
  return [value, setHaptics];
}

/** Can this device vibrate at all? (iPhones and desktops can't.) */
export const canVibrate = () => typeof navigator !== "undefined" && "vibrate" in navigator;

export function buzz(pattern: number | number[]) {
  if (!on || !canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* not allowed (no user gesture yet) — never block the game */
  }
}

/** The duel's vibration vocabulary — one pattern per kind of move. */
export const haptic = {
  /** A card lands on the table (active slot / bench). */
  place: () => buzz(22),
  /** Item / supporter / place played from the hand. */
  play: () => buzz([14, 50, 18]),
  evolve: () => buzz([18, 40, 18, 40, 45]),
  energy: () => buzz(12),
  /** The attacker gathers strength. */
  windup: () => buzz(16),
  /** The hit lands — stronger for bigger damage. */
  hit: (amount: number) => {
    const main = Math.round(Math.min(140, 35 + amount * 0.8));
    buzz(amount >= 80 ? [main, 45, Math.round(main * 0.6)] : main);
  },
  benchHit: () => buzz(25),
  ko: () => buzz([70, 60, 110]),
};
