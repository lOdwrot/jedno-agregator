import { cn } from "@/lib/cn";
import { artFocus, artLayers, artSrc } from "../data/art";
import { useCardArt } from "../data/artPref";
import { getCard } from "../data/cards";

/** Card illustration: a picture when we have one, otherwise the card's emoji. */
export function CardArt({
  cardId,
  className,
  emojiClass = "text-5xl",
  depth = false,
}: {
  cardId: string;
  className?: string;
  emojiClass?: string;
  /** Album viewer, drawn pictures only (real photos stay flat): the backdrop and the figure on separate layers that shift with the card's tilt
   *  (`--tilt-x` / `--tilt-y` set by `TiltCard`, see `.soul-depth-*` in index.css). */
  depth?: boolean;
}) {
  useCardArt(); // re-render when the "Ilustracje kart" setting changes
  const src = artSrc(cardId);
  const focus = artFocus(cardId);
  const layers = depth ? artLayers(cardId) : null;
  const pos = { objectPosition: `50% ${focus * 100}%` };
  if (layers)
    return (
      <>
        {/* the backdrop stays inside the frame… */}
        <span className="absolute inset-0 overflow-hidden rounded-xl">
          <img
            src={layers.bg}
            alt=""
            className={cn("soul-depth-bg absolute inset-0 size-full object-cover", className)}
            style={pos}
          />
        </span>
        {/* …the figure and the effects step out of it freely (nothing clips them, see CardFace / TiltCard) */}
        <span className="absolute inset-0">
          <img
            src={layers.fg}
            alt=""
            className={cn(
              // the WHOLE picture (4:3, not cropped to the frame), centred on the frame
              "soul-depth-fg absolute top-1/2 left-0 -mt-[37.5%] aspect-[4/3] w-full",
              className,
            )}
          />
        </span>
        <span className="absolute inset-0">
          <img
            src={layers.fx}
            alt=""
            className={cn(
              // the WHOLE picture (4:3, not cropped to the frame), centred on the frame
              "soul-depth-fx absolute top-1/2 left-0 -mt-[37.5%] aspect-[4/3] w-full",
              className,
            )}
          />
        </span>
      </>
    );
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
