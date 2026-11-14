import { cn } from "@/lib/cn";

/** Back of a card from a booster, in the edition's foil colours. */
export function CardBack({ foil, className }: { foil: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid place-items-center rounded-card bg-gradient-to-br text-4xl shadow-lift ring-1 ring-white/30",
        foil,
        className,
      )}
    >
      <span className="grid size-16 place-items-center rounded-full bg-navy/80">🕊️</span>
    </span>
  );
}
