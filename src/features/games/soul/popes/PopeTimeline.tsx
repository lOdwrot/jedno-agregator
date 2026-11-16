import { cn } from "@/lib/cn";
import { getCard } from "../data/cards";
import { CardArt } from "../components/CardArt";
import { POPE_STORIES } from "./stories";

/**
 * 2000 years on one string of beads: a round portrait for every pope in the game, from St Peter
 * to Francis. Each bead opens that pope's story; the ones already read carry a ✓.
 */
export function PopeTimeline({
  current,
  read,
  onSelect,
}: {
  current: string;
  read: readonly string[];
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Inni papieże w grze" className="-mx-1 overflow-x-auto pb-2">
      <ol className="relative flex min-w-max items-start gap-1 px-1 pt-2 sm:justify-center">
        <span
          aria-hidden="true"
          className="absolute top-8 right-6 left-6 h-1 rounded-full bg-gradient-to-r from-logo-yellow via-accent to-logo-red"
        />
        {POPE_STORIES.map((s) => {
          const on = s.id === current;
          const name = getCard(s.id).name;
          return (
            <li key={s.id} className="relative flex w-14 flex-col items-center">
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-current={on ? "true" : undefined}
                aria-label={`${name}, od ${s.year} r.${read.includes(s.id) ? " (przeczytane)" : ""}`}
                className={cn(
                  "relative grid size-12 place-items-center overflow-hidden rounded-full bg-navy-600 shadow-card ring-3 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy motion-safe:hover:scale-110",
                  on ? "scale-110 ring-logo-yellow" : "ring-surface",
                )}
              >
                <CardArt cardId={s.id} emojiClass="text-2xl" />
              </button>
              {read.includes(s.id) && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 right-0 grid size-5 place-items-center rounded-full bg-success text-xs font-extrabold text-white ring-2 ring-surface"
                >
                  ✓
                </span>
              )}
              <span
                aria-hidden="true"
                className={cn("mt-2 text-xs font-bold", on ? "text-accent-ink" : "text-ink-muted")}
              >
                {s.year}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
