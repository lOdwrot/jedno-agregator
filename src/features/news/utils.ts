import { stripHtml } from "@/lib/html";
import { paths } from "@/app/routes";
import type { News } from "@/data/schemas";

/** Event aliases open the event page with the same id. */
export const newsHref = (n: Pick<News, "id" | "isEventAlias">): string =>
  n.isEventAlias ? paths.eventDetail(n.id) : paths.newsDetail(n.id);

export const PAGE_SIZE = 12;

/** Estimated reading time in whole minutes (min 1) at ~200 words/min. */
export function readingMinutes(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** "1 min czytania", "3 min czytania" */
export const formatReadingTime = (html: string): string => `${readingMinutes(html)} min czytania`;

/** Polish plural for "aktualność": 1 aktualność, 2-4 aktualności, 5+ aktualności... */
export function newsCountLabel(n: number): string {
  if (n === 0) return "Nie znaleziono aktualności";
  if (n === 1) return "Znaleziono 1 aktualność";
  return `Znaleziono ${n} aktualności`;
}

/** Items visible after `pages` "show more" steps. */
export function visibleSlice<T>(items: readonly T[], visible: number): T[] {
  return items.slice(0, Math.max(0, visible));
}
