/**
 * "Ilustracje kart" switch in the hub's settings (on by default, remembered on this device): when off, the
 * cards drawn for the game (`DRAWN_ART`) show their emoji again, like before. Commons pictures always stay.
 */
import { useSyncExternalStore } from "react";

const KEY = "jedno-walka-o-dusze:card-art";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}

let on = typeof window === "undefined" ? true : read();

export const cardArtOn = () => on;

export function setCardArt(value: boolean): void {
  on = value;
  try {
    localStorage.setItem(KEY, value ? "1" : "0");
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l());
}

export function useCardArt(): [boolean, (v: boolean) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    cardArtOn,
    () => true,
  );
  return [value, setCardArt];
}
