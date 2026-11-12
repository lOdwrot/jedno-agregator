import { paths } from "@/app/routes";
import type { News } from "@/data/schemas";
import { useLatestNews } from "@/features/news/api";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/cn";
import {
  Card,
  Container,
  EmptyState,
  ErrorState,
  RevealGroup,
  RevealItem,
  Section,
  Skeleton,
  SmartImage,
} from "@/ui";

const href = (n: News) => (n.isEventAlias ? paths.eventDetail(n.id) : paths.newsDetail(n.id));

function NewsCard({ item, featured }: { item: News; featured?: boolean }) {
  return (
    <Card to={href(item)} tilt className={cn("h-full", featured && "md:col-span-2 lg:row-span-2")}>
      <article className="flex h-full flex-col">
        <SmartImage
          src={item.imageUrl}
          alt=""
          aspect="16/9"
          srcSetWidths={featured ? [480, 800, 1200] : [320, 480, 640]}
          sizes={featured ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"}
          priority={featured}
          zoomOnHover
          className="w-full"
        />
        <div className={cn("flex flex-1 flex-col gap-2", featured ? "p-5 sm:p-6" : "p-4")}>
          <p className="text-sm text-ink-muted">
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            {item.author && <> | {item.author}</>}
          </p>
          <h3
            className={cn(
              "font-display font-bold leading-snug text-navy",
              featured ? "text-2xl sm:text-3xl lg:line-clamp-4" : "line-clamp-3 text-base",
            )}
          >
            {item.title}
          </h3>
          {featured && item.subtitle && <p className="line-clamp-3 text-ink-muted">{item.subtitle}</p>}
        </div>
      </article>
    </Card>
  );
}

export function NewsBento() {
  const { data, isPending, isError, refetch } = useLatestNews(5);
  return (
    <Container>
      <Section
        title="Aktualności"
        eyebrow="Z archidiecezji"
        action={{ label: "Wszystkie aktualności", to: paths.news }}
      >
        {isPending ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Ładowanie aktualności">
            <Skeleton className="h-72 rounded-card md:col-span-2 lg:row-span-2 lg:h-full" />
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-52 rounded-card" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Nie udało się wczytać aktualności." onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <EmptyState icon="newspaper" title="Brak aktualności" />
        ) : (
          <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.map((n, i) => (
              <RevealItem key={n.id} className={cn("flex flex-col", i === 0 && "md:col-span-2 lg:row-span-2")}>
                <NewsCard item={n} featured={i === 0} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Section>
    </Container>
  );
}
