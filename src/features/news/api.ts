/** Data hooks for news ("Aktualności"). Source: public/data/news.json + meta.json. */
import { useSnapshot } from "@/data/useSnapshot";
import type { News } from "@/data/schemas";

export type NewsFilters = { author?: string | null };

export function filterNews(items: News[], { author }: NewsFilters): News[] {
  return author ? items.filter((n) => n.author === author) : items;
}

/** All news, newest first (sorted by the fetch script), optionally filtered by author. */
export function useNewsList(filters: NewsFilters = {}) {
  return useSnapshot("news", { select: (items) => filterNews(items, filters) });
}

/** Latest `limit` news items. */
export function useLatestNews(limit: number) {
  return useSnapshot("news", { select: (items) => items.slice(0, limit) });
}

/** Single news item by id (undefined in `data` when not found). */
export function useNewsItem(id: number) {
  return useSnapshot("news", { select: (items) => items.find((n) => n.id === id) ?? null });
}

/** Author names for the filter (from /api/news/authors). */
export function useNewsAuthors() {
  return useSnapshot("meta", { select: (m) => m.newsAuthors });
}
