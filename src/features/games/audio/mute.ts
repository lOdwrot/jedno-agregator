import { useSyncExternalStore } from "react";

/** Global, persisted mute switch shared by all games. */
const KEY = "jedno-games-muted";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

let muted = typeof window === "undefined" ? false : read();

export const isMuted = () => muted;

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(KEY, value ? "1" : "0");
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l());
}

export function useMuted(): [boolean, (v: boolean) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    isMuted,
    () => false,
  );
  return [value, setMuted];
}
