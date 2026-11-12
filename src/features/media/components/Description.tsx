import { Fragment, useMemo } from "react";
import { cn } from "@/lib/cn";
import { linkify } from "../utils";

/** Plain-text description with safe http(s) links; line breaks preserved. */
export function Description({ text, className }: { text: string; className?: string }) {
  const parts = useMemo(() => linkify(text), [text]);
  return (
    <p className={cn("whitespace-pre-line break-words", className)}>
      {parts.map((p, i) =>
        p.type === "link" ? (
          <a
            key={i}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-semibold text-accent-ink underline underline-offset-2 hover:text-navy"
          >
            {p.text}
          </a>
        ) : (
          <Fragment key={i}>{p.text}</Fragment>
        ),
      )}
    </p>
  );
}
