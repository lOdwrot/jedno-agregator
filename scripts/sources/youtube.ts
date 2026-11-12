import { XMLParser } from "fast-xml-parser";
import type { Video } from "../../src/data/schemas.ts";
import { getText } from "../lib/http.ts";

export const YOUTUBE_CHANNEL_ID = "UCCo78wXTUrPfihoCH7ghT-A";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@ArchiGdansk";
export const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
export const MAX_VIDEOS = 200;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  isArray: (name) => name === "entry",
});

type Rec = Record<string, unknown>;
const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

/** Parses the channel RSS feed into Video objects (newest first). */
export function parseYoutubeFeed(xml: string): Video[] {
  const doc = parser.parse(xml) as { feed?: { entry?: Rec[] } };
  const entries = doc.feed?.entry ?? [];
  const videos: Video[] = [];
  for (const e of entries) {
    const id = str(e["yt:videoId"]).trim();
    if (!id) continue;
    const group = (e["media:group"] ?? {}) as Rec;
    const stats = ((group["media:community"] as Rec | undefined)?.["media:statistics"] ?? {}) as Rec;
    const viewsRaw = str(stats["@_views"]);
    const views = viewsRaw !== "" && Number.isFinite(Number(viewsRaw)) ? Number(viewsRaw) : null;
    videos.push({
      id,
      title: str(e.title).trim() || str(group["media:title"]).trim(),
      description: str(group["media:description"]).trim(),
      publishedAt: str(e.published).trim(),
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      views,
      url: `https://www.youtube.com/watch?v=${id}`,
    });
  }
  return sortVideos(videos);
}

const sortVideos = (v: Video[]) => [...v].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));

/** Merges the fresh feed into the previous archive: dedupe by id (fresh wins), newest first, capped. */
export function mergeVideos(previous: readonly Video[], fresh: readonly Video[], cap = MAX_VIDEOS): Video[] {
  const map = new Map<string, Video>();
  for (const v of previous) map.set(v.id, v);
  for (const v of fresh) {
    const old = map.get(v.id);
    map.set(v.id, { ...v, views: v.views ?? old?.views ?? null });
  }
  return sortVideos([...map.values()]).slice(0, cap);
}

export async function fetchYoutube(previous: readonly Video[] = []): Promise<Video[]> {
  const xml = await getText(YOUTUBE_FEED_URL);
  const fresh = parseYoutubeFeed(xml);
  if (fresh.length === 0) throw new Error("YouTube feed contained no entries");
  return mergeVideos(previous, fresh);
}
