/** Short vibrations on phones that support them; off together with the sound effects. */
import { isMuted } from "../../audio/mute";

export function buzz(pattern: number | number[]) {
  if (isMuted() || typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* not allowed (no user gesture yet) — never block the game */
  }
}
