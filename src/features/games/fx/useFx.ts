import { useCallback, useState } from "react";

export type FxKind = "stars" | "burst" | "dust" | "splash" | "text" | "sparkle";

export interface Fx {
  id: number;
  kind: FxKind;
  x: number;
  y: number;
  /** Game time when it was spawned. */
  at: number;
  /** Lifetime in seconds. */
  life: number;
  /** Size multiplier. */
  scale: number;
  /** Label for `text` effects. */
  text?: string;
  /** Token colour utility for fills/strokes, e.g. "fill-logo-yellow". */
  tone?: string;
}

const LIFE: Record<FxKind, number> = {
  stars: 0.9,
  burst: 0.45,
  dust: 1.1,
  splash: 0.8,
  text: 1.1,
  sparkle: 0.8,
};

let nextId = 1;

/**
 * Short-lived particle effects living in the game's SVG world. Spawn them from game events,
 * render with <Particles items={fx.items} time={state.time} />. Expired ones are dropped on the next spawn.
 */
export function useFx() {
  const [items, setItems] = useState<Fx[]>([]);
  const spawn = useCallback(
    (kind: FxKind, x: number, y: number, at: number, opts: Partial<Fx> = {}) => {
      const fx: Fx = { id: nextId++, kind, x, y, at, life: LIFE[kind], scale: 1, ...opts };
      setItems((prev) => [...prev.filter((p) => at - p.at < p.life), fx]);
    },
    [],
  );
  const clear = useCallback(() => setItems([]), []);
  return { items, spawn, clear };
}
