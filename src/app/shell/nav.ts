import { paths } from "@/app/routes";
import type { IconName } from "@/ui";

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** Hidden from the mobile bottom tab bar (still in header, menu and footer). */
  secondary?: boolean;
}

/** Primary navigation (header on desktop, bottom tab bar on mobile). */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: paths.home, label: "Start", icon: "home" },
  { to: paths.news, label: "Aktualności", icon: "newspaper" },
  { to: paths.events, label: "Wydarzenia", icon: "calendar" },
  { to: paths.communities, label: "Społeczności", icon: "users" },
  { to: paths.media, label: "Media", icon: "video" },
  { to: paths.games, label: "Gry", icon: "gamepad", secondary: true },
];

/** Items of the mobile bottom tab bar (max 5 so labels stay readable at 360px). */
export const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) => !item.secondary);

/** Whether `to` is the current section for `pathname` (detail pages keep their section active). */
export function isNavActive(pathname: string, to: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (to === "/") return p === "/";
  return p === to || p.startsWith(`${to}/`);
}
