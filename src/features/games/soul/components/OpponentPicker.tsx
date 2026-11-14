import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Badge, Button, Icon, useMediaQuery, usePrefersReducedMotion } from "@/ui";
import { OPPONENTS, type Opponent } from "../data/opponents";

interface Props {
  beaten: string[];
  talents: number;
  problems: string[];
  onFight: (o: Opponent) => void;
  /** Practice duel (opponents with an entry fee): free, but no talents, boosters or record. */
  onTrain: (o: Opponent) => void;
  onEditDeck: () => void;
}

/** Choose who to fight — each opponent is introduced by a letter from an old demon. */
export function OpponentPicker({ beaten, talents, problems, onFight, onTrain, onEditDeck }: Props) {
  const [pick, setPick] = useState<Opponent>(OPPONENTS[0]!);
  const actionsRef = useRef<HTMLDivElement>(null);
  const scrollPending = useRef(false);
  const reduced = usePrefersReducedMotion();
  const twoColumns = useMediaQuery("(min-width: 64rem)");

  // On phones the letter pushes the fight button below the fold — after picking an opponent,
  // bring the "Stań do walki" area into view.
  useEffect(() => {
    if (!scrollPending.current) return;
    scrollPending.current = false;
    const el = actionsRef.current;
    if (!el || twoColumns) return;
    const r = el.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= window.innerHeight) return;
    el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }, [pick, reduced, twoColumns]);

  const choose = (o: Opponent) => {
    scrollPending.current = true;
    setPick(o);
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
      <ul className="flex flex-col gap-3" aria-label="Przeciwnicy">
        {OPPONENTS.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              aria-pressed={pick.id === o.id}
              onClick={() => choose(o)}
              className={cn(
                "flex w-full items-center gap-3 rounded-card bg-surface p-3 text-left shadow-card transition-shadow",
                pick.id === o.id ? "ring-2 ring-accent" : "hover:shadow-lift",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-full text-2xl",
                  o.theme === "infernal" ? "bg-hell-950 ring-2 ring-ember" : "bg-navy",
                )}
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
                          : o.difficulty === "trudny"
                            ? "danger"
                            : "dangerSolid"
                    }
                  >
                    {o.difficulty}
                  </Badge>
                  <Badge>wygrana: {o.reward.win} talentów</Badge>
                  {o.fee ? <Badge tone="accentSolid">🪙 wpisowe {o.fee}</Badge> : null}
                  {o.prize && <Badge tone="accent">🎁 + booster</Badge>}
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
        {pick.fee ? (
          <div className="mt-4 flex items-center gap-3 rounded-card border-2 border-accent bg-accent-soft p-3 text-ink">
            <span aria-hidden="true" className="text-3xl">
              🪙
            </span>
            <p className="text-sm">
              <strong className="block font-display text-lg text-navy">
                Wpisowe: {pick.fee} talentów
              </strong>
              Płatne przy wyzwaniu, nie wraca po porażce. Masz {talents} → po opłacie{" "}
              {Math.max(0, talents - pick.fee)}. Za zwycięstwo — oprócz talentów — darmowy booster
              (szanse w sekcji „Boostery za zwycięstwo” poniżej).
            </p>
          </div>
        ) : null}
        <div ref={actionsRef} className="scroll-mt-24">
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
            <>
              {talents < (pick.fee ?? 0) ? (
                <p className="mt-4 rounded-card bg-danger/12 p-3 text-sm text-danger">
                  Brakuje {(pick.fee ?? 0) - talents} talentów na wpisowe. Pokonaj łatwiejszych
                  przeciwników, żeby je zebrać — albo najpierw potrenuj.
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                {talents >= (pick.fee ?? 0) && (
                  <Button
                    size="lg"
                    onClick={() => onFight(pick)}
                    leftIcon={<Icon name="play" size={18} />}
                  >
                    {pick.fee ? `Stań do walki (−${pick.fee} talentów)` : "Stań do walki"}
                  </Button>
                )}
                {pick.fee ? (
                  <Button size="lg" variant="outline" onClick={() => onTrain(pick)}>
                    🎯 Trenuj (za darmo)
                  </Button>
                ) : null}
              </div>
              {pick.fee ? (
                <p className="mt-2 text-sm text-ink-muted">
                  Trening: bez wpisowego, ale też bez talentów, boostera i wpisu do statystyk —
                  tylko nauka gry przeciw tej talii.
                </p>
              ) : null}
            </>
          )}
        </div>
      </article>
    </div>
  );
}
