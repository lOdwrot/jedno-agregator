import { cn } from "@/lib/cn";

export const chipClass = (active: boolean) =>
  cn(
    "relative inline-flex min-h-11 items-center gap-1.5 rounded-pill px-4 py-1.5 text-sm transition-colors duration-200 select-none",
    active
      ? "font-bold text-white"
      : "bg-pill font-semibold text-ink-muted hover:bg-pill/70 hover:text-navy",
  );
