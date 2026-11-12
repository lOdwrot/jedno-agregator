import DOMPurify from "dompurify";

export type RichSegment =
  { type: "html"; html: string } | { type: "youtube"; videoId: string; title: string };

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);
const ID_RE = /^[\w-]{11}$/;

/** Extracts the 11-char video id from any common YouTube URL form, else null. */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url.trim(), "https://www.youtube.com");
  } catch {
    return null;
  }
  if (!YT_HOSTS.has(u.hostname.toLowerCase())) return null;
  let id: string | null = null;
  if (u.hostname.toLowerCase() === "youtu.be") {
    id = u.pathname.split("/")[1] ?? null;
  } else if (u.pathname === "/watch") {
    id = u.searchParams.get("v");
  } else {
    const m = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(u.pathname);
    id = m?.[1] ?? null;
  }
  return id && ID_RE.test(id) ? id : null;
}

let purifier: ReturnType<typeof DOMPurify> | null = null;

function getPurifier() {
  if (purifier) return purifier;
  const p = DOMPurify(window);
  p.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName === "iframe") {
      const src = (node as Element).getAttribute("src");
      if (!extractYouTubeId(src)) node.parentNode?.removeChild(node);
    }
  });
  p.addHook("afterSanitizeAttributes", (node) => {
    if (!(node instanceof Element)) return;
    const style = node.getAttribute("style");
    if (style !== null) {
      const m = /(?:^|;)\s*text-align\s*:\s*(left|right|center|justify)\s*(?:;|$)/i.exec(style);
      if (m?.[1]) node.setAttribute("style", `text-align:${m[1].toLowerCase()}`);
      else node.removeAttribute("style");
    }
    if (node.tagName === "A") {
      const href = node.getAttribute("href") ?? "";
      if (/^https?:\/\//i.test(href)) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    }
    if (node.tagName === "IFRAME") {
      node.setAttribute("loading", "lazy");
      node.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    }
  });
  purifier = p;
  return p;
}

/** Sanitizes CMS HTML. Browser/jsdom only. */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return getPurifier().sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "loading", "referrerpolicy", "target"],
    FORBID_TAGS: ["style", "script", "form", "input", "button", "textarea", "select"],
    ALLOW_DATA_ATTR: true,
  });
}

const DEFAULT_TITLE = "Film z YouTube";

function youtubeFromElement(el: Element): RichSegment | null {
  if (el.matches("div.umb-embed-holder")) {
    const id = extractYouTubeId(el.getAttribute("data-embed-url"));
    const inner = el.querySelector("iframe")?.getAttribute("title");
    return id ? { type: "youtube", videoId: id, title: inner || DEFAULT_TITLE } : null;
  }
  if (el.tagName === "IFRAME") {
    const id = extractYouTubeId(el.getAttribute("src"));
    return id
      ? { type: "youtube", videoId: id, title: el.getAttribute("title") || DEFAULT_TITLE }
      : null;
  }
  // wrapper (p/div/figure) containing only a youtube iframe, or only a youtube link
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  const iframes = el.querySelectorAll("iframe");
  if (iframes.length === 1 && text === "") {
    return youtubeFromElement(iframes[0]!);
  }
  if (el.tagName === "P") {
    const anchors = el.querySelectorAll("a");
    if (anchors.length === 1 && iframes.length === 0) {
      const a = anchors[0]!;
      const aText = (a.textContent ?? "").replace(/\s+/g, " ").trim();
      const id = extractYouTubeId(a.getAttribute("href"));
      if (id && text === aText) return { type: "youtube", videoId: id, title: DEFAULT_TITLE };
    } else if (anchors.length === 0 && /^https?:\/\/\S+$/.test(text)) {
      const id = extractYouTubeId(text);
      if (id) return { type: "youtube", videoId: id, title: DEFAULT_TITLE };
    }
  }
  return null;
}

/** Sanitizes and splits content into html chunks and YouTube embeds. */
export function splitRichContent(html: string): RichSegment[] {
  const clean = sanitizeHtml(html);
  if (!clean.trim()) return [];
  const doc = new DOMParser().parseFromString(`<body>${clean}</body>`, "text/html");
  const segments: RichSegment[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer.trim()) segments.push({ type: "html", html: buffer });
    buffer = "";
  };
  for (const node of Array.from(doc.body.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const yt = youtubeFromElement(el);
      if (yt) {
        flush();
        segments.push(yt);
      } else {
        buffer += el.outerHTML;
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      buffer += (node.textContent ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }
  flush();
  return segments;
}

/** Plain text with paragraph/line breaks preserved as "\n". */
export function stripHtml(html: string): string {
  if (!html) return "";
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ");
  const doc = new DOMParser().parseFromString(withBreaks, "text/html");
  doc.querySelectorAll("script,style").forEach((n) => n.remove());
  return (doc.body.textContent ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Single-line plain-text excerpt cut at a word boundary, with an ellipsis. */
export function excerpt(html: string, maxChars: number): string {
  const text = stripHtml(html).replace(/\s+/g, " ").trim();
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, Math.max(0, maxChars - 1));
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > maxChars * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,.;:–-]+$/, "")}…`;
}
