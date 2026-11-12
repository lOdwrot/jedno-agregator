import { paths } from "@/app/routes";
import type { IconName } from "@/ui";

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

/** Primary navigation (header on desktop, bottom tab bar on mobile). */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: paths.home, label: "Start", icon: "home" },
  { to: paths.news, label: "Aktualności", icon: "newspaper" },
  { to: paths.events, label: "Wydarzenia", icon: "calendar" },
  { to: paths.communities, label: "Społeczności", icon: "users" },
  { to: paths.media, label: "Media", icon: "video" },
];

/** Whether `to` is the current section for `pathname` (detail pages keep their section active). */
export function isNavActive(pathname: string, to: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (to === "/") return p === "/";
  return p === to || p.startsWith(`${to}/`);
}
