import { getCard } from "../data/cards";
import type { Game } from "../engine/state";

/** Duel log and the "how this temptation works" corner. */
export function DuelSidebar({ g, lesson }: { g: Game; lesson: string | null }) {
  const l = lesson ? getCard(lesson) : null;
  const info = l && "lesson" in l ? l.lesson : undefined;
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24" aria-label="Przebieg pojedynku">
      {l && info && (
        <section
          aria-labelledby="soul-lesson"
          className="rounded-card bg-navy p-4 text-white shadow-lift"
        >
          <h3 id="soul-lesson" className="font-display text-base font-extrabold text-logo-yellow">
            <span aria-hidden="true">{l.emoji} </span>
            Rozpoznaj pokusę: {l.name}
          </h3>
          <p className="mt-2 text-sm">
            <strong>Jak kusi:</strong> {info.tempts}
          </p>
          <p className="mt-2 text-sm">
            <strong>Jak się bronić:</strong> {info.defend}
          </p>
        </section>
      )}
      <section aria-labelledby="soul-log" className="rounded-card bg-surface p-4 shadow-card">
        <h3 id="soul-log" className="text-sm font-extrabold text-navy">
          Przebieg walki
        </h3>
        <ol
          className="mt-2 flex flex-col gap-1 text-sm text-ink"
          aria-label="Ostatnie zdarzenia, od najnowszego"
        >
          {g.log
            .slice(-8)
            .map((m, i) => ({ m, i }))
            .reverse()
            .map(({ m, i }) => (
              <li key={`${g.log.length}-${i}`} className="border-b border-line pb-1 last:border-0">
                {m}
              </li>
            ))}
        </ol>
      </section>
    </aside>
  );
}
