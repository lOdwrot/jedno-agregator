import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import {
  ELEMENT_INFO,
  ENERGY_LABEL,
  FINISH_BONUS,
  FINISH_LABEL,
  RARITY_LABEL,
  RARITY_SYMBOL,
  type CardDef,
  type Finish,
} from "../data/types";
import { ELEMENT_ART, FINISH_FRAME } from "./styles";

const KIND_LABEL: Record<CardDef["kind"], string> = {
  character: "Postać",
  item: "Przedmiot",
  supporter: "Pomocnik (1 na turę)",
  place: "Miejsce",
  energy: "Energia",
};

/** Full face of a card: art, HP, attacks, weakness, retreat, rarity and print finish. */
export function CardFace({
  cardId,
  finish = "plain",
  className,
  showLesson = false,
}: {
  cardId: string;
  finish?: Finish;
  className?: string;
  showLesson?: boolean;
}) {
  const c = getCard(cardId);
  const dark = c.side === "demons";
  const bonus = FINISH_BONUS[finish];
  const energy = ENERGY_LABEL[c.side];
  const art =
    c.kind === "character" ? ELEMENT_ART[c.element] : dark ? ELEMENT_ART.pycha : ELEMENT_ART.slowo;
  const muted = dark ? "text-white/80" : "text-ink-muted";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card shadow-lift",
        FINISH_FRAME[finish],
        className,
      )}
    >
      <article
        className={cn(
          "flex h-full flex-col gap-2 rounded-[0.8rem] p-3",
          dark ? "bg-navy text-white" : "bg-surface text-ink",
        )}
        aria-label={`Karta: ${c.name}`}
      >
        <header className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={cn("text-xs font-bold tracking-wide uppercase", muted)}>
              {KIND_LABEL[c.kind]}
              {c.kind === "character" &&
                c.evolvesFrom &&
                ` · rozwój z: ${getCard(c.evolvesFrom).name}`}
            </p>
            <h3
              className={cn(
                "font-display text-lg leading-tight font-extrabold",
                dark ? "text-white" : "text-navy",
              )}
            >
              {c.name}
            </h3>
            {c.kind === "character" && c.subtitle && (
              <p className={cn("text-xs italic", muted)}>{c.subtitle}</p>
            )}
          </div>
          {c.kind === "character" && (
            <p className="shrink-0 text-right font-display text-lg font-extrabold">
              <span className="sr-only">Wytrwałość </span>
              {c.hp + bonus.hp}
              <span aria-hidden="true" className="text-sm">
                {" "}
                ♥
              </span>
            </p>
          )}
        </header>

        <div
          aria-hidden="true"
          className={cn(
            "relative grid h-24 place-items-center overflow-hidden rounded-xl bg-gradient-to-br",
            art,
          )}
        >
          <span className="text-6xl drop-shadow-lg">{c.emoji}</span>
          {finish !== "plain" && <span className="soul-shine absolute inset-0" />}
        </div>

        {c.kind === "character" ? (
          <>
            <p className={cn("text-xs font-bold", muted)}>
              {ELEMENT_INFO[c.element].emoji} {ELEMENT_INFO[c.element].label}
              {c.weakness &&
                ` · słabość: ${ELEMENT_INFO[c.weakness].emoji} ${ELEMENT_INFO[c.weakness].label} ×2`}
            </p>
            {c.ability && (
              <p className="rounded-lg bg-accent-soft p-2 text-sm text-ink">
                <strong className="text-accent-ink">Moc: {c.ability.name}.</strong> {c.ability.text}
              </p>
            )}
            <ul className="flex flex-col gap-1.5">
              {c.attacks.map((a) => (
                <li
                  key={a.name}
                  className={cn(
                    "rounded-lg p-2 text-sm",
                    dark ? "bg-white/10" : "bg-surface-muted",
                  )}
                >
                  <p className="flex items-center justify-between gap-2 font-bold">
                    <span>
                      <span aria-label={`koszt ${a.cost} ${energy.name}`}>
                        {energy.emoji.repeat(a.cost)}
                      </span>{" "}
                      {a.name}
                    </span>
                    {a.damage > 0 && (
                      <span className="font-display text-base">{a.damage + bonus.damage}</span>
                    )}
                  </p>
                  {a.text && <p className={cn("text-xs", muted)}>{a.text}</p>}
                </li>
              ))}
            </ul>
            <p className={cn("text-xs", muted)}>
              Wycofanie: {c.retreat ? energy.emoji.repeat(c.retreat) : "bez kosztu"} ·{" "}
              {c.souls === 2 ? "pokonana daje 2 dusze" : "pokonana daje 1 duszę"}
            </p>
          </>
        ) : (
          <p className="text-sm">{c.text}</p>
        )}

        <p className={cn("text-xs italic", muted)}>„{c.flavor}”</p>
        {showLesson && "lesson" in c && c.lesson && (
          <div className="flex flex-col gap-1 rounded-lg bg-white/10 p-2 text-xs">
            <p>
              <strong className="text-logo-yellow">Jak kusi:</strong> {c.lesson.tempts}
            </p>
            <p>
              <strong className="text-logo-yellow">Jak się bronić:</strong> {c.lesson.defend}
            </p>
          </div>
        )}
        <footer
          className={cn("mt-auto flex items-center justify-between text-xs font-bold", muted)}
        >
          <span>
            <span aria-hidden="true">{RARITY_SYMBOL[c.rarity]} </span>
            {RARITY_LABEL[c.rarity]}
          </span>
          <span>
            {finish === "gilded" ? "✦ " : finish === "stained" ? "❖ " : ""}
            {FINISH_LABEL[finish]}
            {(bonus.hp > 0 || bonus.damage > 0) && c.kind === "character" && (
              <>
                {" "}
                (+{bonus.hp} ♥{bonus.damage ? `, +${bonus.damage} obr.` : ""})
              </>
            )}
          </span>
        </footer>
      </article>
    </div>
  );
}
