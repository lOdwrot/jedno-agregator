import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ErrorState, Icon, IconButton, Sheet, Skeleton, usePrefersReducedMotion } from "@/ui";
import { useNotifications } from "../api";
import { countNew, newestDate, useLastSeenNotification } from "../useLastSeenNotification";
import { NotificationsList } from "./NotificationsList";

/** Bell with unread dot (header) that opens the announcements sheet. */
export function NotificationsBell() {
  const { data, isPending, isError, refetch } = useNotifications();
  const { lastSeen, markSeen } = useLastSeenNotification();
  const [open, setOpen] = useState(false);
  // Keep the "new" highlighting stable while the sheet is open, even after marking as seen.
  const [seenAtOpen, setSeenAtOpen] = useState<string | null>(null);
  const reduce = usePrefersReducedMotion();

  const items = data ?? [];
  const newCount = countNew(items, lastSeen);
  const newest = newestDate(items);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => markSeen(newest), 1500);
    return () => window.clearTimeout(t);
  }, [open, newest, markSeen]);

  const label = newCount > 0 ? `Ogłoszenia (${newCount} nowe)` : "Ogłoszenia";

  return (
    <>
      <IconButton
        label={label}
        badge={newCount > 0}
        aria-haspopup="dialog"
        onClick={() => {
          setSeenAtOpen(lastSeen);
          setOpen(true);
        }}
      >
        <motion.span
          aria-hidden="true"
          className="inline-flex origin-top"
          animate={newCount > 0 && !reduce ? { rotate: [0, 16, -14, 10, -6, 0] } : { rotate: 0 }}
          transition={newCount > 0 && !reduce ? { duration: 0.9, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" } : undefined}
        >
          <Icon name="bell" size={24} />
        </motion.span>
      </IconButton>
      <Sheet open={open} onClose={() => setOpen(false)} title="Ogłoszenia" description="Z ostatnich 30 dni">
        {isPending ? (
          <div role="status" className="flex flex-col gap-3">
            <span className="sr-only">Ładowanie ogłoszeń…</span>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-card" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Nie udało się pobrać ogłoszeń." onRetry={() => void refetch()} className="shadow-none" />
        ) : items.length === 0 ? (
          <p className="py-10 text-center font-semibold text-ink-muted">Brak ogłoszeń z ostatnich 30 dni</p>
        ) : (
          <NotificationsList items={items} lastSeen={seenAtOpen} onNavigate={() => setOpen(false)} />
        )}
      </Sheet>
    </>
  );
}
