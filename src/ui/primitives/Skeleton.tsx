import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Shimmering placeholder block. Decorative (aria-hidden); pair with LoadingState for announcements. */
export function Skeleton({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-xl bg-pill/70 before:absolute before:inset-0 before:-translate-x-full before:animate-[ui-shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent",
        className,
      )}
      {...rest}
    />
  );
}

/** Placeholder shaped like a news/event card. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("overflow-hidden rounded-card bg-surface shadow-card", className)}>
      <Skeleton className="aspect-video rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
