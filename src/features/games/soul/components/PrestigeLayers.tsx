import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { Finish } from "../data/types";

/** Fixed sparkle positions (x %, delay s, duration s, colour index) — no randomness in render. */
const SPARKS: [number, number, number, number][] = [
  [8, 0, 2.2, 0],
  [22, 0.9, 2.6, 1],
  [35, 0.3, 2.1, 2],
  [48, 1.4, 2.8, 3],
  [61, 0.6, 2.3, 4],
  [74, 1.8, 2.5, 0],
  [88, 0.2, 2.4, 2],
  [15, 1.2, 2.9, 3],
  [55, 2.1, 2.2, 1],
  [80, 1, 2.7, 4],
  [30, 2.4, 2.5, 2],
  [67, 0.4, 3, 0],
];

/**
 * Decorative layers of gilded / stained prints inside a card's <article> (which must be `isolate`):
 * a drifting foil background behind the content; for stained prints also lead lines, a glass
 * reflection on top and sparkles while the card is active, hovered or focused (see index.css).
 */
export function PrestigeLayers({ finish, dark = false }: { finish: Finish; dark?: boolean }) {
  if (finish === "plain") return null;
  return (
    <>
      <span
        aria-hidden="true"
        className={cn("soul-foil", `soul-foil--${finish}`, dark && "soul-foil--dark")}
      />
      {finish === "stained" && (
        <>
          <span aria-hidden="true" className="soul-glass" />
          <span aria-hidden="true" className="soul-sparkles">
            {SPARKS.map(([x, d, t, c], i) => (
              <span
                key={i}
                className={`soul-spark soul-spark--${c}`}
                style={{ "--x": `${x}%`, "--d": `${d}s`, "--t": `${t}s` } as CSSProperties}
              />
            ))}
          </span>
        </>
      )}
    </>
  );
}
