import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Link as RouterLink } from "react-router";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/cn";

const iconButtonStyles = tv({
  base: "relative inline-flex shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-200 active:scale-90 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      ghost: "bg-transparent text-navy hover:bg-navy/8",
      soft: "bg-surface-muted text-navy hover:bg-pill",
      solid: "bg-accent text-white hover:bg-accent-ink",
      navy: "bg-navy text-white hover:bg-navy-800",
      glass: "bg-white/80 text-navy shadow-card backdrop-blur hover:bg-white",
    },
    size: { md: "size-11 min-h-11 min-w-11", lg: "size-14" },
  },
  defaultVariants: { variant: "ghost", size: "md" },
});

export type IconButtonProps = VariantProps<typeof iconButtonStyles> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
    /** Accessible name (required, Polish). */
    label: string;
    children: ReactNode;
    /** Small accent dot, e.g. unread notifications. Announce the state in `label`. */
    badge?: boolean;
    /** Render as router link. */
    to?: string;
    ref?: Ref<HTMLButtonElement>;
  };

export function IconButton({
  label,
  badge,
  variant,
  size,
  className,
  children,
  to,
  type,
  ...rest
}: IconButtonProps) {
  const cls = cn(iconButtonStyles({ variant, size }), className);
  const inner = (
    <>
      {children}
      {badge && (
        <span
          aria-hidden="true"
          className="absolute top-2 right-2 size-2.5 rounded-full bg-accent ring-2 ring-surface"
        />
      )}
    </>
  );
  if (to) {
    return (
      <RouterLink to={to} aria-label={label} className={cls}>
        {inner}
      </RouterLink>
    );
  }
  return (
    <button type={type ?? "button"} aria-label={label} className={cls} {...rest}>
      {inner}
    </button>
  );
}
