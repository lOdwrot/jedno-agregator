import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icons";
import { Reveal } from "../effects/Reveal";
import { Link } from "../primitives/Link";
import { Eyebrow, Heading } from "../primitives/Typography";

export interface SectionProps {
  title: string;
  eyebrow?: string;
  /** Right-aligned link like "Wszystkie wydarzenia". */
  action?: { label: string; to: string };
  /** Heading level, default 2. */
  level?: 2 | 3;
  children: ReactNode;
  className?: string;
  /** Reveal content on scroll (default true). */
  reveal?: boolean;
}

/** Page section with heading row (eyebrow, title, optional "see all" link) and scroll reveal. */
export function Section({
  title,
  eyebrow,
  action,
  level = 2,
  children,
  className,
  reveal = true,
}: SectionProps) {
  const id = useId();
  const body = (
    <>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <Eyebrow className="mb-1">{eyebrow}</Eyebrow>}
          <Heading level={level} size="lg" id={id}>
            {title}
          </Heading>
        </div>
        {action && (
          <Link
            to={action.to}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm no-underline hover:underline"
          >
            {action.label}
            <Icon name="arrowRight" size={16} />
          </Link>
        )}
      </div>
      {children}
    </>
  );
  return (
    <section aria-labelledby={id} className={cn("py-8 sm:py-10", className)}>
      {reveal ? <Reveal>{body}</Reveal> : body}
    </section>
  );
}
