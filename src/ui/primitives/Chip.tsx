import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { chipClass } from "./chip-styles";

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Toggle state -> aria-pressed. */
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  leftIcon?: ReactNode;
}

/** Pill toggle button (multi-select filters). For single-select use ChipGroup. */
export function Chip({
  pressed = false,
  onPressedChange,
  leftIcon,
  className,
  children,
  onClick,
  ...rest
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(chipClass(pressed), pressed && "bg-accent-strong", className)}
      onClick={(e) => {
        onClick?.(e);
        onPressedChange?.(!pressed);
      }}
      {...rest}
    >
      {leftIcon}
      {children}
    </button>
  );
}
