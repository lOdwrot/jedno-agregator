import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/cn";

const badgeStyles = tv({
  base: "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
  variants: {
    tone: {
      neutral: "bg-surface-muted text-ink-muted",
      accent: "bg-accent-soft text-accent-ink",
      navy: "bg-navy text-white",
      success: "bg-success text-white",
      danger: "bg-danger/12 text-danger",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export type BadgeProps = VariantProps<typeof badgeStyles> & ComponentProps<"span">;

export function Badge({ tone, className, ...rest }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)} {...rest} />;
}
