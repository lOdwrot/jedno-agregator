import { useState } from "react";
import { cn } from "@/lib/cn";
import { Badge, Button, Icon } from "@/ui";
import { OPPONENTS, type Opponent } from "../data/opponents";

interface Props {
  beaten: string[];
  problems: string[];
  onFight: (o: Opponent) => void;
  onEditDeck: () => void;
}

/** Choose who to fight — each opponent is introduced by a letter from an old demon. */
export function OpponentPicker({ beaten, problems, onFight, onEditDeck }: Props) {
  const [pick, setPick] = useState<Opponent>(OPPONENTS[0]!);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
      <ul className="flex flex-col gap-3" aria-label="Przeciwnicy">
        {OPPONENTS.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              aria-pressed={pick.id === o.id}
              onClick={() => setPick(o)}
              className={cn(
                "flex w-full items-center gap-3 rounded-card bg-surface p-3 text-left shadow-card transition-shadow",
                pick.id === o.id ? "ring-2 ring-accent" : "hover:shadow-lift",
              )}
            >
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-full bg-navy text-2xl"
              >
                {o.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display font-extrabold text-navy">{o.name}</span>
                <span className="mt-1 flex flex-wrap gap-1">
                  <Badge
                    tone={
                      o.difficulty === "łatwy"
                        ? "neutral"
                        : o.difficulty === "średni"
                          ? "accent"
                          : "danger"
                    }
                  >
                    {o.difficulty}
                  </Badge>
                  <Badge>wygrana: {o.reward.win} talentów</Badge>
                  {beaten.includes(o.id) && <Badge tone="navy">pokonani ✓</Badge>}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <article
        aria-labelledby="soul-letter"
        className="rounded-card bg-surface-muted p-5 shadow-card sm:p-6"
      >
        <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">
          Przechwycony list z dołu
        </p>
        <h3 id="soul-letter" className="mt-1 font-serif text-2xl text-navy italic">
          {pick.letter.greeting}
        </h3>
        {pick.letter.body.map((p) => (
          <p key={p.slice(0, 24)} className="mt-3 font-serif text-lg leading-snug text-ink">
            {p}
          </p>
        ))}
        <p className="mt-3 text-right font-serif text-lg text-ink italic">
          {pick.letter.signature}
        </p>
        <p className="mt-4 text-sm text-ink-muted">
          Przegrana też coś daje: {pick.reward.loss} talentów + 10 za każdą ocaloną duszę. Po każdym
          pojedynku możesz otworzyć jeden booster.
        </p>
        {problems.length > 0 ? (
          <div className="mt-4 rounded-card bg-danger/12 p-3 text-sm text-danger">
            {problems.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <Button variant="link" className="mt-1" onClick={onEditDeck}>
              Popraw talię
            </Button>
          </div>
        ) : (
          <Button
            className="mt-4"
            size="lg"
            onClick={() => onFight(pick)}
            leftIcon={<Icon name="play" size={18} />}
          >
            Stań do walki
          </Button>
        )}
      </article>
    </div>
  );
}
