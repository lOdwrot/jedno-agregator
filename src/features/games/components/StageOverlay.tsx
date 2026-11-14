import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Button, Heading, Icon } from "@/ui";
import { Confetti } from "../fx/Confetti";

interface StageOverlayProps {
  emoji: string;
  title: string;
  children?: ReactNode;
  actionLabel: string;
  onAction: () => void;
  /** Extra line under the action (e.g. best score). */
  footer?: ReactNode;
  /** Confetti rain behind the card (wins). */
  celebrate?: boolean;
}

/** Centered card over the game stage: intro ("Zaczynamy!") and result screens. */
export function StageOverlay({
  emoji,
  title,
  children,
  actionLabel,
  onAction,
  footer,
  celebrate,
}: StageOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-navy/35 p-3 backdrop-blur-[2px]">
      {celebrate && <Confetti />}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="max-h-full w-full max-w-sm overflow-y-auto rounded-card bg-surface p-5 text-center shadow-lift sm:p-6"
      >
        <p
          aria-hidden="true"
          className="text-4xl leading-none motion-safe:animate-[game-pop-in_0.6s_var(--ease-spring)_0.15s_both] sm:text-5xl"
        >
          {emoji}
        </p>
        <Heading level={2} size="md" className="mt-2">
          {title}
        </Heading>
        {children && <div className="mt-2 text-sm text-ink sm:text-base">{children}</div>}
        <Button
          className="mt-4"
          size="lg"
          onClick={onAction}
          leftIcon={<Icon name="play" size={18} />}
        >
          {actionLabel}
        </Button>
        {footer && <p className="mt-3 text-sm font-semibold text-ink-muted">{footer}</p>}
      </motion.div>
    </div>
  );
}
