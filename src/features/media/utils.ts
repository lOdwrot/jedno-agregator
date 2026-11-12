import type { Video } from "@/data/schemas";

const compact = new Intl.NumberFormat("pl", { notation: "compact", maximumFractionDigits: 1 });

function viewsNoun(n: number): string {
  if (n === 1) return "wyświetlenie";
  const last = n % 10;
  const lastTwo = n % 100;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return "wyświetlenia";
  return "wyświetleń";
}

/** 1234 -> "1,2 tys. wyświetleń"; null -> null. */
export function formatViews(views: number | null | undefined): string | null {
  if (views == null) return null;
  const compactForm = views >= 1000;
  const noun = compactForm ? "wyświetleń" : viewsNoun(views);
  return `${compactForm ? compact.format(views) : String(views)} ${noun}`;
}

/** Series prefix: "ŻycioRYSY Świętych | …" -> "ŻycioRYSY Świętych", "100NA100 #063 …" -> "100NA100". */
export function parseSeries(title: string): string | null {
  const m = /^(.{2,40}?)\s*(?:\||#\d)/.exec(title.trim());
  const name = m?.[1]?.trim();
  return name ? name : null;
}

/** Series that have at least `min` videos, most numerous first. */
export function deriveSeries(
  videos: Pick<Video, "title">[],
  min = 2,
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const v of videos) {
    const s = parseSeries(v.title);
    if (s) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, c]) => c >= min)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pl"));
}

const fold = (s: string) =>
  s.toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/\p{M}/gu, "");

/** Case- and diacritics-insensitive title search plus optional series filter. */
export function filterVideos<T extends Pick<Video, "title">>(
  videos: T[],
  query: string,
  series: string | null,
): T[] {
  const q = fold(query.trim());
  return videos.filter(
    (v) => (!series || parseSeries(v.title) === series) && (!q || fold(v.title).includes(q)),
  );
}

export type TextPart =
  { type: "text"; text: string } | { type: "link"; text: string; href: string };

/** Splits plain text into text/link parts. Only http(s) URLs become links; trailing punctuation is excluded. */
export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const re = /https?:\/\/[^\s<>"]+/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    let url = m[0];
    const trail = /[.,;:!?)\]]+$/.exec(url);
    if (trail) url = url.slice(0, -trail[0].length);
    const start = m.index;
    if (start > last) parts.push({ type: "text", text: text.slice(last, start) });
    parts.push({ type: "link", text: url, href: url });
    last = start + url.length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts;
}

/** Short excerpt for the first paragraph(s) of a description. */
export function excerpt(text: string, max = 220): string {
  const clean = text.split(/\n\s*\n/)[0]?.trim() ?? "";
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
