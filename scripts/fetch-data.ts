/**
 * Snapshots every data source into public/data/*.json (validated against src/data/schemas.ts).
 *
 *   npm run fetch-data            # live
 *   npm run fetch-data -- --offline   # rebuild only from existing snapshots (no network)
 *
 * Env: JEDNO_API_KEY (required for live), JEDNO_API_URL (default https://admin.jedno.net).
 * A failing source falls back to the previous snapshot (local file, else the published site).
 * Exit code is non-zero only if news or events have no data at all.
 */
import type { Meta, SnapshotData, SnapshotName } from "../src/data/schemas.ts";
import { loadEnv } from "./lib/env.ts";
import { readPrevious, writeSnapshot } from "./lib/snapshot.ts";
import { loadInstagram, INSTAGRAM_PROFILE_URL } from "./sources/instagram.ts";
import {
  createApiClient,
  fetchEventTags,
  fetchEvents,
  fetchInfos,
  fetchNews,
  fetchNewsAuthors,
  fetchNotifications,
  fetchPartners,
  uniqueAuthors,
  cleanList,
  type GetJson,
} from "./sources/jedno.ts";
import { YOUTUBE_CHANNEL_ID, YOUTUBE_CHANNEL_URL, fetchYoutube } from "./sources/youtube.ts";

type SourceName = Exclude<SnapshotName, "meta">;
type Status = Meta["sources"][string];
const CORE: SourceName[] = ["news", "events"];

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 300);

async function main(): Promise<number> {
  const offline = process.argv.includes("--offline");
  loadEnv();
  const baseUrl = (process.env.JEDNO_API_URL || "https://admin.jedno.net").replace(/\/+$/, "");
  const apiKey = process.env.JEDNO_API_KEY ?? "";
  const now = new Date().toISOString();

  const prevMeta = (await readPrevious("meta", { offline }))?.data ?? null;
  const get: GetJson | null = !offline && apiKey ? createApiClient(baseUrl, apiKey) : null;
  const noClient = (): never => {
    throw new Error(offline ? "offline mode" : "JEDNO_API_KEY is not set");
  };

  const statuses: Record<string, Status> = {};
  const origins: Record<string, string> = {};
  const counts: Record<string, number> = {};
  const results: { [N in SourceName]?: SnapshotData<N> } = {};

  async function resolve<N extends SourceName>(
    name: N,
    fetcher: (prev: SnapshotData<N> | null) => Promise<SnapshotData<N>>,
  ): Promise<SnapshotData<N> | null> {
    const prev = await readPrevious(name, { offline });
    try {
      if (offline) throw new Error("offline mode");
      const data = await fetcher(prev?.data ?? null);
      statuses[name] = { ok: true, fetchedAt: now, error: null };
      origins[name] = "fresh";
      return data;
    } catch (e) {
      const before = prevMeta?.sources[name];
      if (offline && before) {
        // offline rebuild: keep the status recorded when the snapshot was produced
        statuses[name] = before;
        origins[name] = prev ? `snapshot:${prev.origin}` : "none";
        return prev?.data ?? null;
      }
      statuses[name] = {
        ok: false,
        fetchedAt: prevMeta?.sources[name]?.fetchedAt ?? null,
        error: errMsg(e),
      };
      origins[name] = prev ? `fallback:${prev.origin}` : "none";
      return prev?.data ?? null;
    }
  }

  const api = (): GetJson => get ?? noClient();
  const set = <N extends SourceName>(name: N, data: SnapshotData<N> | null) => {
    if (data !== null) {
      results[name] = data as never;
      counts[name] = data.length;
    }
  };

  set("news", await resolve("news", () => fetchNews(api(), baseUrl)));
  set("events", await resolve("events", () => fetchEvents(api(), baseUrl)));
  set("partners", await resolve("partners", () => fetchPartners(api(), baseUrl)));
  set("infos", await resolve("infos", () => fetchInfos(api(), baseUrl)));
  set("notifications", await resolve("notifications", () => fetchNotifications(api())));
  set("videos", await resolve("videos", (prev) => fetchYoutube(prev ?? [])));
  set("instagram", await resolve("instagram", () => loadInstagram()));

  // Instagram is a local file: it works offline too.
  if (offline) {
    try {
      set("instagram", await loadInstagram());
      statuses.instagram = { ok: true, fetchedAt: now, error: null };
      origins.instagram = "fresh";
    } catch {
      /* keep fallback */
    }
  }

  // Dictionaries for meta (failures fall back to previous meta / derived values)
  let newsAuthors = prevMeta?.newsAuthors ?? null;
  let eventTags = prevMeta?.eventTags ?? null;
  if (get) {
    newsAuthors = await fetchNewsAuthors(get).catch(
      (e) => (console.warn(`! news authors: ${errMsg(e)}`), newsAuthors),
    );
    eventTags = await fetchEventTags(get).catch(
      (e) => (console.warn(`! event tags: ${errMsg(e)}`), eventTags),
    );
  }
  const news = results.news ?? [];
  const events = results.events ?? [];
  newsAuthors ??= cleanList(news.map((n) => n.author));
  eventTags ??= cleanList(events.map((e) => e.tag));

  const missingCore = CORE.filter((n) => results[n] === undefined);
  if (missingCore.length > 0) {
    printSummary(statuses, origins, counts);
    console.error(`\nFATAL: no data (fresh or fallback) for: ${missingCore.join(", ")}`);
    return 1;
  }

  const meta: Meta = {
    generatedAt: now,
    newsAuthors,
    eventTags,
    eventAuthors: uniqueAuthors(events),
    youtube: { channelId: YOUTUBE_CHANNEL_ID, channelUrl: YOUTUBE_CHANNEL_URL },
    instagram: { profileUrl: INSTAGRAM_PROFILE_URL },
    sources: statuses,
  };

  const names: SourceName[] = [
    "news",
    "events",
    "partners",
    "infos",
    "notifications",
    "videos",
    "instagram",
  ];
  for (const n of names) {
    // sources without any data (non-core) become empty arrays
    await writeSnapshot(n, (results[n] ?? []) as never);
    counts[n] ??= 0;
  }
  await writeSnapshot("meta", meta);

  printSummary(statuses, origins, counts);
  return 0;
}

function printSummary(
  statuses: Record<string, Status>,
  origins: Record<string, string>,
  counts: Record<string, number>,
) {
  const rows = Object.keys(statuses).map((name) => ({
    source: name,
    status: statuses[name]!.ok ? "ok" : "FAILED",
    data: origins[name] ?? "",
    items: counts[name] ?? 0,
    error: statuses[name]!.error ?? "",
  }));
  const cols = ["source", "status", "data", "items", "error"] as const;
  const width = (c: (typeof cols)[number]) =>
    Math.max(c.length, ...rows.map((r) => String(r[c]).length));
  const line = (r: Record<string, string | number>) =>
    cols
      .map((c) => String(r[c]).padEnd(width(c)))
      .join("  ")
      .trimEnd();
  console.log("\n" + line(Object.fromEntries(cols.map((c) => [c, c]))));
  console.log(cols.map((c) => "-".repeat(width(c))).join("  "));
  rows.forEach((r) => console.log(line(r)));
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error("fetch-data crashed:", errMsg(e));
    process.exit(1);
  },
);
