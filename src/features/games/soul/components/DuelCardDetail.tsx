import type { ReactNode } from "react";
import type { Finish } from "../data/types";
import { PopeInfoButton } from "../popes/PopeInfoButton";
import { FitCard } from "./FitCard";

/** Panel classes for a dialog showing `DuelCardDetail`: a box of its own height for the card to fill. */
export const DUEL_CARD_PANEL = "h-[94dvh] sm:h-[min(100%,46rem)] sm:max-w-3xl";

/**
 * A card during the duel, everything visible at once: the flat card face (scaled to the space
 * left), and beside it (wide screens) or under it (phones) the table status and the actions.
 */
export function DuelCardDetail({
  cardId,
  finish,
  showLesson = false,
  status,
  children,
}: {
  cardId: string;
  finish: Finish;
  showLesson?: boolean;
  /** Above the actions: e.g. `InPlayStatus`. */
  status?: ReactNode;
  /** Actions / the "back" button. */
  children?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-3 pt-8 sm:flex-row sm:gap-5 sm:pt-6">
      <FitCard
        cardId={cardId}
        finish={finish}
        showLesson={showLesson}
        className="flex-1 sm:basis-1/2"
      />
      <div className="flex shrink-0 flex-col justify-center gap-2 sm:flex-1 sm:basis-1/2 sm:overflow-y-auto">
        {status}
        <PopeInfoButton cardId={cardId} className="self-center" />
        {children}
      </div>
    </div>
  );
}
