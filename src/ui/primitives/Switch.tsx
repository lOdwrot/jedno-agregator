import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Visible label (also the accessible name). */
  label: ReactNode;
  /** Optional hint under the label. */
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** On/off switch (`role="switch"`): the whole row is the touch target (≥ 44px). */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex min-h-11 w-full items-center justify-between gap-4 rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:opacity-50",
        className,
      )}
    >
      <span className="flex min-w-0 flex-col">
        <span className="font-bold text-ink">{label}</span>
        {description && <span className="text-sm text-ink-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-success" : "bg-ink-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-5 rounded-full bg-surface shadow-card transition-transform",
            checked && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
