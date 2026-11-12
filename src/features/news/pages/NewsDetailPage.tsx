import { Link, useParams } from "react-router";
import { Badge, Button, Container, EmptyState, ErrorState, Heading, Icon, LoadingState, RichText, ScrollProgress, ShareButton, Skeleton, SmartImage, Text } from "@/ui";
import { paths } from "@/app/routes";
import { formatDate } from "@/lib/dates";
import { usePageTitle } from "@/lib/seo";
import { useNewsItem } from "../api";
import { LinkedEventCta } from "../components/LinkedEventCta";
import { RelatedNews } from "../components/RelatedNews";
import { formatReadingTime } from "../utils";

function BackLink() {
  return (
    <Link
      to={paths.news}
      viewTransition
      className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 font-bold text-navy hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink"
    >
      <Icon name="chevronLeft" size={20} />
      Aktualności
    </Link>
  );
}

export function NewsDetailPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const { data: item, isPending, isError, refetch } = useNewsItem(numericId);
  usePageTitle(item?.title ?? "Aktualność");

  return (
    <Container className="pb-16 pt-4 sm:pt-8">
      <BackLink />
      {isPending && (
        <LoadingState label="Ładowanie artykułu…" className="mt-4">
          <Skeleton className="aspect-video w-full rounded-card" />
          <Skeleton className="mt-6 h-10 w-3/4" />
          <Skeleton className="mt-4 h-5 w-full" />
        </LoadingState>
      )}
      {isError && <ErrorState onRetry={() => void refetch()} className="mt-4" />}
      {!isPending && !isError && !item && (
        <EmptyState
          className="mt-4"
          title="Nie znaleziono aktualności"
          description="Ten artykuł mógł zostać usunięty lub adres jest nieprawidłowy."
          action={<Button to={paths.news} variant="navy">Wróć do aktualności</Button>}
        />
      )}
      {item && (
        <>
          <ScrollProgress />
          <article className="mt-4">
            {item.imageUrl && (
              <div className="mx-auto max-w-5xl overflow-hidden rounded-card shadow-card">
                <SmartImage
                  src={item.imageUrl}
                  alt=""
                  aspect="16/9"
                  srcSetWidths={[640, 960, 1280, 1600]}
                  sizes="(min-width:1024px) 1024px, 100vw"
                  priority
                  style={{ viewTransitionName: `news-${item.id}` }}
                />
              </div>
            )}
            <div className="mx-auto mt-8 max-w-[70ch]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
                <time dateTime={item.date}>{formatDate(item.date)}</time>
                {item.author && <span aria-hidden="true">|</span>}
                {item.author && <span>{item.author}</span>}
                <span aria-hidden="true">·</span>
                <span>{formatReadingTime(item.html)}</span>
                {item.tag && <Badge tone={item.isEventAlias ? "accent" : "neutral"}>{item.tag}</Badge>}
              </div>
              <Heading level={1} size="2xl" className="mt-3 text-balance">
                {item.title}
              </Heading>
              {item.subtitle && (
                <Text variant="lead" className="mt-4 font-serif text-2xl italic text-ink-muted">
                  {item.subtitle}
                </Text>
              )}
              <RichText html={item.html} className="mt-8" />
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
                <ShareButton title={item.title} text={item.subtitle || undefined} leftIcon={<Icon name="share" size={20} />}>
                  Udostępnij
                </ShareButton>
              </div>
              {item.linkedEventId !== null && (
                <div className="mt-8">
                  <LinkedEventCta eventId={item.linkedEventId} />
                </div>
              )}
            </div>
          </article>
          <div className="mt-16">
            <RelatedNews currentId={item.id} />
          </div>
        </>
      )}
    </Container>
  );
}
