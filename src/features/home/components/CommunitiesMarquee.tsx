import { Link } from "react-router";
import { paths } from "@/app/routes";
import { usePartners } from "@/features/communities/api";
import { Avatar, Container, ErrorState, Marquee, Section, Skeleton } from "@/ui";

export function CommunitiesMarquee() {
  const { data, isPending, isError, refetch } = usePartners();
  return (
    <Container>
      <Section
        title="Społeczności"
        eyebrow="Wspólnoty i organizacje"
        action={{ label: "Wszystkie społeczności", to: paths.communities }}
      >
        {isPending ? (
          <Skeleton className="h-16 rounded-pill" />
        ) : isError ? (
          <ErrorState message="Nie udało się wczytać społeczności." onRetry={() => void refetch()} />
        ) : data.length === 0 ? null : (
          <Marquee label="Społeczności archidiecezji" duration={45}>
            {data.map((p) => (
              <Link
                key={p.id}
                to={paths.communities}
                className="flex min-h-14 shrink-0 items-center gap-3 rounded-pill bg-surface py-2 pl-2 pr-5 font-bold text-navy no-underline shadow-card transition-transform hover:-translate-y-0.5"
              >
                <Avatar name={p.name} src={p.imageUrl ?? undefined} size={40} />
                {p.name}
              </Link>
            ))}
          </Marquee>
        )}
      </Section>
    </Container>
  );
}
