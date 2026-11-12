import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { useControllable } from "../useControllable";
import { usePrefersReducedMotion } from "../effects/useMediaQuery";

export interface TabItem {
  value: string;
  label: ReactNode;
  /** Panel content (button mode). Omit when using `to`. */
  content?: ReactNode;
  /** Render this tab as a router link (navigation tabs); pair with controlled `value`. */
  to?: string;
  icon?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Controlled active value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Accessible name of the tab list (required). */
  label: string;
  className?: string;
  /** Extra classes for the tab strip. */
  listClassName?: string;
}

/** Tabs with roving tabindex, arrow/Home/End keys and an animated sliding indicator. */
export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  label,
  className,
  listClassName,
}: TabsProps) {
  const [current, setCurrent] = useControllable<string>(
    value,
    defaultValue ?? items[0]?.value ?? "",
    onChange,
  );
  const uid = useId();
  const reduce = usePrefersReducedMotion();
  const refs = useRef<(HTMLElement | null)[]>([]);
  const asLinks = items.some((i) => i.to);
  const activeIdx = Math.max(
    0,
    items.findIndex((i) => i.value === current),
  );

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const n = items.length;
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key as "Home"];
    if (next === undefined) return;
    e.preventDefault();
    const idx = (next + n) % n;
    const it = items[idx];
    if (!it) return;
    setCurrent(it.value);
    refs.current[idx]?.focus();
  };

  const indicator = (
    <motion.span
      layoutId={`tab-ind-${uid}`}
      aria-hidden="true"
      className="absolute inset-x-2 -bottom-px h-1 rounded-full bg-accent"
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
    />
  );
  const tabCls = (active: boolean) =>
    cn(
      "relative inline-flex min-h-11 items-center gap-2 whitespace-nowrap px-4 py-2 text-base font-bold transition-colors",
      active ? "text-navy" : "text-ink-muted hover:text-navy",
    );

  const list = asLinks ? (
    <nav aria-label={label} className={cn("flex gap-1 border-b border-line", listClassName)}>
      {items.map((it, i) => (
        <RouterLink
          key={it.value}
          to={it.to ?? "#"}
          aria-current={i === activeIdx ? "page" : undefined}
          className={tabCls(i === activeIdx)}
        >
          {it.icon}
          {it.label}
          {i === activeIdx && indicator}
        </RouterLink>
      ))}
    </nav>
  ) : (
    <div
      role="tablist"
      aria-label={label}
      className={cn("flex gap-1 overflow-x-auto border-b border-line", listClassName)}
    >
      {items.map((it, i) => (
        <button
          key={it.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`${uid}-tab-${it.value}`}
          aria-selected={i === activeIdx}
          aria-controls={`${uid}-panel-${it.value}`}
          tabIndex={i === activeIdx ? 0 : -1}
          onClick={() => setCurrent(it.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className={tabCls(i === activeIdx)}
        >
          {it.icon}
          {it.label}
          {i === activeIdx && indicator}
        </button>
      ))}
    </div>
  );

  return (
    <div className={className}>
      {list}
      {!asLinks &&
        items.map((it, i) => (
          <div
            key={it.value}
            role="tabpanel"
            id={`${uid}-panel-${it.value}`}
            aria-labelledby={`${uid}-tab-${it.value}`}
            hidden={i !== activeIdx}
            tabIndex={0}
            className="pt-5"
          >
            {i === activeIdx ? it.content : null}
          </div>
        ))}
    </div>
  );
}
