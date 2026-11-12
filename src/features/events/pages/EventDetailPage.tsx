import { useParams } from "react-router";
import { paths } from "@/app/routes";
import { usePageTitle } from "@/lib/seo";
import {
  Badge,
  Button,
  Container,
  EmptyState,
  ErrorState,
  Link,
  Reveal,
  RichText,
  Section,
  Skeleton,
  SmartImage,
} from "@/ui";
import { useEvent, useEvents } from "../api";
import { EventCard } from "../components/EventCard";
import { EventInfoPanel } from "../components/EventInfoPanel";

function BackLink() {
  return (
    <Link to={paths.events} quiet className="inline-flex min-h-11 items-center gap-1">
      <span aria-hidden>←</span>
      <span>Wydarzenia</span>
      <span className="sr-only">– wróć do listy</span>
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-hidden>
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-video w-full rounded-card" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-80 w-full rounded-card" />
    </div>
  );
}

export function EventDetailPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const query = useEvent(Number.isFinite(numericId) ? numericId : -1);
  const all = useEvents();
  const event = query.data ?? null;
  usePageTitle(event ? event.title : query.isLoading ? "Wydarzenie" : "Nie znaleziono wydarzenia");

  const others = (all.data ?? []).filter((e) => e.id !== event?.id).slice(0, 3);

  return (
    <Container className="pb-16 pt-4 sm:pt-8">
      <BackLink />
      <div className="mt-3">
        {query.isLoading ? (
          <>
            <h1 className="sr-only">Ładowanie wydarzenia…</h1>
            <DetailSkeleton />
          </>
        ) : query.isError ? (
          <>
            <h1 className="sr-only">Błąd ładowania wydarzenia</h1>
            <ErrorState message="Nie udało się pobrać wydarzenia." onRetry={() => void query.refetch()} />
          </>
        ) : !event ? (
          <>
            <h1 className="sr-only">Nie znaleziono wydarzenia</h1>
            <EmptyState
              icon="calendar"
              title="Nie znaleźliśmy tego wydarzenia"
              description="Mogło się już zakończyć i zniknąć z listy albo link jest nieprawidłowy."
              action={
                <Button to={paths.events} variant="navy" className="mt-2">
                  Zobacz nadchodzące wydarzenia
                </Button>
              }
            />
          </>
        ) : (
          <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <header className="lg:col-start-1 lg:row-start-1">
              <div className="overflow-hidden rounded-card bg-surface shadow-card">
                <SmartImage
                  src={event.imageUrl ?? event.thumbnailUrl}
                  alt=""
                  aspect="16/9"
                  priority
                  srcSetWidths={[480, 800, 1200, 1600]}
                  sizes="(min-width: 1024px) 760px, 100vw"
                  style={{ viewTransitionName: `event-${event.id}` }}
                />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
                {event.author && <span className="font-bold">{event.author}</span>}
                {event.tag && <Badge tone="accent">{event.tag}</Badge>}
              </div>
              <Reveal>
                <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-navy sm:text-4xl lg:text-5xl">{event.title}</h1>
              </Reveal>
              {event.subtitle && <p className="mt-3 text-xl text-ink-muted sm:text-2xl">{event.subtitle}</p>}
            </header>

            <aside aria-label="Informacje o wydarzeniu" className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
              <EventInfoPanel event={event} />
            </aside>

            {event.html && (
              <div className="rounded-card bg-surface p-5 shadow-card sm:p-8 lg:col-start-1 lg:row-start-2">
                <RichText html={event.html} />
              </div>
            )}
          </div>
        )}
      </div>

      {event && others.length > 0 && (
        <Section title="Inne nadchodzące wydarzenia" className="mt-14" action={{ label: "Wszystkie wydarzenia", to: paths.events }}>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {others.map((e) => (
              <li key={e.id}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </Container>
  );
}
