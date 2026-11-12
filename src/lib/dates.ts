import { differenceInCalendarDays, format, formatDistance, parseISO } from "date-fns";
import { pl } from "date-fns/locale/pl";

export { parseISO };

export const TIME_ZONE = "Europe/Warsaw";

type DateInput = Date | string;

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function toDate(d: DateInput): Date {
  return typeof d === "string" ? parseISO(d) : d;
}

/**
 * Returns a Date whose *local* fields equal the Warsaw wall-clock of `d`.
 * Lets date-fns (which works in the runtime's local zone) format Warsaw time
 * regardless of where the browser/test runner is.
 */
function warsaw(d: DateInput): Date {
  const date = toDate(d);
  const p: Record<string, number> = {};
  for (const part of partsFormatter.formatToParts(date)) {
    if (part.type !== "literal") p[part.type] = Number(part.value);
  }
  return new Date(p.year!, p.month! - 1, p.day!, p.hour!, p.minute!, p.second!);
}

const dayDiff = (a: DateInput, now: Date) => differenceInCalendarDays(warsaw(a), warsaw(now));

/** yyyy-MM-dd in Europe/Warsaw */
export function dayKey(date: DateInput): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(toDate(date));
}

export const formatDate = (date: DateInput): string => format(warsaw(date), "dd.MM.yyyy");
export const formatDateNoYear = (date: DateInput): string => format(warsaw(date), "dd.MM");
export const formatTime = (date: DateInput): string => format(warsaw(date), "HH:mm");
export const formatDateTime = (date: DateInput): string => format(warsaw(date), "dd.MM HH:mm");

/** "29 maja, 18:00" */
export const formatEventDateTime = (date: DateInput): string =>
  format(warsaw(date), "d MMMM, HH:mm", { locale: pl });

/** "Dziś, 18:00" / "Jutro, 19:30" / "29 maj, 18:00", optional " – HH:mm" */
export function formatEventChip(
  start: DateInput,
  end?: DateInput | null,
  now: Date = new Date(),
): string {
  const diff = dayDiff(start, now);
  const dayPart =
    diff === 0 ? "Dziś" : diff === 1 ? "Jutro" : format(warsaw(start), "d MMM", { locale: pl });
  const head = `${dayPart}, ${formatTime(start)}`;
  if (!end) return head;
  const endDate = toDate(end);
  if (isNaN(endDate.getTime())) return head;
  return `${head} – ${formatTime(endDate)}`;
}

/** "Dzisiaj – piątek, 13 listopada" / "Jutro – …" / "Sobota, 14 listopada" */
export function formatEventDayHeader(date: DateInput, now: Date = new Date()): string {
  const base = format(warsaw(date), "EEEE, d MMMM", { locale: pl });
  const diff = dayDiff(date, now);
  if (diff === 0) return `Dzisiaj – ${base}`;
  if (diff === 1) return `Jutro – ${base}`;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/** "29 maja, 17:00 – 15:00" (same day) or "29 maja, 17:00 – 31 maja, 15:00" */
export function formatEventRange(start: DateInput, end?: DateInput | null): string {
  const startStr = formatEventDateTime(start);
  if (!end) return startStr;
  const endDate = toDate(end);
  if (isNaN(endDate.getTime())) return startStr;
  const sameDay = dayKey(start) === dayKey(endDate);
  return `${startStr} – ${sameDay ? formatTime(endDate) : formatEventDateTime(endDate)}`;
}

/** Notification grouping label. */
export function formatRelativeGroup(date: DateInput, now: Date = new Date()): string {
  const diff = -dayDiff(date, now);
  if (diff <= 0) return "Dzisiaj";
  if (diff === 1) return "Wczoraj";
  if (diff === 2) return "Przedwczoraj";
  if (diff <= 14) return "W zeszłym tygodniu";
  return formatDate(date);
}

/** True when per-item time should be shown inside a notification card (today..2 days ago). */
export const groupLabelShowsTime = (date: DateInput, now: Date = new Date()): boolean =>
  -dayDiff(date, now) <= 2;

/** "2 dni temu" */
export function formatRelativeAgo(date: DateInput, now: Date = new Date()): string {
  return formatDistance(toDate(date), now, { addSuffix: true, locale: pl });
}

/** 3725 -> "1:02:05", 65 -> "1:05" */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** Groups items by Warsaw calendar day, preserving item order; groups ordered by first appearance. */
export function groupByDay<T>(
  items: readonly T[],
  getDate: (item: T) => DateInput,
): Array<{ key: string; date: Date; items: T[] }> {
  const map = new Map<string, { key: string; date: Date; items: T[] }>();
  for (const item of items) {
    const date = toDate(getDate(item));
    const key = dayKey(date);
    const group = map.get(key);
    if (group) group.items.push(item);
    else map.set(key, { key, date, items: [item] });
  }
  return [...map.values()];
}

/** Event is upcoming when it has not ended yet (end, or start + 2h when no end). */
export function isUpcoming(
  start: DateInput,
  end?: DateInput | null,
  now: Date = new Date(),
): boolean {
  const s = toDate(start).getTime();
  const e = end ? toDate(end).getTime() : s + 2 * 3600_000;
  return e >= now.getTime();
}
