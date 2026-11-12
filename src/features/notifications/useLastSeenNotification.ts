import { useCallback, useSyncExternalStore } from "react";
import type { Notification } from "@/data/schemas";

export const LAST_SEEN_KEY = "jedno:lastSeenNotification";

const listeners = new Set<() => void>();

/** Reads the stored ISO timestamp of the newest seen notification (null when none / unavailable). */
export function readLastSeen(): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const v = localStorage.getItem(LAST_SEEN_KEY);
    return v && !Number.isNaN(Date.parse(v)) ? v : null;
  } catch {
    return null;
  }
}

export function writeLastSeen(iso: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LAST_SEEN_KEY, iso);
  } catch {
    /* storage unavailable (private mode) — state stays in memory only */
  }
  listeners.forEach((l) => l());
}

/** True when the notification was published after `lastSeen` (everything is new when never seen). */
export function isNewer(publishDate: string, lastSeen: string | null): boolean {
  if (!lastSeen) return true;
  return Date.parse(publishDate) > Date.parse(lastSeen);
}

export function countNew(items: readonly Notification[], lastSeen: string | null): number {
  return items.filter((n) => isNewer(n.publishDate, lastSeen)).length;
}

/** ISO timestamp of the newest notification, or null for an empty list. */
export function newestDate(items: readonly Notification[]): string | null {
  let best: string | null = null;
  for (const n of items) if (!best || Date.parse(n.publishDate) > Date.parse(best)) best = n.publishDate;
  return best;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LAST_SEEN_KEY || e.key === null) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Persistent "last seen notification" marker in localStorage (SSR-safe, synced across tabs and hook users). */
export function useLastSeenNotification() {
  const lastSeen = useSyncExternalStore(subscribe, readLastSeen, () => null);
  /** Stores `iso` only if it is newer than what is stored. */
  const markSeen = useCallback((iso: string | null) => {
    if (!iso) return;
    const cur = readLastSeen();
    if (!cur || Date.parse(iso) > Date.parse(cur)) writeLastSeen(iso);
  }, []);
  return { lastSeen, markSeen };
}
