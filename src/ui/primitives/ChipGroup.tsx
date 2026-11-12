import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { useControllable } from "../useControllable";
import { usePrefersReducedMotion } from "../effects/useMediaQuery";

export interface ChipOption {
  value: string;
  label: ReactNode;
  /** Optional accessible name if `label` is not plain text. */
  ariaLabel?: string;
}

export interface ChipGroupProps {
  options: ChipOption[];
  /** Controlled value (`null` = nothing selected). */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Clicking the active chip again clears the selection (-> null). */
  allowClear?: boolean;
  /** Accessible name of the group (required). */
  label: string;
  className?: string;
}

/** Single-select pill group: role=radiogroup, roving tabindex, arrow keys, animated active pill. */
export function ChipGroup({ options, value, defaultValue = null, onChange, allowClear, label, className }: ChipGroupProps) {
  const [current, setCurrent] = useControllable<string | null>(value, defaultValue, onChange);
  const uid = useId();
  const reduce = usePrefersReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIdx = options.findIndex((o) => o.value === current);
  const tabbable = activeIdx >= 0 ? activeIdx : 0;

  const move = (to: number) => {
    const i = (to + options.length) % options.length;
    const opt = options[i];
    if (!opt) return;
    setCurrent(opt.value);
    refs.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const map: Record<string, number | undefined> = {
      ArrowRight: i + 1,
      ArrowDown: i + 1,
      ArrowLeft: i - 1,
      ArrowUp: i - 1,
      Home: 0,
      End: options.length - 1,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    move(next);
  };

  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o, i) => {
        const active = i === activeIdx;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.ariaLabel}
            tabIndex={i === tabbable ? 0 : -1}
            onClick={() => setCurrent(active && allowClear ? null : o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative inline-flex min-h-11 items-center rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors",
              active ? "font-bold text-white" : "bg-pill text-ink-muted hover:bg-pill/70 hover:text-navy",
            )}
          >
            {active && (
              <motion.span
                layoutId={`chip-pill-${uid}`}
                aria-hidden="true"
                className="absolute inset-0 rounded-pill bg-accent"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
