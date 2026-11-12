import type { Video } from "@/data/schemas";
import { cn } from "@/lib/cn";
import { formatRelativeAgo } from "@/lib/dates";
import { Badge, Icon, SmartImage } from "@/ui";
import { formatViews, parseSeries } from "../utils";

export interface VideoCardProps {
  video: Video;
  onOpen: (video: Video) => void;
  /** Wide bento tile. */
  wide?: boolean;
}

/** Video tile: 16:9 thumbnail with hover zoom, morphing play badge, series badge, meta. */
export function VideoCard({ video, onOpen, wide }: VideoCardProps) {
  const series = parseSeries(video.title);
  const views = formatViews(video.views);
  return (
    <li className={cn("min-w-0", wide && "sm:col-span-2")}>
      <button
        type="button"
        onClick={() => onOpen(video)}
        aria-haspopup="dialog"
        className="group flex size-full cursor-pointer flex-col overflow-hidden rounded-card bg-surface text-left shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <span className="relative block overflow-hidden">
          <SmartImage
            src={video.thumbnailUrl}
            alt=""
            aspect={wide ? "16/9" : "16/9"}
            zoomOnHover
            sizes={wide ? "(min-width:1024px) 640px, 100vw" : "(min-width:1024px) 400px, 100vw"}
          />
          <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-navy/70 via-navy/5 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
          <span
            aria-hidden="true"
            className="absolute bottom-3 left-3 flex items-center overflow-hidden rounded-full bg-accent-strong text-white shadow-lift transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none"
          >
            <span className="grid size-11 place-items-center">
              <Icon name="play" size={22} className="ml-0.5 fill-current" />
            </span>
            <span className="max-w-0 whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 group-hover:max-w-24 group-hover:pr-4 group-hover:opacity-100 group-focus-visible:max-w-24 group-focus-visible:pr-4 group-focus-visible:opacity-100 motion-reduce:transition-none">
              Oglądaj
            </span>
          </span>
          {series && (
            <Badge tone="navy" className="absolute right-3 top-3 shadow-card">
              {series}
            </Badge>
          )}
        </span>
        <span className="flex flex-1 flex-col gap-2 p-4">
          <span className={cn("line-clamp-2 font-display font-bold leading-snug text-navy", wide ? "text-xl" : "text-base")}>
            {video.title}
          </span>
          <span className="mt-auto flex flex-wrap gap-x-3 text-sm text-ink-muted">
            <time dateTime={video.publishedAt}>{formatRelativeAgo(video.publishedAt)}</time>
            {views && <span>{views}</span>}
          </span>
        </span>
      </button>
    </li>
  );
}
