import { paths } from "@/app/routes";
import { useEvents } from "@/features/events/api";
import { useNewsList } from "@/features/news/api";
import { usePartners } from "@/features/communities/api";
import { useVideos } from "@/features/media/api";
import {
  AnimatedBlobs,
  BrushUnderline,
  Button,
  Container,
  Counter,
  Grain,
  Heading,
  Icon,
  JednoLogo,
  Parallax,
  Skeleton,
  SplitText,
  Spotlight,
  useMediaQuery,
} from "@/ui";

function Stat({
  value,
  label,
  loading,
}: {
  value: number | undefined;
  label: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-card bg-surface/80 px-4 py-3 shadow-card backdrop-blur">
      <dt className="order-2 text-sm font-semibold text-ink-muted">{label}</dt>
      <dd className="font-display text-3xl leading-none font-extrabold text-navy sm:text-4xl">
        {loading || value === undefined ? (
          <Skeleton className="h-9 w-12" />
        ) : (
          <Counter value={value} />
        )}
      </dd>
    </div>
  );
}

export function Hero() {
  const events = useEvents();
  const news = useNewsList();
  const partners = usePartners();
  const videos = useVideos();
  const wide = useMediaQuery("(min-width: 1024px)");

  return (
    <Spotlight className="relative isolate overflow-hidden bg-canvas">
      <AnimatedBlobs />
      <Grain opacity={0.05} />
      <Container className="relative grid items-center gap-8 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:grid-cols-[1.5fr_1fr] lg:gap-12 lg:pt-20 lg:pb-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-pill bg-surface px-3 py-1.5 text-sm font-bold text-accent-ink shadow-card">
            <Icon name="sparkle" size={16} />
            Archidiecezja Gdańska
          </p>
          <Heading level={1} size="hero" className="leading-[1.02]">
            <SplitText text="Wszystko, co dzieje się w" delay={0.1} />{" "}
            <span className="font-serif font-normal text-accent-ink italic">
              <BrushUnderline strokeClassName="text-logo-yellow">Kościele gdańskim</BrushUnderline>
            </span>{" "}
            <SplitText text="— w jednym miejscu" delay={0.45} />
          </Heading>
          <p className="mt-5 max-w-xl text-lg text-ink-muted sm:text-xl">
            Aktualności, wydarzenia, wspólnoty i nagrania archidiecezji w jednym, przejrzystym
            serwisie — tak jak w aplikacji Jedno.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              to={paths.events}
              size="lg"
              magnetic
              rightIcon={<Icon name="arrowRight" size={20} />}
            >
              Zobacz wydarzenia
            </Button>
            <Button to={paths.news} size="lg" variant="navy">
              Najnowsze aktualności
            </Button>
          </div>
          <dl className="mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={events.data?.length} label="wydarzeń" loading={events.isPending} />
            <Stat value={news.data?.length} label="aktualności" loading={news.isPending} />
            <Stat value={partners.data?.length} label="społeczności" loading={partners.isPending} />
            <Stat value={videos.data?.length} label="filmów" loading={videos.isPending} />
          </dl>
        </div>
        <div className="order-first flex justify-center lg:order-last">
          <Parallax distance={40}>
            <JednoLogo variant="mark" animated size={wide ? 300 : 84} title="Jedno — logo" />
          </Parallax>
        </div>
      </Container>
    </Spotlight>
  );
}
