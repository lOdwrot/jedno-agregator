import { paths } from "@/app/routes";
import type { Event } from "@/data/schemas";
import { formatEventChip } from "@/lib/dates";
import { Card, DatePill, Icon, SmartImage } from "@/ui";

/** Compact event card like the app: 72px thumbnail, date pill, 2-line title. */
export function EventCard({ event }: { event: Event }) {
  const img = event.thumbnailUrl ?? event.imageUrl;
  return (
    <Card to={paths.eventDetail(event.id)} tilt className="h-full">
      <div className="flex gap-3 p-3">
        <SmartImage
          src={img}
          alt=""
          aspect="1/1"
          srcSetWidths={[144, 216]}
          sizes="72px"
          className="size-[72px] shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <DatePill>{formatEventChip(event.start, event.end)}</DatePill>
          <h3 className="mt-1.5 line-clamp-2 font-display text-base font-bold leading-snug text-navy">{event.title}</h3>
          {event.location && (
            <p className="mt-1 flex items-center gap-1 truncate text-sm text-ink-muted">
              <Icon name="mapPin" size={14} className="shrink-0" />
              <span className="truncate">{event.location}</span>
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
