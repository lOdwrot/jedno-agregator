import type { ComponentProps, ElementType } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/cn";

const headingStyles = tv({
  base: "font-display font-extrabold tracking-tight text-navy",
  variants: {
    size: {
      sm: "text-lg leading-snug sm:text-xl",
      md: "text-xl leading-snug sm:text-2xl",
      lg: "text-2xl leading-tight sm:text-3xl",
      xl: "text-3xl leading-tight sm:text-4xl",
      "2xl": "text-4xl leading-[1.05] sm:text-5xl lg:text-6xl",
      hero: "text-5xl leading-[1.02] sm:text-6xl lg:text-7xl",
    },
    tone: { default: "text-navy", light: "text-white", accent: "text-accent-ink" },
  },
  defaultVariants: { size: "lg", tone: "default" },
});

const DEFAULT_SIZE = { 1: "2xl", 2: "xl", 3: "lg", 4: "md" } as const;

export type HeadingProps = VariantProps<typeof headingStyles> &
  Omit<ComponentProps<"h1">, "color"> & {
    /** Semantic level (h1-h4). Visual size is independent via `size`. */
    level?: 1 | 2 | 3 | 4;
  };

export function Heading({ level = 2, size, tone, className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as ElementType;
  return <Tag className={cn(headingStyles({ size: size ?? DEFAULT_SIZE[level], tone }), className)} {...rest} />;
}

const textStyles = tv({
  variants: {
    variant: {
      body: "text-base leading-relaxed text-ink",
      lead: "text-lg leading-relaxed text-ink sm:text-xl",
      meta: "text-sm font-semibold text-ink-muted",
      caption: "text-xs text-ink-muted",
    },
  },
  defaultVariants: { variant: "body" },
});

export type TextProps = VariantProps<typeof textStyles> & ComponentProps<"p"> & { as?: ElementType };

export function Text({ variant, as, className, ...rest }: TextProps) {
  const Tag = (as ?? "p") as ElementType;
  return <Tag className={cn(textStyles({ variant }), className)} {...rest} />;
}

/** Small uppercase label above headings. */
export function Eyebrow({ className, ...rest }: ComponentProps<"p"> & { as?: ElementType }) {
  return (
    <p
      className={cn("text-xs font-extrabold uppercase tracking-[0.18em] text-accent-ink", className)}
      {...rest}
    />
  );
}
