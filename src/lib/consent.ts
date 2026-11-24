import { useSyncExternalStore } from "react";

/**
 * Consent for the persistent statistics id. Without it Umami still counts visits anonymously
 * (cookieless hash, no consent needed); with it the browser keeps a random id so returning
 * visitors are recognised across days, networks and months. The choice itself is stored
 * (strictly necessary, so the banner is not shown again); withdrawing deletes the id.
 */
export type Consent = "granted" | "denied" | null;

const CONSENT_KEY = "jedno-stats-consent";
const ID_KEY = "jedno-visitor-id";
const listeners = new Set<() => void>();

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

let consent: Consent = typeof window === "undefined" ? null : readConsent();

export const getConsent = () => consent;

export function setConsent(value: "granted" | "denied"): void {
  consent = value;
  try {
    localStorage.setItem(CONSENT_KEY, value);
    if (value === "denied") localStorage.removeItem(ID_KEY);
  } catch {
    /* private mode: the choice lasts for this page only */
  }
  listeners.forEach((l) => l());
}

/** Forgets the choice so the banner shows again ("Ustawienia statystyk" in the footer). */
export function resetConsent(): void {
  consent = null;
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function subscribeConsent(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useConsent(): Consent {
  return useSyncExternalStore(subscribeConsent, getConsent, () => null);
}

/** The stored random id, or null when there is none yet. */
export function readVisitorId(): string | null {
  try {
    return localStorage.getItem(ID_KEY);
  } catch {
    return null;
  }
}

/** Returns the id, creating it on first use; `created` is true only that first time. */
export function ensureVisitorId(): { id: string; created: boolean } | null {
  const existing = readVisitorId();
  if (existing) return { id: existing, created: false };
  const id = crypto.randomUUID().replace(/-/g, "");
  try {
    localStorage.setItem(ID_KEY, id);
  } catch {
    return null; // can't persist → no point in an id
  }
  return { id, created: true };
}
