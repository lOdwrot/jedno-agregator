import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { AnimatePresence } from "motion/react";
import type { Partner } from "@/data/schemas";
import { usePageTitle } from "@/lib/seo";
import {
  Button,
  ChipGroup,
  Container,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Reveal,
  Skeleton,
} from "@/ui";
import { filterPartners, usePartnerCategories, usePartners } from "../api";
import { CommunityCard } from "../components/CommunityCard";
import { CommunityDialog } from "../components/CommunityDialog";
import { LogoOrbit } from "../components/LogoOrbit";
import { pluralCommunities } from "../links";

const PARAM = "kategoria";

export function CommunitiesPage() {
  usePageTitle("Społeczność");
  const [params, setParams] = useSearchParams();
  const category = params.get(PARAM);
  const all = usePartners();
  const cats = usePartnerCategories();
  // `selected` is kept after closing so the dialog content survives its exit animation.
  const [selected, setSelected] = useState<Partner | null>(null);
  const [open, setOpen] = useState(false);

  const visible = useMemo(() => filterPartners(all.data ?? [], category), [all.data, category]);
  const orbit = useMemo(() => (all.data ?? []).filter((p) => p.imageUrl).slice(0, 8), [all.data]);

  const setCategory = (value: string | null) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(PARAM, value);
        else next.delete(PARAM);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <Container className="pb-16">
      <div className="flex items-center justify-between gap-6">
        <PageHeader
          title="Społeczność"
          description="Organizacje i wspólnoty Archidiecezji Gdańskiej"
          className="min-w-0 flex-1"
        />
        <LogoOrbit partners={orbit} />
      </div>

      {all.isPending ? (
        <LoadingState label="Ładowanie społeczności…">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-48 rounded-card" />
            ))}
          </div>
        </LoadingState>
      ) : all.isError ? (
        <ErrorState message="Nie udało się pobrać listy społeczności." onRetry={() => void all.refetch()} />
      ) : (
        <>
          {(cats.data?.length ?? 0) > 0 && (
            <Reveal className="mb-4">
              <ChipGroup
                label="Kategoria"
                allowClear
                value={category}
                onChange={setCategory}
                options={(cats.data ?? []).map((c) => ({ value: c, label: c }))}
              />
            </Reveal>
          )}
          <p aria-live="polite" role="status" className="mb-4 text-sm font-semibold text-ink-muted">
            {visible.length} {pluralCommunities(visible.length)}
            {category ? ` w kategorii „${category}”` : ""}
          </p>
          {visible.length === 0 ? (
            <EmptyState
              title="Brak społeczności"
              description="W tej kategorii nic jeszcze nie ma."
              icon="users"
              action={category ? <Button variant="soft" onClick={() => setCategory(null)}>Pokaż wszystkie</Button> : undefined}
            />
          ) : (
            <ul className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((p) => (
                  <CommunityCard
                    key={p.id}
                    partner={p}
                    onOpen={(x) => {
                      setSelected(x);
                      setOpen(true);
                    }}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </>
      )}
      <CommunityDialog partner={selected} open={open} onClose={() => setOpen(false)} />
    </Container>
  );
}
