import { Link } from "react-router";
import { Badge, Card, SmartImage, Text } from "@/ui";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { newsHref } from "../utils";
import type { News } from "@/data/schemas";


interface NewsCardProps {
  item: News;
  featured?: boolean;
  /** index used to find the card link for focus management */
  index: number;
  priority?: boolean;
}

/** Card for the news grid; the title is the single (stretched) link. */
export function NewsCard({ item, featured, index, priority }: NewsCardProps) {
  const meta = [formatDate(item.date), item.author].filter(Boolean).join(" | ");
  return (
    <Card as="article" tilt className="h-full">
      <div className={cn("flex h-full", featured ? "flex-col lg:flex-row" : "flex-col")}>
        <div className={cn("relative overflow-hidden rounded-t-card", featured && "lg:w-3/5 lg:rounded-l-card lg:rounded-tr-none")}>
          <SmartImage
            src={item.imageUrl}
            alt=""
            aspect="16/9"
            srcSetWidths={[320, 480, 640, 960, 1280]}
            sizes={featured ? "(min-width:1024px) 520px, (min-width:640px) 50vw, 100vw" : "(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw"}
            zoomOnHover
            className={featured ? "lg:absolute lg:inset-0 lg:h-full lg:!aspect-auto" : undefined}
            priority={priority}
            style={{ viewTransitionName: `news-${item.id}` }}
          />
        </div>
        <div className={cn("flex flex-1 flex-col gap-2 p-4 sm:p-5", featured && "lg:justify-center lg:p-8")}>
          <Text variant="meta" className="text-sm text-ink-muted">{meta}</Text>
          <h3 className={cn("font-display font-bold leading-snug text-navy", featured ? "text-xl sm:text-2xl lg:text-3xl lg:line-clamp-4" : "text-lg", "line-clamp-2")}>
            <Link
              to={newsHref(item)}
              viewTransition
              data-news-index={index}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {item.title}
            </Link>
          </h3>
          {item.subtitle && <Text className={cn("text-ink-muted", featured ? "line-clamp-3" : "line-clamp-2")}>{item.subtitle}</Text>}
          <div className="mt-auto pt-2">
            {item.tag && <Badge tone={item.isEventAlias ? "accent" : "neutral"}>{item.tag}</Badge>}
          </div>
        </div>
      </div>
    </Card>
  );
}
