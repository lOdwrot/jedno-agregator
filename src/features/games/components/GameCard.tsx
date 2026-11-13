import { paths } from "@/app/routes";
import { cn } from "@/lib/cn";
import { Badge, Card, Heading, Icon } from "@/ui";
import type { GameInfo } from "../catalog";

/** Colourful tile linking to a game. */
export function GameCard({
  game,
  headingLevel = 2,
  as = "div",
}: {
  game: GameInfo;
  headingLevel?: 2 | 3;
  as?: "div" | "li";
}) {
  return (
    <Card as={as} className="h-full" to={paths.game(game.slug)} tilt>
      <div
        className={cn(
          "relative grid h-40 place-items-center overflow-hidden bg-gradient-to-br sm:h-48",
          game.gradient,
        )}
      >
        <span
          aria-hidden="true"
          className="text-7xl drop-shadow-lg transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none sm:text-8xl"
        >
          {game.emoji}
        </span>
        <Badge tone="navy" className="absolute top-3 left-3">
          ok. {game.minutes} min
        </Badge>
      </div>
      <div className="flex flex-col gap-2 p-5">
        <Heading level={headingLevel} size="md">
          {game.title}{" "}
          <span className="font-serif font-normal text-accent-ink italic">{game.accent}</span>
        </Heading>
        <p className="text-ink-muted">{game.tagline}</p>
        <p className="mt-1 inline-flex items-center gap-1 font-bold text-accent-ink">
          Zagraj <Icon name="arrowRight" size={18} />
        </p>
      </div>
    </Card>
  );
}
