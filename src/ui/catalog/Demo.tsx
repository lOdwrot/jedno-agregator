import type { ReactNode } from "react";
import { Heading } from "../primitives/Typography";

/** Catalog helpers: a titled group and a labelled example block. */
export function Group({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 py-8">
      <Heading level={2} size="xl" id={`${id}-h`} className="mb-6 border-b border-line pb-3">
        {title}
      </Heading>
      <div className="grid gap-6">{children}</div>
    </section>
  );
}

export function Demo({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="rounded-card bg-surface p-5 shadow-card">
      <p className="mb-3 font-mono text-xs font-bold tracking-wider text-ink-muted uppercase">
        {name}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
