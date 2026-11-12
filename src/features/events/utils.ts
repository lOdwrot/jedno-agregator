import type { Event } from "@/data/schemas";
import { dayKey } from "@/lib/dates";

export const WEEKDAYS_SHORT = ["pon", "wt", "śr", "czw", "pt", "sob", "niedz"] as const;
export const WEEKDAYS_LONG = [
  "poniedziałek",
  "wtorek",
  "środa",
  "czwartek",
  "piątek",
  "sobota",
  "niedziela",
] as const;
export const MONTHS = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień",
] as const;
export const MONTHS_GENITIVE = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
] as const;

const pad = (n: number) => String(n).padStart(2, "0");
export const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export interface MonthCell {
  key: string;
  day: number;
  inMonth: boolean;
}

/** Monday-first matrix of full weeks covering `month` (0-based) of `year`. */
export function buildMonthMatrix(year: number, month: number): MonthCell[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;
  const cells: MonthCell[] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(Date.UTC(year, month, 1 - lead + i));
    cells.push({
      key: toKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month,
    });
  }
  const weeks: MonthCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Adds `delta` months, normalising the year. */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const idx = year * 12 + month + delta;
  return { year: Math.floor(idx / 12), month: ((idx % 12) + 12) % 12 };
}

/** Shifts a yyyy-MM-dd key by `days` (pure calendar arithmetic). */
export function shiftDayKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return toKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function parseKey(key: string): { year: number; month: number; day: number } {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  return { year: y, month: m - 1, day: d };
}

/** Map yyyy-MM-dd -> events starting that day. */
export function indexEventsByDay(events: readonly Event[]): Map<string, Event[]> {
  const map = new Map<string, Event[]>();
  for (const e of events) {
    const k = dayKey(e.start);
    const list = map.get(k);
    if (list) list.push(e);
    else map.set(k, [e]);
  }
  return map;
}

export function pluralPl(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  if (abs === 1) return one;
  const last = abs % 10;
  const lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return few;
  return many;
}

export const eventsCountLabel = (n: number) =>
  `${n} ${pluralPl(n, "wydarzenie", "wydarzenia", "wydarzeń")}`;

/** "13 listopada, 2 wydarzenia" */
export function dayAriaLabel(key: string, count: number): string {
  const { month, day } = parseKey(key);
  const base = `${day} ${MONTHS_GENITIVE[month]}`;
  return count === 0 ? base : `${base}, ${eventsCountLabel(count)}`;
}

/** Number of events starting within the next 7 days (rolling week) from `now`. */
export function countThisWeek(events: readonly Event[], now: Date = new Date()): number {
  const from = now.getTime();
  const to = from + 7 * 86_400_000;
  return events.filter((e) => {
    const s = new Date(e.start).getTime();
    return s >= from - 2 * 3600_000 && s < to;
  }).length;
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function countdownParts(ms: number): CountdownParts {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** "3 dni 4 godz." / "2 godz. 5 min" / "12 min" / "mniej niż minutę" */
export function formatCountdown(ms: number): string {
  const { days, hours, minutes } = countdownParts(ms);
  if (days > 0)
    return `${days} ${pluralPl(days, "dzień", "dni", "dni")}${hours ? ` ${hours} godz.` : ""}`;
  if (hours > 0) return `${hours} godz.${minutes ? ` ${minutes} min` : ""}`;
  if (minutes > 0) return `${minutes} min`;
  return "mniej niż minutę";
}

export type EventStatus = "upcoming" | "live" | "ended";

const TWO_HOURS = 2 * 3600_000;

export function eventEnd(event: Pick<Event, "start" | "end">): number {
  const s = new Date(event.start).getTime();
  const e = event.end ? new Date(event.end).getTime() : NaN;
  return Number.isNaN(e) ? s + TWO_HOURS : e;
}

export function eventStatus(
  event: Pick<Event, "start" | "end">,
  now: Date = new Date(),
): EventStatus {
  const t = now.getTime();
  if (t < new Date(event.start).getTime()) return "upcoming";
  return t <= eventEnd(event) ? "live" : "ended";
}

/** "Zaczyna się za 3 dni 4 godz." / "Trwa teraz" / "Wydarzenie zakończone" */
export function statusText(event: Pick<Event, "start" | "end">, now: Date = new Date()): string {
  const st = eventStatus(event, now);
  if (st === "live") return "Trwa teraz";
  if (st === "ended") return "Wydarzenie zakończone";
  return `Zaczyna się za ${formatCountdown(new Date(event.start).getTime() - now.getTime())}`;
}

export function mapsUrl(event: Pick<Event, "mapsLink" | "location">): string | null {
  if (event.mapsLink) return event.mapsLink;
  const loc = event.location.replace(/\s*\|\s*/g, ", ").trim();
  return loc ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}` : null;
}

/** "Aula Jana Pawła II | Gdańsk-Oliwa" -> "Aula Jana Pawła II, Gdańsk-Oliwa" */
export const prettyLocation = (location: string) => location.replace(/\s*\|\s*/g, ", ").trim();
