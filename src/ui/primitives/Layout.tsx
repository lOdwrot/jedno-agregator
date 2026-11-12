import type { ComponentProps, ElementType } from "react";
import { cn } from "@/lib/cn";

type As = { as?: ElementType };

/** Page width container: max-w-7xl with responsive padding. `narrow` = reading width (~720px). */
export function Container({
  as,
  narrow,
  className,
  ...rest
}: ComponentProps<"div"> & As & { narrow?: boolean }) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        narrow ? "max-w-3xl" : "max-w-7xl",
        className,
      )}
      {...rest}
    />
  );
}

const GAP = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  12: "gap-12",
} as const;
type Gap = keyof typeof GAP;

/** Vertical flex column with consistent gap. */
export function Stack({
  as,
  gap = 4,
  className,
  ...rest
}: ComponentProps<"div"> & As & { gap?: Gap }) {
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={cn("flex flex-col", GAP[gap], className)} {...rest} />;
}

/** Horizontal wrapping flex row (chips, buttons). */
export function Cluster({
  as,
  gap = 3,
  align = "center",
  className,
  ...rest
}: ComponentProps<"div"> & As & { gap?: Gap; align?: "start" | "center" | "end" | "between" }) {
  const Tag = (as ?? "div") as ElementType;
  const a = {
    start: "justify-start",
    center: "items-center",
    end: "justify-end items-center",
    between: "justify-between items-center",
  }[align];
  return <Tag className={cn("flex flex-wrap", GAP[gap], a, className)} {...rest} />;
}
