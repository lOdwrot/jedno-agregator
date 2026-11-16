import { useEffect, useState } from "react";
import { loadPrefs, savePrefs, type AudioPrefs } from "../audio/context";
import { taleAmbience, taleMusic } from "../audio/taleAmbience";
import { soundscapeOf } from "./soundscape";
import type { SceneId } from "./stories";

/**
 * Background lullaby + the soundscape of the open page. Starts only once the reader opens the book
 * (`open`, a click — so audio is allowed); the music and effects follow the shared sound settings.
 */
export function useTaleSound(tale: string, scene: SceneId | null, open: boolean) {
  const [prefs, setPrefs] = useState<AudioPrefs>(loadPrefs);

  useEffect(() => {
    if (!open || !prefs.music) return;
    taleMusic.start();
    return () => taleMusic.stop();
  }, [open, prefs.music]);

  useEffect(() => {
    if (!open || !prefs.sfx || !scene) return;
    taleAmbience.play(soundscapeOf(scene, tale));
  }, [open, prefs.sfx, scene, tale]);

  useEffect(() => {
    if (!scene || !prefs.sfx) taleAmbience.stop();
  }, [scene, prefs.sfx]);

  useEffect(() => () => taleAmbience.stop(), []);

  const toggle = (k: keyof AudioPrefs) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    savePrefs(next);
  };
  return { prefs, toggle };
}
