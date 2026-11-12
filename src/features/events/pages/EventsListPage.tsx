import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { usePageTitle } from "@/lib/seo";
import { Button, Container, EmptyState, ErrorState, Icon, PageHeader, Skeleton, Tabs } from "@/ui";
import { filterEvents, useEventFilterOptions, useEvents } from "../api";
import { EventsCalendar } from "../components/EventsCalendar";
import { InlineFilters, MobileFilters, type FilterValues } from "../components/EventsFilters";
import { EventsTimeline } from "../components/EventsTimeline";
import { NextEventHighlight } from "../components/NextEventHighlight";
import { countThisWeek, eventsCountLabel } from "../utils";

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <Skeleton className="h-40 w-full rounded-card" />
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-card" />
        <Skeleton className="h-72 w-full rounded-card" />
      </div>
    </div>
  );
}

export function EventsListPage() {
  usePageTitle("Wydarzenia");
  const [params, setParams] = useSearchParams();
  const tag = params.get("kategoria") ?? "";
  const author = params.get("autor") ?? "";
  const view = params.get("widok") === "kalendarz" ? "kalendarz" : "os-czasu";

  const query = useEvents();
  const options = useEventFilterOptions();
  const now = useMemo(() => new Date(), [query.dataUpdatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const all = query.data;
  const filtered = useMemo(() => (all ? filterEvents(all, { tag, author }, now) : []), [all, tag, author, now]);
  const tags = options.data?.tags ?? [];
  const authors = options.data?.authors ?? [];

  const update = (next: FilterValues) => {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next.tag) p.set("kategoria", next.tag);
        else p.delete("kategoria");
        if (next.author) p.set("autor", next.author);
        else p.delete("autor");
        return p;
      },
      { replace: true },
    );
  };
  const setView = (v: string) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (v === "kalendarz") p.set("widok", "kalendarz");
        else p.delete("widok");
        return p;
      },
      { replace: true },
    );

  const hasFilters = Boolean(tag || author);
  const filterProps = { tags, authors, value: { tag, author }, onChange: update };
  const next = all?.[0] ?? null;

  return (
    <Container className="pb-16">
      <PageHeader
        title="Wydarzenia"
        accent="w archidiecezji"
        description="Rekolekcje, koncerty, uwielbienia i spotkania wspólnot — wszystko w jednym miejscu."
        actions={<MobileFilters {...filterProps} />}
      />

      {query.isLoading ? (
        <ListSkeleton />
      ) : query.isError ? (
        <ErrorState message="Nie udało się pobrać wydarzeń." onRetry={() => void query.refetch()} />
      ) : (
        <div className="flex flex-col gap-6">
          {next && !hasFilters && <NextEventHighlight next={next} weekCount={countThisWeek(all ?? [], now)} />}

          <div className="flex flex-wrap items-end justify-between gap-4">
            <InlineFilters {...filterProps} />
            <p role="status" aria-live="polite" className="text-sm font-semibold text-ink-muted">
              {filtered.length === 0 ? "Brak wydarzeń" : `Znaleziono: ${eventsCountLabel(filtered.length)}`}
              {hasFilters && " (filtry aktywne)"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon="calendar"
              title={hasFilters ? "Brak wydarzeń dla wybranych filtrów" : "Brak nadchodzących wydarzeń"}
              description={hasFilters ? "Spróbuj wybrać inną kategorię lub autora." : "Zajrzyj tu wkrótce — nowe wydarzenia pojawiają się regularnie."}
              action={
                hasFilters ? (
                  <Button variant="navy" className="mt-2" onClick={() => update({ tag: "", author: "" })} leftIcon={<Icon name="close" size={18} />}>
                    Wyczyść filtry
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Tabs
              label="Widok wydarzeń"
              value={view}
              onChange={setView}
              items={[
                { value: "os-czasu", label: "Oś czasu", icon: <Icon name="list" size={18} />, content: <EventsTimeline events={filtered} now={now} /> },
                { value: "kalendarz", label: "Kalendarz", icon: <Icon name="calendar" size={18} />, content: <EventsCalendar events={filtered} tags={tags} now={now} /> },
              ]}
            />
          )}
        </div>
      )}
    </Container>
  );
}
