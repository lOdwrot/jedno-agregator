import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import { cn } from "@/lib/cn";
import { Icon } from "../icons";
import { VisuallyHidden } from "./VisuallyHidden";
import { isExternalHref, NEW_TAB_HINT } from "./link-utils";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Internal path (`/wydarzenia`) or absolute URL. External URLs open in a new tab. */
  to: string;
  children: ReactNode;
  /** Hide the underline until hover (for nav-like usage). */
  quiet?: boolean;
}

const base =
  "font-semibold text-accent-ink underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent-ink";

/** Styled text link. Internal -> react-router Link; external -> <a target=_blank> + sr-only hint + icon. */
export function Link({ to, quiet, className, children, ...rest }: LinkProps) {
  const cls = cn(base, quiet && "no-underline hover:underline", className);
  if (isExternalHref(to)) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={cn(cls, "inline-flex items-center gap-1")} {...rest}>
        {children}
        <Icon name="arrowUpRight" size={16} />
        <VisuallyHidden>{NEW_TAB_HINT}</VisuallyHidden>
      </a>
    );
  }
  if (/^(mailto:|tel:)/i.test(to)) {
    return (
      <a href={to} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <RouterLink to={to} className={cls} {...rest}>
      {children}
    </RouterLink>
  );
}
