import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icons";
import { Link } from "../primitives/Link";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const SRC = "https://www.instagram.com/embed.js";
let loader: Promise<void> | null = null;

function loadEmbedScript(): Promise<void> {
  if (window.instgrm) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loader = null;
      reject(new Error("instagram embed failed"));
    };
    document.body.appendChild(s);
  });
  return loader;
}

export interface InstagramEmbedProps {
  /** Post permalink, e.g. https://www.instagram.com/p/XXXX/ */
  url: string;
  caption?: string | null;
  className?: string;
}

/** Official Instagram embed (blockquote + embed.js, loaded once) with a branded placeholder underneath. */
export function InstagramEmbed({ url, caption, className }: InstagramEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadEmbedScript()
      .then(() => {
        if (!cancelled) window.instgrm?.Embeds.process();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div ref={ref} className={cn("group relative overflow-hidden rounded-card bg-surface shadow-card", className)}>
      <div className="flex flex-col items-center gap-3 p-6 text-center group-has-[iframe]:hidden">
        <span className="grid size-12 place-items-center rounded-full bg-linear-to-br from-logo-yellow via-logo-red to-logo-blue text-white">
          <Icon name="instagram" />
        </span>
        {caption && <p className="line-clamp-4 text-sm text-ink-muted">{caption}</p>}
        <Link to={url}>Zobacz post na Instagramie</Link>
      </div>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ margin: 0, maxWidth: "100%", minWidth: 0, width: "100%" }}
      />
    </div>
  );
}
