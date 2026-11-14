import { cn } from "@/lib/cn";
import { ART, artSrc } from "../data/art";
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
  const focus = ART[cardId]?.focus ?? 0.3;
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
