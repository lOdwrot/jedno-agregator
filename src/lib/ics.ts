import type { Event } from "@/data/schemas";
import { stripHtml } from "./html";

const TWO_HOURS = 2 * 3600_000;

function utc(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Folds a content line at 75 octets (RFC 5545 3.1), never splitting a UTF-8 character. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  let curBytes = 0;
  let limit = 75;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (curBytes + b > limit) {
      out.push(cur);
      cur = "";
      curBytes = 0;
      limit = 74; // continuation lines start with a space
    }
    cur += ch;
    curBytes += b;
  }
  out.push(cur);
  return out.join("\r\n ");
}

function eventRange(event: Event): { start: Date; end: Date } {
  const start = new Date(event.start);
  const parsedEnd = event.end ? new Date(event.end) : null;
  const end =
    parsedEnd && !isNaN(parsedEnd.getTime()) ? parsedEnd : new Date(start.getTime() + TWO_HOURS);
  return { start, end };
}

export function eventUrl(event: Event, siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/wydarzenia/${event.id}`;
}

function plainDescription(event: Event, siteUrl: string): string {
  const body = stripHtml(event.html);
  const url = eventUrl(event, siteUrl);
  return body ? `${body}\n\n${url}` : url;
}

/** RFC 5545 calendar with a single VEVENT (UTC times). `siteUrl` e.g. "https://lodwrot.github.io/jedno-agregator". */
export function buildIcs(event: Event, siteUrl: string): string {
  const { start, end } = eventRange(event);
  const host = (() => {
    try {
      return new URL(siteUrl).hostname;
    } catch {
      return "jedno-agregator";
    }
  })();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Jedno Agregator//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:event-${event.id}@${host}`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(start)}`,
    `DTEND:${utc(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(plainDescription(event, siteUrl))}`,
    `URL:${eventUrl(event, siteUrl)}`,
  ];
  if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** Triggers a browser download of the .ics file. */
export function downloadIcs(
  event: Event,
  siteUrl: string = window.location.origin + import.meta.env.BASE_URL,
): void {
  const blob = new Blob([buildIcs(event, siteUrl)], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `wydarzenie-${event.id}.ics`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

/** Google Calendar "template" link. */
export function googleCalendarUrl(
  event: Event,
  siteUrl: string = window.location.origin + import.meta.env.BASE_URL,
): string {
  const { start, end } = eventRange(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${utc(start)}/${utc(end)}`,
    details: plainDescription(event, siteUrl),
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
