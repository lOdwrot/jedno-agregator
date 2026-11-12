import { NavLink, useParams } from "react-router";
import { Button, Card, Container, EmptyState, ErrorState, Heading, Icon, LoadingState, PageHeader, RichText, Skeleton, Text } from "@/ui";
import { paths } from "@/app/routes";
import { cn } from "@/lib/cn";
import { usePageTitle } from "@/lib/seo";
import type { Info } from "@/data/schemas";
import { useInfo, useInfos } from "../api";
import { findEmail } from "../utils";

function ContactCard({ info }: { info: Info }) {
  const email = findEmail(info.html);
  return (
    <Card className="mt-8 overflow-hidden border-l-4 border-accent p-6 sm:p-8">
      <Heading level={2} size="md">
        {info.formTitle ?? "Napisz do nas"}
      </Heading>
      <Text className="mt-2 text-ink-muted">
        {email
          ? "Formularz kontaktowy działa w aplikacji Jedno. Na stronie możesz napisać do nas wiadomość e-mail."
          : "Formularz kontaktowy dostępny jest w aplikacji Jedno."}
      </Text>
      {email && (
        <Button
          href={`mailto:${email}?subject=${encodeURIComponent("Wiadomość ze strony Jedno")}`}
          variant="solid"
          size="lg"
          className="mt-5"
          leftIcon={<Icon name="mail" size={20} />}
        >
          Napisz do nas: {email}
        </Button>
      )}
    </Card>
  );
}

function InfoNav({ current }: { current: string }) {
  const { data } = useInfos();
  if (!data || data.length < 2) return null;
  return (
    <nav aria-label="Inne strony informacyjne" className="lg:sticky lg:top-28">
      <Heading level={2} size="sm" className="mb-3">
        Zobacz także
      </Heading>
      <ul className="flex list-none flex-col gap-2 p-0">
        {data.map((i) => (
          <li key={i.id}>
            <NavLink
              to={paths.info(i.slug)}
              aria-current={i.slug === current ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center justify-between gap-2 rounded-card px-4 py-2 font-bold shadow-card transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink",
                i.slug === current ? "bg-navy text-white" : "bg-surface text-navy hover:bg-accent-soft",
              )}
            >
              {i.title}
              <Icon name="arrowRight" size={18} />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function InfoPage() {
  const { slug = "" } = useParams();
  const { data: info, isPending, isError, refetch } = useInfo(slug);
  usePageTitle(info?.title ?? "Informacje");

  if (isPending)
    return (
      <Container className="py-12">
        <LoadingState label="Ładowanie strony…">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="mt-6 h-40 w-full rounded-card" />
        </LoadingState>
      </Container>
    );
  if (isError)
    return (
      <Container className="py-12">
        <ErrorState onRetry={() => void refetch()} />
      </Container>
    );
  if (!info)
    return (
      <Container className="py-12">
        <EmptyState
          title="Nie znaleziono strony"
          description="Sprawdź adres lub wróć na stronę główną."
          action={<Button to={paths.home} variant="navy">Strona główna</Button>}
        />
      </Container>
    );

  return (
    <Container className="pb-16">
      <PageHeader title={info.title} eyebrow="Informacje" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
        <div className="min-w-0">
          <Card className="p-6 sm:p-10">
            <RichText html={info.html} className="max-w-[70ch]" />
          </Card>
          {info.hasForm && <ContactCard info={info} />}
        </div>
        <InfoNav current={info.slug} />
      </div>
    </Container>
  );
}
