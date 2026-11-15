import { useEffect } from "react";

let locks = 0;

/**
 * Locks page scrolling (on `<html>`) while any component using it is mounted.
 * Reference-counted, so nested full-screen layers (a duel and the booster opened over it) can
 * unmount in any order and the page always scrolls again once the last one is gone.
 */
export function usePageScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    if (locks++ === 0) html.style.overflow = "hidden";
    return () => {
      if (--locks <= 0) {
        locks = 0;
        html.style.overflow = "";
      }
    };
  }, [active]);
}
