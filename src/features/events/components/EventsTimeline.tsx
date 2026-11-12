import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import type { Event } from "@/data/schemas";
import { formatEventDayHeader, groupByDay } from "@/lib/dates";
import { Reveal, usePrefersReducedMotion } from "@/ui";
import { EventCard } from "./EventCard";

/** Day-grouped timeline with sticky day headers and a rail that draws as you scroll. */
export function EventsTimeline({ events, now }: { events: Event[]; now: Date }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const groups = groupByDay(events, (e) => e.start);

  return (
    <div ref={ref} className="relative pl-9 [--rail:0.8rem] md:pl-12 md:[--rail:1.1rem]">
      <span aria-hidden className="absolute bottom-0 left-[var(--rail)] top-0 w-0.5 -translate-x-1/2 rounded-full bg-pill" />
      <motion.span
        aria-hidden
        className="absolute bottom-0 left-[var(--rail)] top-0 w-0.5 origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-accent to-logo-blue"
        style={{ scaleY: reduce ? 1 : scaleY }}
      />
      <div className="flex flex-col gap-8">
        {groups.map((g) => {
          const headingId = `day-${g.key}`;
          return (
            <section key={g.key} aria-labelledby={headingId}>
              <h2
                id={headingId}
                className="sticky top-16 z-10 mb-3 bg-canvas/90 py-2 font-display text-lg font-extrabold text-navy backdrop-blur md:top-20 md:text-xl"
              >
                <span
                  aria-hidden
                  className="absolute left-[calc(var(--rail)-2.25rem)] top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-canvas md:left-[calc(var(--rail)-3rem)]"
                />
                {formatEventDayHeader(g.date, now)}
              </h2>
              <ul className="grid gap-4 xl:grid-cols-2">
                {g.items.map((e, i) => (
                  <Reveal as="li" key={e.id} delay={Math.min(i, 3) * 0.08}>
                    <EventCard event={e} now={now} />
                  </Reveal>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
