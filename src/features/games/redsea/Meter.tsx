import { cn } from "@/lib/cn";

/** Labelled progress meter (scaleX animation only). */
export function Meter({
  label,
  value,
  tone,
  text,
}: {
  label: string;
  value: number;
  tone: string;
  text: string;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex justify-between text-sm font-bold text-navy">
        <span>{label}</span>
        <span>{text}</span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-3 overflow-hidden rounded-pill bg-surface-muted"
      >
        <div
          className={cn("h-full origin-left rounded-pill transition-transform duration-200", tone)}
          style={{ transform: `scaleX(${value / 100})` }}
        />
      </div>
    </div>
  );
}
