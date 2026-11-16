import { useState } from "react";
import { Icon } from "@/ui";
import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import { PopeStoryDialog } from "./PopeStoryDialog";
import { popeStory } from "./stories";

/** "i Historia" pill on a pope card: opens the pope's story. Renders nothing for other cards. */
export function PopeInfoButton({ cardId, className }: { cardId: string; className?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!popeStory(cardId)) return null;
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(cardId);
        }}
        aria-label={`Poznaj historię: ${getCard(cardId).name}`}
        className={cn(
          "inline-flex min-h-11 items-center gap-1 rounded-full bg-navy/85 py-1 pr-3 pl-1.5 text-sm font-extrabold text-white shadow-lift ring-2 ring-logo-yellow backdrop-blur transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-yellow motion-safe:hover:scale-105 motion-safe:active:scale-95",
          className,
        )}
      >
        <span className="grid size-7 place-items-center rounded-full bg-logo-yellow text-navy">
          <Icon name="info" size={18} />
        </span>
        Historia
      </button>
      <PopeStoryDialog id={open} onSelect={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
