import { useMemo } from "react";
import { motion } from "motion/react";
import type { Partner } from "@/data/schemas";
import { excerpt } from "@/lib/html";
import { Badge, Card, Heading, Icon, usePrefersReducedMotion } from "@/ui";
import { CommunityLogo } from "./CommunityLogo";

/** Card with a collapsed, fading description; the whole card opens the details dialog. */
export function CommunityCard({
  partner,
  onOpen,
}: {
  partner: Partner;
  onOpen: (p: Partner) => void;
}) {
  const reduce = usePrefersReducedMotion();
  const text = useMemo(() => excerpt(partner.html, 420), [partner.html]);

  return (
    <motion.li
      layout={reduce ? false : "position"}
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="list-none"
    >
      <Card tilt interactive className="h-full">
        <button
          type="button"
          onClick={() => onOpen(partner)}
          aria-haspopup="dialog"
          className="flex h-full min-h-44 w-full items-start gap-4 rounded-card p-5 text-left focus-visible:outline-none"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            {partner.category && (
              <Badge tone="accent" className="self-start">
                {partner.category}
              </Badge>
            )}
            <Heading level={2} size="md" className="break-words">
              {partner.name}
            </Heading>
            {text && (
              <span className="relative block max-h-28 overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)] text-sm leading-relaxed text-ink-muted">
                {text}
              </span>
            )}
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-accent-ink">
              Czytaj więcej
              <Icon
                name="arrowRight"
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </span>
          <CommunityLogo
            name={partner.name}
            src={partner.imageUrl}
            size={72}
            className="mt-1 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6"
          />
        </button>
      </Card>
    </motion.li>
  );
}
