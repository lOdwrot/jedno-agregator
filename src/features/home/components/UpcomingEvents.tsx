import { paths } from "@/app/routes";
import { useUpcomingEvents } from "@/features/events/api";
import { parseISO } from "@/lib/dates";
import { Carousel, Container, EmptyState, ErrorState, Icon, Section, Skeleton } from "@/ui";
import { formatCountdown } from "../countdown";
import { useNow } from "../useNow";
import { EventCard } from "./EventCard";

const SLIDE = "w-[88%] sm:w-[48%] lg:w-[32%] xl:w-[28%]";

function Countdown({ start, title }: { start: string; title: string }) {
  const now = useNow();
  return (
    <p className="mb-4 inline-flex max-w-full items-center gap-2 rounded-pill bg-navy px-4 py-2 text-sm font-semibold text-white">
      <Icon name="clock" size={18} className="shrink-0 text-logo-yellow" />
      <span className="truncate">
        <span className="font-extrabold">{formatCountdown(parseISO(start).getTime(), now)}</span>{" "}
        do: {title}
      </span>
    </p>
  );
}

export function UpcomingEvents() {
  const { data, isPending, isError, refetch } = useUpcomingEvents(8);
  return (
    <Container>
      <Section
        title="Najbliższe wydarzenia"
        eyebrow="Kalendarz"
        action={{ label: "Wszystkie wydarzenia", to: paths.events }}
      >
        {isPending ? (
          <div className="flex gap-4 overflow-hidden" role="status" aria-label="Ładowanie wydarzeń">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className={`h-28 shrink-0 rounded-card ${SLIDE}`} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Nie udało się wczytać wydarzeń." onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Brak nadchodzących wydarzeń"
            description="Zajrzyj tu wkrótce."
          />
        ) : (
          <>
            {data[0] && <Countdown start={data[0].start} title={data[0].title} />}
            <Carousel label="Najbliższe wydarzenia" slideClassName={SLIDE}>
              {data.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </Carousel>
          </>
        )}
      </Section>
    </Container>
  );
}
