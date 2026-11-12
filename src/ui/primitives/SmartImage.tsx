import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { JednoLogo } from "../icons/JednoLogo";

import { buildSrcSet } from "./srcset";

export interface SmartImageProps {
  src?: string | null;
  /** Required. Use "" only for purely decorative images. */
  alt: string;
  /** CSS aspect-ratio, e.g. "16/9", "4/3", "1/1". Omit to size by className. */
  aspect?: string;
  /** Widths for responsive srcset (admin.jedno.net only), e.g. [320, 640, 960]. */
  srcSetWidths?: number[];
  sizes?: string;
  /** Eager-load (above the fold / LCP). */
  priority?: boolean;
  /** Slow zoom when an ancestor with the `group` class is hovered/focused. */
  zoomOnHover?: boolean;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
}

/** Lazy image with gray placeholder, blur-up fade, on-brand error fallback and optional ken-burns zoom. */
export function SmartImage({
  src,
  alt,
  aspect,
  srcSetWidths = [],
  sizes,
  priority,
  zoomOnHover,
  className,
  imgClassName,
  style,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const ref = useRef<HTMLImageElement>(null);
  const failed = !src || failedSrc === src;

  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <div
      className={cn("relative overflow-hidden bg-pill", className)}
      style={{ aspectRatio: aspect, ...style }}
    >
      {failed ? (
        <div
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-accent-soft via-surface-muted to-pill"
        >
          <span className="absolute -left-6 -top-6 size-28 rounded-full bg-logo-yellow/25" aria-hidden="true" />
          <span className="absolute -bottom-8 right-4 size-32 rounded-full bg-logo-blue/20" aria-hidden="true" />
          <JednoLogo variant="mark" size={56} className="relative opacity-70" />
        </div>
      ) : (
        <img
          ref={ref}
          src={src}
          srcSet={buildSrcSet(src, srcSetWidths)}
          sizes={srcSetWidths.length ? sizes : undefined}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailedSrc(src)}
          className={cn(
            "size-full object-cover transition-[opacity,filter,transform] duration-700 ease-out",
            loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-lg",
            zoomOnHover && "group-hover:scale-110 group-focus-within:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}
