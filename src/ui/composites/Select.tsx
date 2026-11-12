import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icons";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  /** Visible label (required for a11y). */
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Adds a leading empty option with this text, e.g. "Wszyscy autorzy". */
  placeholder?: string;
  hideLabel?: boolean;
}

/** Styled native <select> with a label. */
export function Select({ label, options, value, onChange, placeholder, hideLabel, className, ...rest }: SelectProps) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("text-sm font-bold text-navy", hideLabel && "sr-only")}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 w-full appearance-none rounded-pill border-2 border-line bg-surface py-2 pl-4 pr-11 text-base font-semibold text-ink transition-colors hover:border-navy/30 focus-visible:border-accent-ink"
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted" />
      </div>
    </div>
  );
}
