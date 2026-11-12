import { useState } from "react";
import type { Video } from "@/data/schemas";
import { formatRelativeAgo } from "@/lib/dates";
import { Badge, Button, Heading, Icon, Reveal, ShareButton, Text, YouTubeEmbed } from "@/ui";
import { excerpt, formatViews, parseSeries } from "../utils";
import { Description } from "./Description";

/** Latest video: large lite player beside title, meta and expandable description. */
export function FeaturedVideo({ video }: { video: Video }) {
  const [open, setOpen] = useState(false);
  const series = parseSeries(video.title);
  const views = formatViews(video.views);
  const short = excerpt(video.description, 240);
  const hasMore = short !== video.description.trim();

  return (
    <Reveal>
      <article
        aria-labelledby="featured-title"
        className="grid gap-6 rounded-card bg-surface p-3 shadow-card sm:p-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8 lg:p-5"
      >
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute -inset-1 -z-10 rotate-1 rounded-card bg-linear-to-br from-logo-orange/30 via-logo-yellow/20 to-logo-blue/30 blur-xl"
          />
          <YouTubeEmbed
            key={video.id}
            videoId={video.id}
            title={video.title}
            className="shadow-lift"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-4 pb-2 lg:pr-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Najnowszy film</Badge>
            {series && <Badge tone="navy">{series}</Badge>}
          </div>
          <Heading level={2} size="lg" id="featured-title">
            {video.title}
          </Heading>
          <Text variant="meta" className="flex flex-wrap gap-x-3">
            <time dateTime={video.publishedAt}>{formatRelativeAgo(video.publishedAt)}</time>
            {views && <span>{views}</span>}
          </Text>
          {video.description.trim() && (
            <div>
              <div id="featured-desc" className={open ? "" : "line-clamp-4"}>
                <Description
                  text={open ? video.description.trim() : short}
                  className="text-ink-muted"
                />
              </div>
              {hasMore && (
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls="featured-desc"
                  onClick={() => setOpen((o) => !o)}
                  className="mt-2 inline-flex min-h-11 items-center gap-1 font-bold text-accent-ink hover:text-navy"
                >
                  {open ? "Zwiń" : "Rozwiń"}
                  <Icon
                    name="chevronDown"
                    size={18}
                    className={open ? "rotate-180 transition-transform" : "transition-transform"}
                  />
                </button>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button href={video.url} size="lg" rightIcon={<Icon name="externalLink" size={20} />}>
              Oglądaj na YouTube
            </Button>
            <ShareButton title={video.title} size="lg" />
          </div>
        </div>
      </article>
    </Reveal>
  );
}
