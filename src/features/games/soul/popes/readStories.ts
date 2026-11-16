import { useSyncExternalStore } from "react";

/** Pope stories the player has opened on this device ("Poznane historie: n / 11"). */
const KEY = "jedno-walka-o-dusze:popes-read";
const listeners = new Set<() => void>();
let cache: readonly string[] | null = null;

function read(): readonly string[] {
  if (cache) return cache;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown;
    cache = Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

export function markRead(id: string): void {
  const cur = read();
  if (cur.includes(id)) return;
  cache = [...cur, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l());
}

const EMPTY: readonly string[] = [];

export function useReadStories(): readonly string[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}
