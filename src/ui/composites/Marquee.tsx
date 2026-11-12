import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icons";
import { usePrefersReducedMotion } from "../effects/useMediaQuery";

export interface MarqueeProps {
  children: ReactNode;
  /** Seconds per full loop, default 40. */
  duration?: number;
  /** Accessible name of the region. */
  label: string;
  className?: string;
}

/** Infinite horizontal loop; pauses on hover/focus and via a pause button; static (wrapping) under reduced motion. */
export function Marquee({ children, duration = 40, label, className }: MarqueeProps) {
  const reduce = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);

  if (reduce) {
    return (
      <div role="region" aria-label={label} className={cn("flex flex-wrap gap-3", className)}>
        {children}
      </div>
    );
  }
  const track = "flex shrink-0 items-center gap-3 pr-3";
  return (
    <div role="region" aria-label={label} className={cn("group/marquee relative", className)}>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div
          className="flex w-max animate-[ui-marquee_linear_infinite] focus-within:[animation-play-state:paused] hover:[animation-play-state:paused]"
          style={{
            animationDuration: `${duration}s`,
            animationPlayState: paused ? "paused" : undefined,
          }}
        >
          <div className={track}>{children}</div>
          <div className={track} aria-hidden="true" inert>
            {children}
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
        className="mx-auto mt-2 flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-sm font-semibold text-ink-muted hover:text-navy"
      >
        {paused ? (
          <Icon name="play" size={16} />
        ) : (
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
            <rect x="3" y="2" width="3.5" height="12" rx="1" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
          </svg>
        )}
        {paused ? "Wznów przewijanie" : "Zatrzymaj przewijanie"}
      </button>
    </div>
  );
}
