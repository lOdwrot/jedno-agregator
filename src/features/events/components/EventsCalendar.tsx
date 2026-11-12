import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Event } from "@/data/schemas";
import { cn } from "@/lib/cn";
import { dayKey, formatEventDayHeader } from "@/lib/dates";
import { Button, Icon, IconButton, Reveal } from "@/ui";
import { EventCard } from "./EventCard";
import {
  MONTHS,
  WEEKDAYS_LONG,
  WEEKDAYS_SHORT,
  buildMonthMatrix,
  dayAriaLabel,
  eventsCountLabel,
  indexEventsByDay,
  parseKey,
  shiftDayKey,
  shiftMonth,
} from "../utils";

const DOT_COLORS = ["bg-logo-orange", "bg-logo-blue", "bg-logo-yellow", "bg-logo-red"] as const;

interface Props {
  events: Event[];
  /** Ordered list of all tags, used for stable dot colours. */
  tags: string[];
  now: Date;
}

/** Month grid (role=grid, roving tabindex, arrow keys) + the selected day's events. */
export function EventsCalendar({ events, tags, now }: Props) {
  const byDay = useMemo(() => indexEventsByDay(events), [events]);
  const todayKey = dayKey(now);
  const firstKey = events[0] ? dayKey(events[0].start) : todayKey;
  const [{ year, month }, setView] = useState(() => {
    const { year, month } = parseKey(firstKey);
    return { year, month };
  });
  const [selected, setSelected] = useState<string | null>(events[0] ? firstKey : null);
  const [focusKey, setFocusKey] = useState<string>(firstKey);
  const gridRef = useRef<HTMLTableElement>(null);
  const moved = useRef(false);

  const weeks = useMemo(() => buildMonthMatrix(year, month), [year, month]);

  // Keep the focus target inside the visible month.
  const inView = weeks.flat().some((c) => c.key === focusKey && c.inMonth);
  const tabKey = inView ? focusKey : toKeyOfFirst(year, month);

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-key="${focusKey}"]`)?.focus();
  }, [focusKey, year, month]);

  const goTo = (key: string) => {
    const p = parseKey(key);
    moved.current = true;
    setFocusKey(key);
    if (p.year !== year || p.month !== month) setView({ year: p.year, month: p.month });
  };

  const changeMonth = (delta: number) => {
    const next = shiftMonth(year, month, delta);
    setView(next);
    setFocusKey(toKeyOfFirst(next.year, next.month));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, key: string) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in step) {
      e.preventDefault();
      goTo(shiftDayKey(key, step[e.key]!));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const dow = (new Date(Date.UTC(...ymd(key))).getUTCDay() + 6) % 7;
      goTo(shiftDayKey(key, e.key === "Home" ? -dow : 6 - dow));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const delta = e.key === "PageUp" ? -1 : 1;
      const p = parseKey(key);
      const t = shiftMonth(p.year, p.month, delta);
      const max = new Date(Date.UTC(t.year, t.month + 1, 0)).getUTCDate();
      goTo(`${t.year}-${String(t.month + 1).padStart(2, "0")}-${String(Math.min(p.day, max)).padStart(2, "0")}`);
    }
  };

  const selectedEvents = selected ? (byDay.get(selected) ?? []) : [];
  const headingId = "calendar-heading";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,32rem)_1fr]">
      <div className="rounded-card bg-surface p-3 shadow-card sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <IconButton label="Poprzedni miesiąc" variant="ghost" onClick={() => changeMonth(-1)}>
            <Icon name="chevronLeft" />
          </IconButton>
          <div className="flex items-center gap-3">
            <h2 id={headingId} aria-live="polite" className="font-display text-xl font-extrabold capitalize text-navy sm:text-2xl">
              {MONTHS[month]} {year}
            </h2>
            <Button
              size="sm"
              variant="soft"
              onClick={() => {
                const p = parseKey(todayKey);
                setView({ year: p.year, month: p.month });
                setFocusKey(todayKey);
                setSelected(todayKey);
              }}
            >
              Dziś
            </Button>
          </div>
          <IconButton label="Następny miesiąc" variant="ghost" onClick={() => changeMonth(1)}>
            <Icon name="chevronRight" />
          </IconButton>
        </div>
        <table ref={gridRef} role="grid" aria-labelledby={headingId} className="w-full table-fixed border-separate border-spacing-0.5 sm:border-spacing-1">
          <thead>
            <tr role="row">
              {WEEKDAYS_SHORT.map((d, i) => (
                <th key={d} role="columnheader" scope="col" abbr={WEEKDAYS_LONG[i]} className="pb-1 text-xs font-bold uppercase tracking-wide text-ink-muted">
                  <span aria-hidden>{d}</span>
                  <span className="sr-only">{WEEKDAYS_LONG[i]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0]!.key} role="row">
                {week.map((c) => {
                  const list = byDay.get(c.key) ?? [];
                  const isSel = selected === c.key;
                  const isToday = c.key === todayKey;
                  return (
                    <td key={c.key} role="gridcell" aria-selected={isSel} className="p-0">
                      <button
                        type="button"
                        data-key={c.key}
                        tabIndex={c.key === tabKey ? 0 : -1}
                        aria-label={dayAriaLabel(c.key, list.length) + (isToday ? ", dzisiaj" : "")}
                        onClick={() => {
                          setSelected(c.key);
                          setFocusKey(c.key);
                          if (!c.inMonth) goTo(c.key);
                        }}
                        onKeyDown={(e) => onKeyDown(e, c.key)}
                        className={cn(
                          "relative flex h-12 w-full flex-col sm:h-14 items-center justify-center gap-0.5 rounded-xl text-sm font-semibold transition-colors sm:text-base",
                          c.inMonth ? "text-ink" : "text-ink-muted/70",
                          list.length > 0 && "font-extrabold",
                          isSel ? "bg-navy text-white" : "hover:bg-surface-muted",
                          isToday && !isSel && "ring-2 ring-accent-ink",
                        )}
                      >
                        <span aria-hidden>{c.day}</span>
                        <span aria-hidden className="flex h-1.5 gap-0.5">
                          {list.slice(0, 3).map((e) => (
                            <span
                              key={e.id}
                              className={cn("size-1.5 rounded-full", DOT_COLORS[Math.max(0, tags.indexOf(e.tag ?? "")) % DOT_COLORS.length])}
                            />
                          ))}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-ink-muted">Strzałki przesuwają dzień, PageUp/PageDown zmieniają miesiąc.</p>
      </div>

      <section aria-live="polite" aria-labelledby="selected-day-heading">
        <h3 id="selected-day-heading" className="mb-3 font-display text-lg font-extrabold text-navy">
          {selected ? `${formatEventDayHeader(selected + "T12:00:00+01:00", now)} · ${eventsCountLabel(selectedEvents.length)}` : "Wybierz dzień"}
        </h3>
        {selected && selectedEvents.length === 0 && <p className="rounded-card bg-surface p-5 text-ink-muted shadow-card">Brak wydarzeń w tym dniu.</p>}
        <ul className="grid gap-4 md:grid-cols-2">
          {selectedEvents.map((e) => (
            <Reveal as="li" key={`${selected}-${e.id}`}>
              <EventCard event={e} now={now} />
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
}

const toKeyOfFirst = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, "0")}-01`;
const ymd = (key: string): [number, number, number] => {
  const p = parseKey(key);
  return [p.year, p.month, p.day];
};
