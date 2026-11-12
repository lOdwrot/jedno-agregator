import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SplitText } from "../effects/SplitText";
import { Eyebrow, Heading, Text } from "../primitives/Typography";

export interface PageHeaderProps {
  /** The page's only <h1>. */
  title: string;
  /** Serif italic accent word shown after the title (e.g. "Aktualności" + "dla Ciebie"). */
  accent?: string;
  eyebrow?: string;
  description?: ReactNode;
  /** Right-side slot: filter button, search, etc. */
  actions?: ReactNode;
  className?: string;
}

/** Big animated page title (h1) with optional serif accent, description and actions slot. */
export function PageHeader({ title, accent, eyebrow, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-6 pt-8 sm:pt-12", className)}>
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <Heading level={1} size="2xl">
          <SplitText text={title} />
          {accent && (
            <>
              {" "}
              <span className="font-serif font-normal italic text-accent-ink">
                <SplitText text={accent} delay={0.25} />
              </span>
            </>
          )}
        </Heading>
        {description && <Text variant="lead" className="mt-3 text-ink-muted">{description}</Text>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
