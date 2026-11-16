import { cn } from "@/lib/cn";

/** One key of St Peter: ring bow, shaft and a toothed bit. */
const Key = ({ className }: { className: string }) => (
  <g className={className}>
    <circle cx="0" cy="-34" r="11" fill="none" strokeWidth="5" />
    <circle cx="0" cy="-34" r="3.5" stroke="none" />
    <path d="M0 -23 V36" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M0 20 H12 V26 H6 V31 H12 V36 H0" stroke="none" />
  </g>
);

/** Crossed keys of St Peter — the decorative emblem of the pope stories. */
export function PapalKeys({ className }: { className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" aria-hidden="true" className={cn("size-16", className)}>
      <g transform="rotate(-38)">
        <Key className="fill-logo-yellow stroke-logo-yellow" />
      </g>
      <g transform="rotate(38) scale(-1 1)">
        <Key className="fill-surface stroke-surface" />
      </g>
      <path d="M-9 34 L0 44 L9 34 Z" className="fill-logo-red" />
    </svg>
  );
}
