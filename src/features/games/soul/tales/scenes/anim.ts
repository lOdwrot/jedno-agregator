import type { CSSProperties } from "react";

/** Inline animation: `anim("tale-bob 2s ease-in-out infinite", 0.4)`. */
export const anim = (animation: string, delay = 0, extra: CSSProperties = {}): CSSProperties => ({
  animation: `${animation} ${delay}s`,
  ...extra,
});
