import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icons";
import { IconButton } from "../primitives/IconButton";
import { usePrefersReducedMotion } from "../effects/useMediaQuery";

export interface CarouselProps {
  children: ReactNode;
  /** Accessible name, e.g. "Najbliższe wydarzenia". */
  label: string;
  /** Tailwind width classes for each slide, default "w-[80%] sm:w-[45%] lg:w-[30%]". */
  slideClassName?: string;
  className?: string;
}

/** Horizontal scroll-snap carousel with prev/next buttons, edge fades and keyboard support. */
export function Carousel({ children, label, slideClassName = "w-[80%] sm:w-[45%] lg:w-[30%]", className }: CarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const reduce = usePrefersReducedMotion();
  const id = useId();

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  };

  const items = Children.toArray(children);
  const mask =
    atStart && atEnd
      ? undefined
      : `linear-gradient(to right, ${atStart ? "#000" : "transparent"}, #000 48px, #000 calc(100% - 48px), ${atEnd ? "#000" : "transparent"})`;
  return (
    <div className={cn("relative", className)} role="region" aria-roledescription="karuzela" aria-label={label}>
      {/* Scrollable region must be focusable so keyboard users can scroll it. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={track}
        id={id}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        onScroll={update}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") scrollBy(1);
          if (e.key === "ArrowLeft") scrollBy(-1);
        }}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto",
        )}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {items.map((child, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slajd"
            aria-label={`${i + 1} z ${items.length}`}
            className={cn("shrink-0 snap-start", slideClassName)}
          >
            {child}
          </div>
        ))}
      </div>
      <div className="mt-1 hidden items-center justify-end gap-2 md:flex">
        <IconButton label="Poprzednie" variant="soft" disabled={atStart} aria-controls={id} onClick={() => scrollBy(-1)}>
          <Icon name="chevronLeft" />
        </IconButton>
        <IconButton label="Następne" variant="soft" disabled={atEnd} aria-controls={id} onClick={() => scrollBy(1)}>
          <Icon name="chevronRight" />
        </IconButton>
      </div>
    </div>
  );
}
