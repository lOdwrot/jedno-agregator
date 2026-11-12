import { Link as RouterLink } from "react-router";
import type { Event } from "@/data/schemas";
import { paths } from "@/app/routes";
import { cn } from "@/lib/cn";
import { formatEventRange } from "@/lib/dates";
import { Badge, Card, Icon, SmartImage } from "@/ui";
import { eventStatus, prettyLocation } from "../utils";

export interface EventCardProps {
  event: Event;
  now?: Date;
  /** Wide horizontal layout on md+ (timeline); stacked otherwise. */
  layout?: "stacked" | "wide";
  className?: string;
}

/** Event card: 16:9 image, author + tag, title, subtitle, date and location. Whole card is one link. */
export function EventCard({ event, now, layout = "stacked", className }: EventCardProps) {
  const status = eventStatus(event, now);
  const wide = layout === "wide";
  return (
    <Card as="article" tilt className={cn("h-full overflow-hidden", className)}>
      <div className={cn("flex h-full flex-col", wide && "md:flex-row")}>
        <SmartImage
          src={event.imageUrl ?? event.thumbnailUrl}
          alt=""
          aspect="16/9"
          srcSetWidths={[320, 640, 960]}
          sizes={
            wide
              ? "(min-width: 768px) 320px, 100vw"
              : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          }
          zoomOnHover
          className={cn("w-full shrink-0", wide && "md:w-[42%] md:self-stretch")}
          style={{ viewTransitionName: `event-${event.id}` }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-ink-muted">
            {event.author && <span className="font-semibold">{event.author}</span>}
            {event.tag && <Badge tone="accent">{event.tag}</Badge>}
            {status === "live" && <Badge tone="success">Trwa teraz</Badge>}
          </div>
          <h3 className="font-display text-xl leading-snug font-extrabold text-navy">
            <RouterLink
              to={paths.eventDetail(event.id)}
              viewTransition
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {event.title}
            </RouterLink>
          </h3>
          {event.subtitle && <p className="text-base text-ink-muted">{event.subtitle}</p>}
          <ul className="mt-auto flex flex-col gap-1.5 pt-2 text-sm font-semibold text-ink">
            <li className="flex items-start gap-2">
              <Icon name="calendar" size={18} className="mt-0.5 shrink-0 text-accent-ink" />
              <span>{formatEventRange(event.start, event.end)}</span>
            </li>
            {event.location && (
              <li className="flex items-start gap-2">
                <Icon name="mapPin" size={18} className="mt-0.5 shrink-0 text-accent-ink" />
                <span className="min-w-0">{prettyLocation(event.location)}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}
