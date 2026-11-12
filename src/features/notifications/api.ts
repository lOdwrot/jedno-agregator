/** Data hooks for announcements ("Ogłoszenia" = API notifications, last 30 days, newest first). */
import { useSnapshot } from "@/data/useSnapshot";

export function useNotifications() {
  return useSnapshot("notifications");
}
