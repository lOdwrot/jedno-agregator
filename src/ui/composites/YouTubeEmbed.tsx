import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icons";

export interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
  /** Start playing immediately (skips the facade). */
  autoplay?: boolean;
}

/** Lite YouTube player: thumbnail + play button; the iframe (youtube-nocookie) loads only on click. */
export function YouTubeEmbed({ videoId, title, className, autoplay }: YouTubeEmbedProps) {
  const [active, setActive] = useState(!!autoplay);
  const [hq, setHq] = useState(false);
  const base = "relative aspect-video w-full overflow-hidden rounded-card bg-navy shadow-card";

  if (active) {
    return (
      <div className={cn(base, className)}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }
  return (
    <div className={cn(base, className)}>
      <button
        type="button"
        onClick={() => setActive(true)}
        aria-label={`Odtwórz film: ${title}`}
        className="group absolute inset-0 size-full cursor-pointer"
      >
        <img
          src={`https://i.ytimg.com/vi/${videoId}/${hq ? "hqdefault" : "maxresdefault"}.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={(e) => {
            // YouTube serves a 120px placeholder when maxres does not exist.
            if (!hq && e.currentTarget.naturalWidth <= 120) setHq(true);
          }}
          onError={() => setHq(true)}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-navy/60 via-transparent to-transparent"
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-white shadow-lift transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110 sm:size-20"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/40 motion-reduce:hidden" />
          <Icon name="play" size={32} className="relative ml-1 fill-current" />
        </span>
      </button>
    </div>
  );
}
