/**
 * Shared data contract between `scripts/fetch-data.ts` (Node, build time)
 * and the React app (browser, runtime).
 *
 * The app NEVER talks to admin.jedno.net directly (no CORS + secret key).
 * A GitHub Action snapshots everything into `public/data/*.json` with these shapes.
 *
 * Dates are ISO-8601 strings in JSON; parse them with helpers from `src/lib/dates.ts`.
 * This file must stay framework-free (imported by Node scripts).
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Snapshot shapes (what the app reads)                                */
/* ------------------------------------------------------------------ */

export const NewsSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string(),
  /** ISO date of publication */
  date: z.string(),
  /** Sanitizable HTML body (relative URLs already made absolute). May be empty. */
  html: z.string(),
  imageUrl: z.string().nullable(),
  author: z.string().nullable(),
  tag: z.string(),
  /** When set, the news item is an announcement of this event id */
  linkedEventId: z.number().nullable(),
  /** true when tag === "wydarzenie" — the mobile app opens the event with the same id */
  isEventAlias: z.boolean(),
});
export type News = z.infer<typeof NewsSchema>;

export const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string(),
  /** ISO start with offset, e.g. 2026-11-13T19:30:00+01:00 */
  start: z.string(),
  end: z.string().nullable(),
  location: z.string(),
  mapsLink: z.string().nullable(),
  tag: z.string().nullable(),
  html: z.string(),
  imageUrl: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  publishDate: z.string().nullable(),
  author: z.string().nullable(),
});
export type Event = z.infer<typeof EventSchema>;

export const PartnerSchema = z.object({
  id: z.number(),
  name: z.string(),
  html: z.string(),
  imageUrl: z.string().nullable(),
  /** Trimmed category, e.g. "Organizacje" | "Wspólnoty" (dynamic, from backend) */
  category: z.string().nullable(),
});
export type Partner = z.infer<typeof PartnerSchema>;

export const InfoSchema = z.object({
  id: z.number(),
  /** URL slug generated from title, e.g. "o-aplikacji" */
  slug: z.string(),
  title: z.string(),
  html: z.string(),
  hasForm: z.boolean(),
  formTitle: z.string().nullable(),
  formPlaceholder: z.string().nullable(),
  formButtonLabel: z.string().nullable(),
});
export type Info = z.infer<typeof InfoSchema>;

export const NotificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  publishDate: z.string(),
  /** Parsed from pathToContent "general/events/2035" | "general/news/12" */
  target: z.object({ kind: z.enum(["news", "event"]), id: z.number() }).nullable(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const VideoSchema = z.object({
  /** YouTube video id (11 chars) */
  id: z.string(),
  title: z.string(),
  description: z.string(),
  publishedAt: z.string(),
  thumbnailUrl: z.string(),
  views: z.number().nullable(),
  url: z.string(),
});
export type Video = z.infer<typeof VideoSchema>;

export const InstagramPostSchema = z.object({
  /** Full permalink, e.g. https://www.instagram.com/p/XXXXXXXX/ */
  url: z.string(),
  /** Optional caption shown next to the embed */
  caption: z.string().nullable(),
});
export type InstagramPost = z.infer<typeof InstagramPostSchema>;

export const SourceStatusSchema = z.object({
  ok: z.boolean(),
  /** ISO time of the last successful fetch for this source */
  fetchedAt: z.string().nullable(),
  error: z.string().nullable(),
});

export const MetaSchema = z.object({
  generatedAt: z.string(),
  newsAuthors: z.array(z.string()),
  eventTags: z.array(z.string()),
  eventAuthors: z.array(z.string()),
  youtube: z.object({ channelId: z.string(), channelUrl: z.string() }),
  instagram: z.object({ profileUrl: z.string() }),
  sources: z.record(z.string(), SourceStatusSchema),
});
export type Meta = z.infer<typeof MetaSchema>;

/** File name -> schema for every snapshot file in public/data */
export const SnapshotFiles = {
  news: z.array(NewsSchema),
  events: z.array(EventSchema),
  partners: z.array(PartnerSchema),
  infos: z.array(InfoSchema),
  notifications: z.array(NotificationSchema),
  videos: z.array(VideoSchema),
  instagram: z.array(InstagramPostSchema),
  meta: MetaSchema,
} as const;
export type SnapshotName = keyof typeof SnapshotFiles;
export type SnapshotData<N extends SnapshotName> = z.infer<(typeof SnapshotFiles)[N]>;
