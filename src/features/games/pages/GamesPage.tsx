import { useMetaDescription, usePageTitle } from "@/lib/seo";
import { Container, PageHeader, RevealGroup, RevealItem } from "@/ui";
import { GAMES } from "../catalog";
import { GameCard } from "../components/GameCard";

export function GamesPage() {
  usePageTitle("Gry chrześcijańskie");
  useMetaDescription(
    "Małe, zabawne gry biblijne: Dawid i Goliat, ucieczka przez Morze Czerwone, Arka Noego, rytmiczne Mury Jerycha i karcianka Walka o duszę.",
  );
  return (
    <Container className="pb-16">
      <PageHeader
        eyebrow="Pograj i pomódl się"
        title="Gry"
        accent="dla ducha"
        description="Małe, zabawne gry biblijne na przerwę, na wieczór i na wzmocnienie wiary. Działają na telefonie (dotyk) i na komputerze (klawiatura)."
      />
      <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => (
          <RevealItem key={g.slug} as="li">
            <GameCard game={g} />
          </RevealItem>
        ))}
      </RevealGroup>
      <p className="mt-10 max-w-2xl text-ink-muted">
        Każda gra kończy się krótkim „Słowem na drogę” — fragmentem Pisma Świętego, myślą i
        modlitwą. Bo po dobrej zabawie warto na chwilę zatrzymać się z Panem Bogiem.
      </p>
    </Container>
  );
}
