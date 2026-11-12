const RESIZABLE_HOSTS = new Set(["admin.jedno.net"]);

/**
 * Builds a `srcset` for CMS images that accept `?width=`. Replaces/adds `width`, drops `height`.
 * Returns undefined for other hosts or unparsable URLs.
 */
export function buildSrcSet(src: string, widths: number[]): string | undefined {
  if (!widths.length) return undefined;
  try {
    const base = new URL(src);
    if (!RESIZABLE_HOSTS.has(base.hostname)) return undefined;
    return widths
      .map((w) => {
        const u = new URL(base);
        u.searchParams.delete("height");
        u.searchParams.set("width", String(w));
        return `${u.toString()} ${w}w`;
      })
      .join(", ");
  } catch {
    return undefined;
  }
}
