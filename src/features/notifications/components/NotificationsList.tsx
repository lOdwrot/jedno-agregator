import { useMemo } from "react";
import { useNavigate } from "react-router";
import type { Notification } from "@/data/schemas";
import { formatTime, groupLabelShowsTime } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { Badge, Icon } from "@/ui";
import { groupNotifications, notificationPath } from "../grouping";
import { isNewer } from "../useLastSeenNotification";

export interface NotificationsListProps {
  items: readonly Notification[];
  /** Items published after this ISO time get the "Nowe" accent. */
  lastSeen?: string | null;
  /** Called after an interactive item is chosen (e.g. to close a sheet). */
  onNavigate?: () => void;
  className?: string;
}

/** Announcements grouped by day, like the mobile app. Items with a target are links. */
export function NotificationsList({ items, lastSeen = null, onNavigate, className }: NotificationsListProps) {
  const navigate = useNavigate();
  const groups = useMemo(() => groupNotifications(items), [items]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {groups.map((g) => (
        <section key={g.label} aria-label={g.label}>
          <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-ink-muted">{g.label}</h3>
          <ul className="flex flex-col gap-2.5">
            {g.items.map((n) => {
              const fresh = isNewer(n.publishDate, lastSeen);
              const path = notificationPath(n);
              const body = (
                <>
                  {fresh && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-accent" />}
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold leading-snug text-navy">{n.title}</span>
                      {fresh && <Badge tone="accent">Nowe</Badge>}
                    </span>
                    {n.description && <span className="text-sm leading-snug text-ink-muted">{n.description}</span>}
                    {groupLabelShowsTime(n.publishDate) && (
                      <time dateTime={n.publishDate} className="mt-1 text-xs font-semibold text-ink-muted">
                        {formatTime(n.publishDate)}
                      </time>
                    )}
                  </span>
                  {path && <Icon name="chevronRight" size={20} className="mt-0.5 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5" />}
                </>
              );
              const cls = cn(
                "group relative flex w-full items-start gap-3 rounded-card bg-surface px-4 py-3.5 text-left shadow-card",
                fresh && "bg-accent-soft/60",
              );
              return (
                <li key={n.id}>
                  {path ? (
                    <button
                      type="button"
                      className={cn(cls, "min-h-11 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink motion-reduce:hover:translate-y-0")}
                      onClick={() => {
                        onNavigate?.();
                        void navigate(path);
                      }}
                    >
                      {body}
                    </button>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
