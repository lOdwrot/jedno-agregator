import { useState } from "react";
import { cn } from "@/lib/cn";

const TINTS = ["bg-logo-orange", "bg-logo-blue", "bg-logo-red", "bg-logo-dark", "bg-navy-600"];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")
  ).toUpperCase();
}

export interface AvatarProps {
  name: string;
  src?: string | null;
  /** Pixel size, default 40. */
  size?: number;
  className?: string;
}

/** Round image; falls back to coloured initials when src is missing or fails. */
export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const tint = TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted font-bold text-white",
        !src || failed ? tint : "",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span aria-label={name} role="img">
          <span aria-hidden="true">{initials(name)}</span>
        </span>
      )}
    </span>
  );
}
