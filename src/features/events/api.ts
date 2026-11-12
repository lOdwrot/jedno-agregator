/** Data hooks for events ("Wydarzenia"). Source: public/data/events.json + meta.json. */
import { useSnapshot } from "@/data/useSnapshot";
import type { Event } from "@/data/schemas";
import { isUpcoming } from "@/lib/dates";

export type EventFilters = { tag?: string | null; author?: string | null };

/** Upcoming (not yet finished) events matching filters, ascending by start. */
export function filterEvents(items: Event[], { tag, author }: EventFilters, now = new Date()): Event[] {
  return items.filter(
    (e) =>
      isUpcoming(e.start, e.end, now) &&
      (!tag || e.tag === tag) &&
      (!author || e.author === author),
  );
}

export function useEvents(filters: EventFilters = {}) {
  return useSnapshot("events", { select: (items) => filterEvents(items, filters) });
}

/** Next `limit` upcoming events (home strip "Najbliższe wydarzenia"). */
export function useUpcomingEvents(limit: number) {
  return useSnapshot("events", { select: (items) => filterEvents(items, {}).slice(0, limit) });
}

/** Single event by id — includes past events (deep links must keep working). */
export function useEvent(id: number) {
  return useSnapshot("events", { select: (items) => items.find((e) => e.id === id) ?? null });
}

/** Filter dictionaries: categories (tags) and authors. */
export function useEventFilterOptions() {
  return useSnapshot("meta", { select: (m) => ({ tags: m.eventTags, authors: m.eventAuthors }) });
}
