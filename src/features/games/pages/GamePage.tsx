import { lazy, Suspense, type ComponentType } from "react";
import { useParams } from "react-router";
import { paths } from "@/app/routes";
import { NotFoundPage } from "@/app/NotFoundPage";
import { useMetaDescription, usePageTitle } from "@/lib/seo";
import { Container, Icon, Link, LoadingState, PageHeader, Skeleton } from "@/ui";
import { findGame, GAMES, type GameSlug } from "../catalog";
import { GameCard } from "../components/GameCard";
import { HowToPlay } from "../components/HowToPlay";
import { VerseCard } from "../components/VerseCard";

const GAME_COMPONENTS: Record<GameSlug, ComponentType> = {
  "dawid-i-goliat": lazy(() =>
    import("../david/DavidGame").then((m) => ({ default: m.DavidGame })),
  ),
  "morze-czerwone": lazy(() =>
    import("../redsea/RedSeaGame").then((m) => ({ default: m.RedSeaGame })),
  ),
  "arka-noego": lazy(() => import("../ark/ArkGame").then((m) => ({ default: m.ArkGame }))),
};

export function GamePage() {
  const { slug } = useParams();
  const game = findGame(slug);
  usePageTitle(game ? `${game.title} ${game.accent} — gra` : undefined);
  useMetaDescription(game?.tagline);
  if (!game) return <NotFoundPage />;
  const Game = GAME_COMPONENTS[game.slug];
  const others = GAMES.filter((g) => g.slug !== game.slug);

  return (
    <Container className="pb-16">
      <Link to={paths.games} quiet className="mt-6 inline-flex min-h-11 items-center gap-1">
        <Icon name="chevronLeft" size={18} />
        Wszystkie gry
      </Link>
      <PageHeader
        title={game.title}
        accent={game.accent}
        description={game.tagline}
        className="pt-2 sm:pt-4"
      />

      <Suspense
        fallback={
          <LoadingState label="Ładowanie gry…">
            <Skeleton className="aspect-video w-full rounded-card" />
          </LoadingState>
        }
      >
        <Game />
      </Suspense>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <HowToPlay game={game} />
        <VerseCard game={game} />
      </div>

      <section aria-labelledby="more-games" className="mt-12">
        <h2 id="more-games" className="mb-4 font-display text-2xl font-extrabold text-navy">
          Zagraj też w…
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {others.map((g) => (
            <GameCard key={g.slug} game={g} as="li" headingLevel={3} />
          ))}
        </ul>
      </section>
    </Container>
  );
}
