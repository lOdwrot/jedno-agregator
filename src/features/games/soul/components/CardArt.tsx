import { cn } from "@/lib/cn";
import { artFocus, artSrc } from "../data/art";
import { getCard } from "../data/cards";

/** Card illustration: a picture when we have one, otherwise the card's emoji. */
export function CardArt({
  cardId,
  className,
  emojiClass = "text-5xl",
}: {
  cardId: string;
  className?: string;
  emojiClass?: string;
}) {
  const src = artSrc(cardId);
  const focus = artFocus(cardId);
  if (src)
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className={cn("absolute inset-0 size-full object-cover", className)}
        style={{ objectPosition: `50% ${focus * 100}%` }}
      />
    );
  return (
    <span aria-hidden="true" className={cn("drop-shadow-lg", emojiClass)}>
      {getCard(cardId).emoji}
    </span>
  );
}

/** Small round picture of a card, e.g. inside a badge. */
export function CardThumb({ cardId, className }: { cardId: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-navy-600 ring-1 ring-white/40",
        className,
      )}
    >
      <CardArt cardId={cardId} emojiClass="text-base" />
    </span>
  );
}
