import { useCallback, useState } from "react";
import { newProfile, type Profile } from "./profile";

const KEY = "jedno-walka-o-dusze:v1";

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    const p = raw ? (JSON.parse(raw) as Profile) : null;
    if (p && p.version === 1 && Array.isArray(p.deck)) return p;
  } catch {
    /* corrupted or blocked storage — start fresh */
  }
  return newProfile();
}

/** Profile kept in localStorage (collection, deck, talents). */
export function useProfile() {
  const [profile, setProfile] = useState<Profile>(load);
  const update = useCallback((fn: (p: Profile) => Profile) => {
    setProfile((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private mode — keep in memory only */
      }
      return next;
    });
  }, []);
  return { profile, update };
}
