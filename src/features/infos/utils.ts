import { stripHtml } from "@/lib/html";

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;

/** First e-mail address found in the (HTML) text, or null. Checks mailto: links first. */
export function findEmail(html: string): string | null {
  const mailto = /mailto:([^"'?\s>]+)/i.exec(html);
  if (mailto?.[1] && EMAIL_RE.test(mailto[1])) return decodeURIComponent(mailto[1]);
  return EMAIL_RE.exec(stripHtml(html))?.[0] ?? null;
}
