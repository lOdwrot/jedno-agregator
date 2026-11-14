import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  /** Visible label (required for a11y). */
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Helper text under the field. */
  hint?: string;
  /** Error text — marks the field invalid and is announced. */
  error?: string | null;
  hideLabel?: boolean;
  /** Extra classes of the <input> itself (e.g. big centered digits). */
  inputClassName?: string;
}

/** Labelled text input with an optional hint and error message. */
export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  hideLabel,
  className,
  inputClassName,
  ...rest
}: TextFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("text-sm font-bold text-navy", hideLabel && "sr-only")}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "min-h-11 w-full rounded-pill border-2 border-line bg-surface px-4 py-2 text-base font-semibold text-ink transition-colors placeholder:text-ink-muted hover:border-navy/30 focus-visible:border-accent-ink",
          error && "border-danger",
          inputClassName,
        )}
        {...rest}
      />
      {hint && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="text-sm font-bold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
