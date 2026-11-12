import { useEffect } from "react";
import type { Video } from "@/data/schemas";
import { formatRelativeAgo } from "@/lib/dates";
import { Button, Dialog, Icon, ShareButton, Text, YouTubeEmbed } from "@/ui";
import { formatViews } from "../utils";
import { Description } from "./Description";

export interface VideoTheaterProps {
  video: Video | null;
  prev: Video | null;
  next: Video | null;
  onClose: () => void;
  onNavigate: (video: Video) => void;
}

/** "Theater mode": dialog with autoplaying player, full description and prev/next (also ←/→). */
export function VideoTheater({ video, prev, next, onClose, onNavigate }: VideoTheaterProps) {
  const open = !!video;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowLeft" && prev) onNavigate(prev);
      if (e.key === "ArrowRight" && next) onNavigate(next);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, prev, next, onNavigate]);

  return (
    <Dialog open={open} onClose={onClose} title={video?.title ?? "Film"} size="xl">
      {video && (
        <div className="flex flex-col gap-4">
          <YouTubeEmbed key={video.id} videoId={video.id} title={video.title} autoplay />
          <Text variant="meta" className="flex flex-wrap gap-x-3">
            <time dateTime={video.publishedAt}>{formatRelativeAgo(video.publishedAt)}</time>
            {formatViews(video.views) && <span>{formatViews(video.views)}</span>}
          </Text>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" disabled={!prev} onClick={() => prev && onNavigate(prev)} leftIcon={<Icon name="chevronLeft" size={20} />}>
              Nowszy
            </Button>
            <Button variant="outline" disabled={!next} onClick={() => next && onNavigate(next)} rightIcon={<Icon name="chevronRight" size={20} />}>
              Starszy
            </Button>
            <span className="sr-only" aria-live="polite">{video.title}</span>
            <span className="ml-auto flex gap-2">
              <Button href={video.url} variant="soft" rightIcon={<Icon name="externalLink" size={18} />}>
                YouTube
              </Button>
              <ShareButton title={video.title} />
            </span>
          </div>
          <p className="hidden text-sm text-ink-muted sm:block">Wskazówka: strzałki ← → przełączają filmy.</p>
          {video.description.trim() && (
            <Description text={video.description.trim()} className="max-h-72 overflow-y-auto pr-2 text-ink-muted" />
          )}
        </div>
      )}
    </Dialog>
  );
}
