import { tv } from "tailwind-variants";

export const buttonStyles = tv({
  base: "relative inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-pill font-bold whitespace-nowrap transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  variants: {
    variant: {
      solid: "bg-accent-strong text-white shadow-card hover:bg-accent-ink hover:shadow-lift",
      navy: "bg-navy text-white shadow-card hover:bg-navy-800 hover:shadow-lift",
      soft: "bg-accent-soft text-accent-ink hover:bg-accent-strong hover:text-white",
      outline: "border-2 border-navy/20 bg-transparent text-navy hover:border-navy hover:bg-navy hover:text-white",
      ghost: "bg-transparent text-navy hover:bg-navy/8",
      link: "min-h-0 rounded-none bg-transparent p-0 text-accent-ink underline decoration-accent/40 underline-offset-4 hover:decoration-accent-ink active:scale-100",
    },
    size: {
      sm: "px-4 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3.5 text-lg",
    },
    fullWidth: { true: "w-full" },
  },
  defaultVariants: { variant: "solid", size: "md" },
});
