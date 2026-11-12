import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icons";

/** Calendar icon + text on a muted pill, e.g. "Jutro, 19:30". */
export function DatePill({ className, children, ...rest }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-sm font-bold text-accent-ink",
        className,
      )}
      {...rest}
    >
      <Icon name="calendar" size={16} />
      {children}
    </span>
  );
}
