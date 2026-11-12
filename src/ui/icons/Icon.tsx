import type { SVGProps } from "react";
import { cn } from "@/lib/cn";
import { glyphs, type IconName } from "./glyphs";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** Pixel size (width = height). Default 24. */
  size?: number;
  /** When set the icon becomes `role="img"` with this accessible name; otherwise it is aria-hidden. */
  title?: string;
  /** Stroke width, default 1.75. */
  strokeWidth?: number;
}

/** Inline SVG icon. Colour follows `currentColor`. */
export function Icon({ name, size = 24, title, strokeWidth = 1.75, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {glyphs[name]}
    </svg>
  );
}
