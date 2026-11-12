import type { Event } from "@/data/schemas";
import { downloadIcs, googleCalendarUrl } from "@/lib/ics";
import { formatEventRange } from "@/lib/dates";
import { Badge, Button, Divider, Icon, ShareButton } from "@/ui";
import { useNow } from "../useNow";
import { eventStatus, mapsUrl, prettyLocation, statusText } from "../utils";

/** Sticky info panel: when, countdown, add to calendar, where, share. */
export function EventInfoPanel({ event }: { event: Event }) {
  const now = useNow(30_000);
  const status = eventStatus(event, now);
  const maps = mapsUrl(event);
  return (
    <div className="flex flex-col gap-5 rounded-card bg-surface p-5 shadow-card sm:p-6">
      <Badge tone={status === "live" ? "success" : status === "ended" ? "neutral" : "accent"} className="self-start text-sm">
        <Icon name="clock" size={16} />
        <span role="status">{statusText(event, now)}</span>
      </Badge>

      <div className="flex items-start gap-3">
        <Icon name="calendar" size={22} className="mt-0.5 shrink-0 text-accent-ink" />
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-ink-muted">Termin</p>
          <p className="text-lg font-bold text-navy">{formatEventRange(event.start, event.end)}</p>
        </div>
      </div>

      {status !== "ended" && (
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-muted">Dodaj do kalendarza</p>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button variant="navy" fullWidth leftIcon={<Icon name="calendarPlus" size={20} />} onClick={() => downloadIcs(event)}>
              Pobierz plik .ics
            </Button>
            <Button variant="outline" fullWidth href={googleCalendarUrl(event)} rightIcon={<Icon name="externalLink" size={18} />}>
              Google Calendar
            </Button>
          </div>
        </div>
      )}

      {event.location && (
        <>
          <Divider />
          <div className="flex items-start gap-3">
            <Icon name="mapPin" size={22} className="mt-0.5 shrink-0 text-accent-ink" />
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide text-ink-muted">Miejsce</p>
              <p className="text-lg font-bold text-navy">{prettyLocation(event.location)}</p>
              {maps && (
                <Button variant="link" href={maps} className="mt-1 px-0" rightIcon={<Icon name="arrowUpRight" size={16} />}>
                  Otwórz w mapach
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      <Divider />
      <ShareButton title={event.title} text={`${event.title} — ${formatEventRange(event.start, event.end)}`} fullWidth leftIcon={<Icon name="share" size={20} />}>
        Udostępnij
      </ShareButton>
    </div>
  );
}
