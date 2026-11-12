import { paths } from "@/app/routes";
import type { Notification } from "@/data/schemas";
import { formatRelativeGroup } from "@/lib/dates";

export function notificationPath(n: Notification): string | null {
  if (!n.target) return null;
  return n.target.kind === "news" ? paths.newsDetail(n.target.id) : paths.eventDetail(n.target.id);
}

export interface NotificationGroup {
  label: string;
  items: Notification[];
}

/** Groups (already newest-first) notifications by relative day label, preserving order. */
export function groupNotifications(
  items: readonly Notification[],
  now: Date = new Date(),
): NotificationGroup[] {
  const groups: NotificationGroup[] = [];
  for (const n of items) {
    const label = formatRelativeGroup(n.publishDate, now);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(n);
    else groups.push({ label, items: [n] });
  }
  return groups;
}
