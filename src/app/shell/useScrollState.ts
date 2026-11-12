import { useEffect, useState } from "react";

export interface ScrollState {
  /** Page scrolled past the top (header gets blur + shadow). */
  scrolled: boolean;
  /** Scrolled well down — header compacts. */
  compact: boolean;
}

/** Tracks window scroll with a passive, rAF-throttled listener. */
export function useScrollState(threshold = 8, compactAt = 120): ScrollState {
  const [state, setState] = useState<ScrollState>({ scrolled: false, compact: false });
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = window.scrollY;
      const next = { scrolled: y > threshold, compact: y > compactAt };
      setState((prev) =>
        prev.scrolled === next.scrolled && prev.compact === next.compact ? prev : next,
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold, compactAt]);
  return state;
}
