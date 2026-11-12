import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Content available to screen readers only. */
export function VisuallyHidden({ className, ...rest }: ComponentProps<"span">) {
  return <span className={cn("sr-only", className)} {...rest} />;
}
