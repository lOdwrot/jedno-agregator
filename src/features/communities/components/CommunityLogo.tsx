import { cn } from "@/lib/cn";
import { Avatar, SmartImage } from "@/ui";

export interface CommunityLogoProps {
  name: string;
  src: string | null;
  /** Pixel size. */
  size: number;
  /** Alt text; "" when the name is rendered next to it. */
  alt?: string;
  className?: string;
}

/** Round logo on white with a thin ring; initials (logo-coloured) when there is no image. */
export function CommunityLogo({ name, src, size, alt = "", className }: CommunityLogoProps) {
  if (!src)
    return <Avatar name={name} size={size} className={cn("ring-2 ring-surface", className)} />;
  return (
    <span
      className={cn(
        "inline-block shrink-0 overflow-hidden rounded-full bg-surface shadow-card ring-1 ring-line",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <SmartImage
        src={src}
        alt={alt}
        srcSetWidths={[size, size * 2, size * 3]}
        sizes={`${size}px`}
        className="size-full bg-surface"
        imgClassName="object-cover"
      />
    </span>
  );
}
