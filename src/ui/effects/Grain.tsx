import { cn } from "@/lib/cn";

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Subtle film-grain overlay. Place inside a `relative` container. Decorative. */
export function Grain({ className, opacity = 0.07 }: { className?: string; opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 mix-blend-multiply", className)}
      style={{ backgroundImage: NOISE, opacity }}
    />
  );
}
