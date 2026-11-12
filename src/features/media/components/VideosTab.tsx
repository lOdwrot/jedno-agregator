import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { ChipGroup, EmptyState, ErrorState, Icon, Reveal, Skeleton, Stack } from "@/ui";
import type { Video } from "@/data/schemas";
import { useMediaMeta, useVideos } from "../api";
import { deriveSeries, filterVideos } from "../utils";
import { ChannelCta } from "./ChannelCta";
import { FeaturedVideo } from "./FeaturedVideo";
import { VideoCard } from "./VideoCard";
import { VideoTheater } from "./VideoTheater";

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function VideosSkeleton() {
  return (
    <div role="status" aria-label="Ładowanie filmów" className="space-y-6">
      <Skeleton className="aspect-video w-full rounded-card lg:h-96" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-64 rounded-card" />
        ))}
      </div>
    </div>
  );
}

export function VideosTab() {
  const videosQ = useVideos();
  const metaQ = useMediaMeta();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const series = params.get("seria");
  const filmId = params.get("film");

  const [input, setInput] = useState(q);
  const debounced = useDebounced(input, 250);

  const update = useCallback(
    (changes: Record<string, string | null>, replace = true) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, val] of Object.entries(changes)) {
            if (val) next.set(k, val);
            else next.delete(k);
          }
          return next;
        },
        { replace },
      );
    },
    [setParams],
  );

  useEffect(() => {
    if (debounced !== q) update({ q: debounced.trim() || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when the debounced input settles
  }, [debounced]);

  const videos = videosQ.data;
  const seriesOptions = useMemo(
    () =>
      deriveSeries(videos ?? []).map((s) => ({
        value: s.name,
        label: `${s.name} (${s.count})`,
        ariaLabel: `${s.name}, ${s.count} filmów`,
      })),
    [videos],
  );
  const filtered = useMemo(() => filterVideos(videos ?? [], q, series), [videos, q, series]);
  const filtering = !!q.trim() || !!series;
  const featured = !filtering ? (videos?.[0] ?? null) : null;
  const gridVideos = featured ? filtered.filter((v) => v.id !== featured.id) : filtered;

  const navList = filtered;
  const current = filmId ? (videos?.find((v) => v.id === filmId) ?? null) : null;
  const idx = current ? navList.findIndex((v) => v.id === current.id) : -1;
  // list is newest-first: "prev" in the dialog = newer = lower index
  const newer = idx > 0 ? (navList[idx - 1] ?? null) : null;
  const older = idx >= 0 ? (navList[idx + 1] ?? null) : null;

  const open = useCallback((v: Video) => update({ film: v.id }, false), [update]);
  const close = useCallback(() => update({ film: null }), [update]);
  const go = useCallback((v: Video) => update({ film: v.id }), [update]);

  if (videosQ.isPending) return <VideosSkeleton />;
  if (videosQ.isError)
    return (
      <ErrorState message="Nie udało się wczytać filmów." onRetry={() => void videosQ.refetch()} />
    );
  if (!videos || videos.length === 0)
    return (
      <EmptyState
        icon="youtube"
        title="Brak filmów"
        description="Filmy pojawią się tu po następnej aktualizacji."
      />
    );

  return (
    <Stack gap={8}>
      {featured && <FeaturedVideo video={featured} />}

      <Reveal>
        <div className="flex flex-col gap-4 rounded-card bg-surface p-4 shadow-card">
          <div className="relative">
            <label htmlFor="video-search" className="mb-1 block text-sm font-bold text-navy">
              Szukaj filmów
            </label>
            <div className="relative">
              <Icon
                name="search"
                size={20}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted"
              />
              <input
                id="video-search"
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="np. Ojciec Pio, 100NA100…"
                autoComplete="off"
                className="h-12 w-full rounded-pill border border-line bg-surface-muted pr-4 pl-11 text-ink placeholder:text-ink-muted focus:border-accent-ink focus:bg-surface"
              />
            </div>
          </div>
          {seriesOptions.length > 0 && (
            <ChipGroup
              label="Serie"
              options={seriesOptions}
              value={series}
              onChange={(v) => update({ seria: v })}
              allowClear
            />
          )}
          <p className="text-sm text-ink-muted" role="status" aria-live="polite">
            {filtering
              ? `Znaleziono filmów: ${filtered.length}`
              : `Wszystkie filmy: ${videos.length}`}
          </p>
        </div>
      </Reveal>

      {gridVideos.length === 0 ? (
        <EmptyState
          icon="search"
          title="Brak pasujących filmów"
          description="Zmień frazę wyszukiwania lub wyczyść filtr serii."
        />
      ) : (
        <ul className="grid grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {gridVideos.map((v) => (
            <VideoCard key={v.id} video={v} onOpen={open} />
          ))}
        </ul>
      )}

      <ChannelCta href={metaQ.data?.channelUrl ?? "https://www.youtube.com/@ArchiGdansk"} />

      <VideoTheater video={current} prev={newer} next={older} onClose={close} onNavigate={go} />
    </Stack>
  );
}
