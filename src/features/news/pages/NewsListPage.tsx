import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Button,
  Container,
  EmptyState,
  ErrorState,
  Icon,
  PageHeader,
  usePrefersReducedMotion,
} from "@/ui";
import { usePageTitle } from "@/lib/seo";
import { useNewsAuthors, useNewsList } from "../api";
import { NewsCard } from "../components/NewsCard";
import { NewsFilters } from "../components/NewsFilters";
import { NewsGridSkeleton } from "../components/NewsGridSkeleton";
import { PAGE_SIZE, newsCountLabel, visibleSlice } from "../utils";

export function NewsListPage() {
  usePageTitle("Aktualności");
  const [params, setParams] = useSearchParams();
  const author = params.get("autor");
  const reduce = usePrefersReducedMotion();
  const { data, isPending, isError, refetch } = useNewsList({ author });
  const { data: authors = [] } = useNewsAuthors();
  const [shown, setShown] = useState<{ author: string | null; count: number }>({
    author,
    count: PAGE_SIZE,
  });
  const visible = shown.author === author ? shown.count : PAGE_SIZE;
  const focusIndex = useRef<number | null>(null);
  const grid = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (focusIndex.current === null) return;
    grid.current?.querySelector<HTMLElement>(`[data-news-index="${focusIndex.current}"]`)?.focus();
    focusIndex.current = null;
  }, [visible]);

  const setAuthor = (value: string | null) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set("autor", value);
        else next.delete("autor");
        return next;
      },
      { replace: true },
    );
  };

  const items = data ? visibleSlice(data, visible) : [];
  const total = data?.length ?? 0;

  return (
    <Container className="pb-16">
      <PageHeader
        title="Aktualności"
        accent="dla Ciebie"
        description="Najnowsze wiadomości, relacje i zaproszenia od wspólnot Archidiecezji Gdańskiej."
        actions={<NewsFilters authors={authors} author={author} onChange={setAuthor} />}
      />
      <p className="sr-only" role="status" aria-live="polite">
        {data ? newsCountLabel(total) : ""}
      </p>

      {isPending && <NewsGridSkeleton />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {data && total === 0 && (
        <EmptyState
          title="Brak aktualności"
          description={
            author ? `Nie ma jeszcze aktualności autora: ${author}.` : "Zajrzyj tu wkrótce."
          }
          action={
            author ? (
              <Button variant="soft" onClick={() => setAuthor(null)}>
                Wyczyść filtr
              </Button>
            ) : undefined
          }
        />
      )}
      {data && total > 0 && (
        <>
          <p aria-hidden="true" className="mb-4 text-sm text-ink-muted">
            {author ? `${author} · ` : ""}
            {total} {total === 1 ? "aktualność" : "aktualności"}
          </p>
          <ul
            ref={grid}
            className="grid list-none grid-flow-dense gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((n, i) => (
                <motion.li
                  key={n.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.5,
                    delay: reduce ? 0 : (i % PAGE_SIZE) * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={i === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}
                >
                  <NewsCard item={n} index={i} featured={i === 0} priority={i < 2} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {items.length < total && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="navy"
                size="lg"
                rightIcon={<Icon name="chevronDown" size={20} />}
                onClick={() => {
                  focusIndex.current = items.length;
                  setShown({ author, count: visible + PAGE_SIZE });
                }}
              >
                Pokaż więcej ({total - items.length})
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
