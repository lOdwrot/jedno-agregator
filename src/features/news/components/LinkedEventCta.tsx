import { Button, Card, Eyebrow, Heading, Icon, Text } from "@/ui";
import { paths } from "@/app/routes";
import { formatEventRange } from "@/lib/dates";
import { useEvent } from "@/features/events/api";

/** Prominent call to action linking a news item to its event. */
export function LinkedEventCta({ eventId }: { eventId: number }) {
  const { data: event } = useEvent(eventId);
  return (
    <Card className="relative overflow-hidden bg-navy p-6 text-white sm:p-8">
      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-accent/30 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Eyebrow className="text-white/70">Wydarzenie</Eyebrow>
          <Heading level={2} size="md" tone="light" className="mt-1">
            {event ? event.title : "To ogłoszenie dotyczy wydarzenia"}
          </Heading>
          {event && (
            <Text className="mt-1 flex items-center gap-2 text-white/80">
              <Icon name="calendar" size={18} />
              {formatEventRange(event.start, event.end)}
            </Text>
          )}
        </div>
        <Button to={paths.eventDetail(eventId)} variant="solid" size="lg" rightIcon={<Icon name="arrowRight" size={20} />}>
          Przejdź do wydarzenia
        </Button>
      </div>
    </Card>
  );
}
