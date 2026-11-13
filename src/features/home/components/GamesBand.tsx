import { paths } from "@/app/routes";
import { GAMES } from "@/features/games/catalog";
import { GameCard } from "@/features/games/components/GameCard";
import { Container, Section } from "@/ui";

/** Home teaser for the Bible mini-games. */
export function GamesBand() {
  return (
    <Container>
      <Section
        eyebrow="Na przerwę"
        title="Gry dla ducha"
        action={{ label: "Wszystkie gry", to: paths.games }}
      >
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {GAMES.map((g) => (
            <GameCard key={g.slug} game={g} as="li" headingLevel={3} />
          ))}
        </ul>
      </Section>
    </Container>
  );
}
