import { usePrefersReducedMotion } from "@/ui";

const COLORS = [
  "bg-logo-orange",
  "bg-logo-blue",
  "bg-logo-yellow",
  "bg-logo-red",
  "bg-success",
  "bg-surface",
];

/** Falling confetti over the stage for a win (decorative; hidden for reduced motion). */
export function Confetti({ count = 46 }: { count?: number }) {
  const reduce = usePrefersReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const left = (i * 37 + (i % 5) * 11) % 100;
        const delay = ((i * 53) % 90) / 100;
        const dur = 1.8 + ((i * 29) % 12) / 10;
        return (
          <span
            key={i}
            className={`absolute -top-4 block h-3 w-2 rounded-[2px] ${COLORS[i % COLORS.length]} animate-[game-confetti_var(--d)_ease-in_var(--delay)_both]`}
            style={
              {
                left: `${left}%`,
                "--d": `${dur}s`,
                "--delay": `${delay}s`,
                "--x": `${((i % 7) - 3) * 18}px`,
                "--r": `${(i % 2 ? 1 : -1) * (360 + i * 25)}deg`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
