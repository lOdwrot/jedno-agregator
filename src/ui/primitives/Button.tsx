import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  ReactNode,
  Ref,
} from "react";
import { Link as RouterLink } from "react-router";
import type { VariantProps } from "tailwind-variants";
import { cn } from "@/lib/cn";
import { Magnetic } from "../effects/Magnetic";
import { buttonStyles } from "./button-styles";
import { Spinner } from "./Spinner";
import { VisuallyHidden } from "./VisuallyHidden";
import { isExternalHref, NEW_TAB_HINT } from "./link-utils";

type Own = VariantProps<typeof buttonStyles> & {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Shows a spinner, sets aria-busy and blocks clicks. */
  loading?: boolean;
  /** Subtle magnetic hover pull. */
  magnetic?: boolean;
  /** Internal route -> renders a react-router Link. */
  to?: string;
  /** URL -> renders <a>; external origins open in a new tab with a hidden hint. */
  href?: string;
  /** Render as another element/component (e.g. "span"). */
  as?: ElementType;
  ref?: Ref<HTMLElement>;
};
export type ButtonProps = Own &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Own> &
  Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof Own | keyof ButtonHTMLAttributes<HTMLButtonElement>
  >;

export function Button({
  variant,
  size,
  fullWidth,
  leftIcon,
  rightIcon,
  loading,
  magnetic,
  to,
  href,
  as,
  className,
  children,
  disabled,
  type,
  ...rest
}: ButtonProps) {
  const cls = cn(buttonStyles({ variant, size, fullWidth }), className);
  const external = !!href && isExternalHref(href);
  const content = (
    <>
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
      {external && <VisuallyHidden>{NEW_TAB_HINT}</VisuallyHidden>}
    </>
  );
  const blocked = disabled || loading;
  const common = { className: cls, "aria-busy": loading || undefined, ...rest };

  let node: ReactNode;
  if (to) {
    node = (
      <RouterLink to={to} {...(common as object)} aria-disabled={blocked || undefined}>
        {content}
      </RouterLink>
    );
  } else if (href) {
    node = (
      <a
        href={blocked ? undefined : href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(common as object)}
        aria-disabled={blocked || undefined}
      >
        {content}
      </a>
    );
  } else {
    const Tag = (as ?? "button") as ElementType;
    node = (
      <Tag {...(Tag === "button" ? { type: type ?? "button", disabled: blocked } : {})} {...common}>
        {content}
      </Tag>
    );
  }
  return magnetic ? <Magnetic className={fullWidth ? "w-full" : undefined}>{node}</Magnetic> : node;
}
