import type { Event, Info, News, Notification, Partner } from "../../src/data/schemas.ts";
import { slugify } from "../../src/lib/slug.ts";
import { getJson, mapLimit } from "../lib/http.ts";

/* ------------------------------------------------------------------ */
/* DTOs (see mobile app src/api/api.model.ts) — everything is nullable  */
/* because the CMS is lenient.                                          */
/* ------------------------------------------------------------------ */
export interface NewsDto {
  id: number;
  title?: string | null;
  subtitle?: string | null;
  date: string;
  text?: string | null;
  imageUrl?: string | null;
  author?: string | null;
  tag?: string | null;
  linkedEventPath?: string | null;
}
export interface EventDto {
  id: number;
  title?: string | null;
  subtitle?: string | null;
  start: string;
  end?: string | null;
  location?: string | null;
  mapsLink?: string | null;
  tag?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  publishDate?: string | null;
  author?: string | null;
}
export interface PartnerDto {
  id: number;
  name?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  category?: string | null;
}
export interface InfoDto {
  id: number;
  title?: string | null;
  text?: string | null;
  hasForm?: boolean | null;
  formTitle?: string | null;
  formPlaceholder?: string | null;
  formButtonLabel?: string | null;
}
export interface NotificationDto {
  id: number;
  title?: string | null;
  description?: string | null;
  publishDate: string;
  pathToContent?: string | null;
}

/* ------------------------------------------------------------------ */
/* Pure normalizers                                                     */
/* ------------------------------------------------------------------ */

const trimOrEmpty = (s: string | null | undefined): string => (s ?? "").trim();
const trimOrNull = (s: string | null | undefined): string | null => {
  const t = (s ?? "").trim();
  return t === "" ? null : t;
};

/** Resolves a (possibly relative) URL against the API base. Returns null for empty input. */
export function absoluteUrl(url: string | null | undefined, baseUrl: string): string | null {
  const t = trimOrNull(url);
  if (t === null) return null;
  if (/^(https?:|mailto:|tel:|data:|#)/i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;
  try {
    return new URL(t, baseUrl.replace(/\/+$/, "") + "/").toString();
  } catch {
    return t;
  }
}

/** Makes relative src/href/srcset/poster/data-embed-url references in HTML absolute; null -> "". */
export function absolutizeHtml(html: string | null | undefined, baseUrl: string): string {
  if (!html) return "";
  const fix = (v: string) => absoluteUrl(v, baseUrl) ?? v;
  return html
    .replace(
      /\b(src|href|poster|data-embed-url)\s*=\s*(["'])(.*?)\2/gi,
      (_m, attr: string, q: string, v: string) => {
        return `${attr}=${q}${fix(v)}${q}`;
      },
    )
    .replace(/\bsrcset\s*=\s*(["'])(.*?)\1/gi, (_m, q: string, v: string) => {
      const out = v
        .split(",")
        .map((part) => {
          const [u, ...rest] = part.trim().split(/\s+/);
          return [u ? fix(u) : "", ...rest].join(" ");
        })
        .join(", ");
      return `srcset=${q}${out}${q}`;
    })
    .trim();
}

const warsawParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Warsaw",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
function warsawOffsetMinutes(utcMs: number): number {
  const p: Record<string, number> = {};
  for (const part of warsawParts.formatToParts(new Date(utcMs)))
    if (part.type !== "literal") p[part.type] = Number(part.value);
  return Math.round(
    (Date.UTC(p.year!, p.month! - 1, p.day!, p.hour!, p.minute!, p.second!) -
      Math.floor(utcMs / 1000) * 1000) /
      60000,
  );
}

/** If an ISO datetime has no zone designator, assume Europe/Warsaw wall time and add the proper offset. */
export function withWarsawOffset(iso: string): string;
export function withWarsawOffset(iso: string | null | undefined): string | null;
export function withWarsawOffset(iso: string | null | undefined): string | null {
  const s = trimOrNull(iso);
  if (s === null) return null;
  if (/T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}(?::?\d{2})?)$/i.test(s)) return s;
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(s);
  if (!m) return s;
  const [, y, mo, d, h, mi, sec = "00"] = m;
  const wall = Date.UTC(+y!, +mo! - 1, +d!, +h!, +mi!, +sec);
  for (const off of [60, 120]) {
    if (warsawOffsetMinutes(wall - off * 60000) === off) {
      const sign = off >= 0 ? "+" : "-";
      return `${y}-${mo}-${d}T${h}:${mi}:${sec}${sign}${String(Math.floor(off / 60)).padStart(2, "0")}:${String(off % 60).padStart(2, "0")}`;
    }
  }
  return `${y}-${mo}-${d}T${h}:${mi}:${sec}+01:00`;
}

/** "general/events/2035" -> 2035; null if not a number */
export function parseLinkedEventId(path: string | null | undefined): number | null {
  const last = trimOrEmpty(path).split("/").filter(Boolean).pop();
  if (!last) return null;
  const n = Number(last);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** List values win when non-null; the detail endpoint fills the rest (html bodies, missing fields). */
function mergePreferList<T extends object>(list: T, detail: T | null): T {
  const out = { ...(detail ?? {}) } as Record<string, unknown>;
  for (const [k, v] of Object.entries(list)) if (v !== null && v !== undefined) out[k] = v;
  return out as T;
}

export function normalizeNews(list: NewsDto, detail: NewsDto | null, baseUrl: string): News {
  const d = mergePreferList(list, detail);
  const tag = trimOrEmpty(d.tag);
  return {
    id: list.id,
    title: trimOrEmpty(d.title),
    subtitle: trimOrEmpty(d.subtitle),
    date: withWarsawOffset(d.date),
    html: absolutizeHtml(d.text, baseUrl),
    imageUrl: absoluteUrl(d.imageUrl, baseUrl),
    author: trimOrNull(d.author),
    tag,
    linkedEventId: parseLinkedEventId(d.linkedEventPath),
    isEventAlias: tag.toLowerCase() === "wydarzenie",
  };
}

export function normalizeEvent(list: EventDto, detail: EventDto | null, baseUrl: string): Event {
  const d = mergePreferList(list, detail);
  return {
    id: list.id,
    title: trimOrEmpty(d.title),
    subtitle: trimOrEmpty(d.subtitle),
    start: withWarsawOffset(d.start),
    end: withWarsawOffset(d.end),
    location: trimOrEmpty(d.location),
    mapsLink: absoluteUrl(d.mapsLink, baseUrl),
    tag: trimOrNull(d.tag),
    html: absolutizeHtml(d.description, baseUrl),
    imageUrl: absoluteUrl(d.imageUrl, baseUrl),
    thumbnailUrl: absoluteUrl(d.thumbnailUrl, baseUrl),
    publishDate: withWarsawOffset(d.publishDate),
    author: trimOrNull(d.author),
  };
}

export function normalizePartner(dto: PartnerDto, baseUrl: string): Partner {
  return {
    id: dto.id,
    name: trimOrEmpty(dto.name),
    html: absolutizeHtml(dto.description, baseUrl),
    imageUrl: absoluteUrl(dto.imageUrl, baseUrl),
    category: trimOrNull(dto.category),
  };
}

export function normalizeInfos(dtos: readonly InfoDto[], baseUrl: string): Info[] {
  const used = new Set<string>();
  return dtos.map((dto) => {
    const title = trimOrEmpty(dto.title);
    let slug = slugify(title) || `info-${dto.id}`;
    if (used.has(slug)) slug = `${slug}-${dto.id}`;
    used.add(slug);
    return {
      id: dto.id,
      slug,
      title,
      html: absolutizeHtml(dto.text, baseUrl),
      hasForm: Boolean(dto.hasForm),
      formTitle: trimOrNull(dto.formTitle),
      formPlaceholder: trimOrNull(dto.formPlaceholder),
      formButtonLabel: trimOrNull(dto.formButtonLabel),
    };
  });
}

/** "general/news/12" | "/general/events/3" -> { kind, id }; anything else -> null */
export function parseNotificationTarget(path: string | null | undefined): Notification["target"] {
  const m = /(?:^|\/)general\/(news|events)\/(\d+)\/?$/.exec(trimOrEmpty(path));
  if (!m) return null;
  return { kind: m[1] === "news" ? "news" : "event", id: Number(m[2]) };
}

export function normalizeNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    title: trimOrEmpty(dto.title),
    description: trimOrNull(dto.description),
    publishDate: withWarsawOffset(dto.publishDate),
    target: parseNotificationTarget(dto.pathToContent),
  };
}

/* ------------------------------------------------------------------ */
/* Fetching                                                             */
/* ------------------------------------------------------------------ */

export const PAGE_SIZE = 50;
export const MAX_PAGES = 20;
export const DETAIL_CONCURRENCY = 4;

export type GetJson = <T>(path: string) => Promise<T>;

export function createApiClient(baseUrl: string, apiKey: string): GetJson {
  const root = baseUrl.replace(/\/+$/, "");
  return <T>(path: string) => getJson<T>(`${root}${path}`, { headers: { "x-api-key": apiKey } });
}

async function fetchAllPages<T extends { id: number }>(get: GetJson, path: string): Promise<T[]> {
  const all = new Map<number, T>();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const items = (await get<T[] | null>(`${path}?pageNumber=${page}&pageSize=${PAGE_SIZE}`)) ?? [];
    for (const it of items) all.set(it.id, it);
    if (items.length < PAGE_SIZE) break;
  }
  return [...all.values()];
}

export async function fetchNews(get: GetJson, baseUrl: string): Promise<News[]> {
  const list = await fetchAllPages<NewsDto>(get, "/api/news");
  const out = await mapLimit(list, DETAIL_CONCURRENCY, async (item) =>
    normalizeNews(item, await get<NewsDto>(`/api/news/${item.id}`), baseUrl),
  );
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
}

export async function fetchEvents(get: GetJson, baseUrl: string): Promise<Event[]> {
  const list = await fetchAllPages<EventDto>(get, "/api/events");
  const out = await mapLimit(list, DETAIL_CONCURRENCY, async (item) =>
    normalizeEvent(item, await get<EventDto>(`/api/events/${item.id}`), baseUrl),
  );
  return out.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : a.id - b.id));
}

export async function fetchPartners(get: GetJson, baseUrl: string): Promise<Partner[]> {
  return ((await get<PartnerDto[] | null>("/api/partners")) ?? []).map((p) =>
    normalizePartner(p, baseUrl),
  );
}

export async function fetchInfos(get: GetJson, baseUrl: string): Promise<Info[]> {
  return normalizeInfos((await get<InfoDto[] | null>("/api/infos")) ?? [], baseUrl);
}

export async function fetchNotifications(get: GetJson, now = new Date()): Promise<Notification[]> {
  const from = new Date(now.getTime() - 30 * 24 * 3600_000).toISOString();
  const list =
    (await get<NotificationDto[] | null>(
      `/api/notifications?dateFrom=${encodeURIComponent(from)}&festivalEnabled=false`,
    )) ?? [];
  return list
    .map(normalizeNotification)
    .sort((a, b) =>
      a.publishDate < b.publishDate ? 1 : a.publishDate > b.publishDate ? -1 : b.id - a.id,
    );
}

const cleanList = (xs: readonly (string | null | undefined)[]): string[] =>
  [...new Set(xs.map((x) => trimOrEmpty(x)).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pl"),
  );

export async function fetchNewsAuthors(get: GetJson): Promise<string[]> {
  return cleanList((await get<string[] | null>("/api/news/authors")) ?? []);
}
export async function fetchEventTags(get: GetJson): Promise<string[]> {
  return cleanList((await get<string[] | null>("/api/events/tags")) ?? []);
}
export const uniqueAuthors = (events: readonly Event[]): string[] =>
  cleanList(events.map((e) => e.author));
export { cleanList };
