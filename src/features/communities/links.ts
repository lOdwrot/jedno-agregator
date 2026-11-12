export interface ExtractedLink {
  href: string;
  label: string;
}

/** Collects unique http(s)/mailto/tel links from CMS HTML (used for the "Linki" list in the dialog). */
export function extractLinks(html: string): ExtractedLink[] {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const seen = new Set<string>();
  const out: ExtractedLink[] = [];
  doc.querySelectorAll("a[href]").forEach((a) => {
    const href = (a.getAttribute("href") ?? "").trim();
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(href) || seen.has(href)) return;
    seen.add(href);
    const text = (a.textContent ?? "").replace(/\s+/g, " ").trim();
    out.push({ href, label: text || href.replace(/^(https?:\/\/|mailto:|tel:)/i, "").replace(/\/$/, "") });
  });
  return out;
}

export function pluralCommunities(n: number): string {
  return n === 1 ? "społeczność" : "społeczności";
}
