import { useState } from "react";
import { paths } from "@/app/routes";
import type { Video } from "@/data/schemas";
import { useVideos } from "@/features/media/api";
import { formatDate } from "@/lib/dates";
import {
  Card,
  Container,
  Dialog,
  EmptyState,
  ErrorState,
  Icon,
  RevealGroup,
  RevealItem,
  Section,
  Skeleton,
  SmartImage,
  YouTubeEmbed,
} from "@/ui";

function VideoCard({ video, onOpen }: { video: Video; onOpen: () => void }) {
  return (
    <Card interactive className="h-full">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="group/video flex h-full w-full flex-col rounded-card text-left"
      >
        <span className="relative block overflow-hidden rounded-t-card">
          <SmartImage
            src={video.thumbnailUrl}
            alt=""
            aspect="16/9"
            zoomOnHover
            className="w-full"
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center bg-navy/10 transition-colors group-hover/video:bg-navy/30"
          >
            <span className="grid size-14 place-items-center rounded-full bg-accent-strong text-white shadow-lift transition-transform duration-300 group-hover/video:scale-110">
              <Icon name="play" size={26} />
            </span>
          </span>
        </span>
        <span className="flex flex-1 flex-col gap-1 p-4">
          <span className="line-clamp-2 font-display text-base font-bold leading-snug text-navy">{video.title}</span>
          <span className="text-sm text-ink-muted">
            <span className="sr-only">Opublikowano: </span>
            {formatDate(video.publishedAt)}
          </span>
          <span className="sr-only">Odtwórz film</span>
        </span>
      </button>
    </Card>
  );
}

export function VideosSection() {
  const { data, isPending, isError, refetch } = useVideos(4);
  const [active, setActive] = useState<Video | null>(null);
  return (
    <Container>
      <Section
        title="Z kanału YouTube"
        eyebrow="Media"
        action={{ label: "Wszystkie filmy", to: paths.media }}
      >
        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Ładowanie filmów">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-60 rounded-card" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Nie udało się wczytać filmów." onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <EmptyState icon="video" title="Brak filmów" />
        ) : (
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((v) => (
              <RevealItem key={v.id}>
                <VideoCard video={v} onOpen={() => setActive(v)} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Section>
      <Dialog open={!!active} onClose={() => setActive(null)} title={active?.title ?? "Film"} size="xl">
        {active && <YouTubeEmbed videoId={active.id} title={active.title} autoplay />}
      </Dialog>
    </Container>
  );
}
