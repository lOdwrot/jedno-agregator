import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import { cardTypeBadge } from "../data/cardType";

const SIZE = {
  sm: "size-5 text-[0.7rem]",
  md: "size-7 text-sm",
} as const;

/** Round badge with the card's type icon (basic, evolution, item, supporter, place, energy). */
export function CardTypeIcon({
  cardId,
  size = "md",
  className,
}: {
  cardId: string;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const c = getCard(cardId);
  const { icon, label } = cardTypeBadge(c);
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "grid shrink-0 place-items-center rounded-full leading-none shadow-card ring-2",
        c.side === "demons" ? "bg-navy-600 ring-logo-red" : "bg-surface ring-logo-yellow",
        SIZE[size],
        className,
      )}
    >
      <span aria-hidden="true">{icon}</span>
    </span>
  );
}
